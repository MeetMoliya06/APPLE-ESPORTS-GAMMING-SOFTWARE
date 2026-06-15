using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AppleEsportsErp.Application.DTOs.PcStatus;
using AppleEsportsErp.Application.Exceptions;
using AppleEsportsErp.Application.Interfaces;
using AppleEsportsErp.Domain.Entities;
using AppleEsportsErp.Domain.Enums;
using AppleEsportsErp.Infrastructure.Data;

namespace AppleEsportsErp.Infrastructure.Services;

public class PcStatusService : IPcStatusService
{
    private readonly AppDbContext _db;
    private readonly IHubNotificationService _hubNotifier;
    private readonly ILogger<PcStatusService> _logger;

    public PcStatusService(AppDbContext db, IHubNotificationService hubNotifier, ILogger<PcStatusService> logger)
    {
        _db = db;
        _hubNotifier = hubNotifier;
        _logger = logger;
    }

    public async Task<IEnumerable<PcStatusDto>> GetBranchPcStatusesAsync(Guid branchId)
    {
        var pcs = await _db.Pcs
            .AsNoTracking()
            .Include(p => p.PricingProfile)
            .Where(p => p.BranchId == branchId && !p.IsDeleted)
            .OrderBy(p => p.PcNumber)
            .ToListAsync();

        var now = DateTimeOffset.UtcNow;

        // Fetch active sessions for these PCs
        var activeSessions = await _db.Sessions
            .AsNoTracking()
            .Where(s => s.BranchId == branchId && (s.State == SessionState.Active || s.State == SessionState.AwaitingBilling))
            .ToDictionaryAsync(s => s.PcId, s => s);

        // Fetch upcoming reservations for these PCs (starts within next 24h)
        var upcomingReservations = await _db.Reservations
            .AsNoTracking()
            .Where(r => r.BranchId == branchId && r.State == ReservationState.Pending && r.ReservationTime > now)
            .OrderBy(r => r.ReservationTime)
            .ToListAsync();

        var reservationDict = upcomingReservations
            .GroupBy(r => r.PcId)
            .ToDictionary(g => g.Key, g => g.First()); // Get the next immediate reservation

        var result = new List<PcStatusDto>();

        foreach (var pc in pcs)
        {
            var dto = new PcStatusDto
            {
                Id = pc.Id,
                Name = pc.PcNumber,
                IpAddress = pc.IpAddress ?? string.Empty,
                State = pc.State,
                BranchId = pc.BranchId,
                Zone = pc.Zone ?? "Standard",
                RatePerHour = pc.PricingProfile?.BaseHourlyRate ?? 0m
            };

            Session? session = null;
            if (activeSessions.TryGetValue(pc.Id, out session))
            {
                dto.ActiveSessionId = session.Id;
                dto.CustomerName = session.CustomerName;
                dto.SessionStartTime = session.StartTime;
                dto.CustomerType = session.MemberId.HasValue ? "Member" : "Walk-in";
                dto.TotalAmount = session.TotalAmount;
                if (session.EndTime.HasValue)
                    dto.SessionEndTime = session.EndTime;
            }

            if (reservationDict.TryGetValue(pc.Id, out var res))
            {
                dto.NextReservationId = res.Id;
                dto.NextReservationTime = res.ReservationTime;
                dto.CustomerName = dto.CustomerName ?? res.CustomerName;

                if (session != null)
                {
                    if (session.EndTime.HasValue)
                    {
                        if (session.EndTime.Value > res.ReservationTime)
                        {
                            dto.HasOverrunWarning = true;
                            dto.OverrunWarningMessage = $"Active session duration extends past reservation time ({res.ReservationTime.ToLocalTime():HH:mm}).";
                        }
                    }
                    else
                    {
                        if (res.ReservationTime <= now.AddMinutes(30))
                        {
                            dto.HasOverrunWarning = true;
                            dto.OverrunWarningMessage = $"Open-ended session might overlap with upcoming reservation starting at {res.ReservationTime.ToLocalTime():HH:mm}.";
                        }
                    }
                }
            }

            result.Add(dto);
        }

        return result;
    }

    public async Task<PcStatusDto> GetPcStatusAsync(Guid pcId)
    {
        var pc = await _db.Pcs.AsNoTracking().FirstOrDefaultAsync(p => p.Id == pcId);
        if (pc == null)
            throw new NotFoundException("PC not found", "PC_NOT_FOUND");

        var statuses = await GetBranchPcStatusesAsync(pc.BranchId);
        return statuses.First(s => s.Id == pcId);
    }

    public async Task BroadcastPcStatusChangeAsync(Guid branchId, Guid pcId)
    {
        await _hubNotifier.BroadcastPcStatusChangeAsync(branchId, pcId);
        _logger.LogInformation("Broadcasted PC status change for PC {PcId} on Branch {BranchId}", pcId, branchId);
    }
}
