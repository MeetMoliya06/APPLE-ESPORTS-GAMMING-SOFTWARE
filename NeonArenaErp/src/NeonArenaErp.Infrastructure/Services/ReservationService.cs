using Microsoft.EntityFrameworkCore;
using NeonArenaErp.Application.Constants;
using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.DTOs.Reservations;
using NeonArenaErp.Application.Exceptions;
using NeonArenaErp.Application.Interfaces;
using NeonArenaErp.Domain.Entities;
using NeonArenaErp.Domain.Enums;

namespace NeonArenaErp.Infrastructure.Services;

public class ReservationService : IReservationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditService _auditService;
    private readonly IHubNotificationService _hubNotification;

    public ReservationService(
        IUnitOfWork unitOfWork,
        IAuditService auditService,
        IHubNotificationService hubNotification)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
        _hubNotification = hubNotification;
    }

    public async Task<PaginatedResult<ReservationDto>> GetActiveReservationsAsync(Guid branchId, int page = 1, int pageSize = 50)
    {
        await ExpirePastReservationsAsync(branchId); // Passive expiration check

        var query = _unitOfWork.Repository<Reservation>().Query()
            .Where(r => r.BranchId == branchId && (r.State == ReservationState.Pending || r.State == ReservationState.Active))
            .OrderBy(r => r.ReservationTime);

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var dtos = items.Select(MapToDto).ToList();
        return new PaginatedResult<ReservationDto>(dtos, total, page, pageSize);
    }

    public async Task<ReservationDto> GetReservationAsync(Guid id)
    {
        var reservation = await _unitOfWork.Repository<Reservation>().GetByIdAsync(id)
            ?? throw new NotFoundException($"Reservation {id} not found.");
            
        return MapToDto(reservation);
    }

    public async Task<ReservationDto> CreateReservationAsync(Guid branchId, Guid operatorId, CreateReservationDto dto)
    {
        var pc = await _unitOfWork.Repository<Pc>().GetByIdAsync(dto.PcId)
            ?? throw new NotFoundException("PC not found.");

        if (pc.BranchId != branchId)
            throw new BranchIsolationException("PC belongs to another branch.");

        // SOP §8: Prevent overlapping reservations within the same time window
        var overlapping = await _unitOfWork.Repository<Reservation>().Query()
            .Where(r => r.PcId == dto.PcId && r.State == ReservationState.Pending)
            .Where(r => r.ReservationTime <= dto.ReservationTime.AddMinutes(dto.DurationMin ?? 60)
                     && r.ReservationTime.AddMinutes(r.DurationMin ?? 60) >= dto.ReservationTime)
            .AnyAsync();

        if (overlapping)
            throw new AppException("PC is already reserved for this time slot.");

        var reservation = new Reservation
        {
            PcId = dto.PcId,
            BranchId = branchId,
            OperatorId = operatorId,
            CustomerName = dto.CustomerName,
            MemberId = dto.MemberId,
            ReservationTime = dto.ReservationTime,
            DurationMin = dto.DurationMin,
            State = ReservationState.Pending,
            Notes = dto.Notes
        };

        // If reservation is right now, update PC state
        if (dto.ReservationTime <= DateTimeOffset.UtcNow.AddMinutes(15))
        {
            if (pc.State == PcState.Idle)
            {
                pc.State = PcState.Reserved;
                _unitOfWork.Repository<Pc>().Update(pc);
            }
        }

        await _unitOfWork.Repository<Reservation>().AddAsync(reservation);
        
        await _auditService.LogAsync(new AuditEntry
        {
            OperatorId = operatorId,
            UserRole = "Operator",
            UserName = "System",
            Action = AuditActions.ReservationCreate,
            BranchId = branchId,
            TargetType = "reservation",
            TargetId = reservation.Id,
            Details = new { CustomerName = dto.CustomerName, PcNumber = pc.PcNumber, ReservationTime = dto.ReservationTime }
        });

        await _unitOfWork.CommitTransactionAsync();

        // Broadcast notifications
        await _hubNotification.BroadcastReservationUpdateAsync(branchId, reservation.Id);
        await _hubNotification.BroadcastPcStatusChangeAsync(branchId, pc.Id);

        return MapToDto(reservation);
    }

    public async Task<ReservationDto> CancelReservationAsync(Guid branchId, Guid operatorId, Guid id, CancelReservationDto dto)
    {
        var reservation = await _unitOfWork.Repository<Reservation>().GetByIdAsync(id)
            ?? throw new NotFoundException("Reservation not found.");

        if (reservation.BranchId != branchId)
            throw new BranchIsolationException("Reservation belongs to another branch.");

        if (reservation.State != ReservationState.Pending)
            throw new AppException("Only pending reservations can be cancelled.");

        reservation.State = ReservationState.Cancelled;
        reservation.CancelledAt = DateTimeOffset.UtcNow;
        reservation.Notes = (reservation.Notes + $" [Cancelled: {dto.Reason}]").Trim();

        _unitOfWork.Repository<Reservation>().Update(reservation);

        // Free up the PC if it was marked as reserved for this
        var pc = await _unitOfWork.Repository<Pc>().GetByIdAsync(reservation.PcId);
        if (pc != null && pc.State == PcState.Reserved)
        {
            // Check if there are other pending reservations right now
            var hasOther = await _unitOfWork.Repository<Reservation>().Query()
                .AnyAsync(r => r.PcId == pc.Id && r.State == ReservationState.Pending && r.Id != reservation.Id 
                          && r.ReservationTime <= DateTimeOffset.UtcNow.AddMinutes(15));
                          
            if (!hasOther)
            {
                pc.State = PcState.Idle;
                _unitOfWork.Repository<Pc>().Update(pc);
                await _hubNotification.BroadcastPcStatusChangeAsync(branchId, pc.Id);
            }
        }

        await _auditService.LogAsync(new AuditEntry
        {
            OperatorId = operatorId,
            UserRole = "Operator",
            UserName = "System",
            Action = AuditActions.ReservationCancel,
            BranchId = branchId,
            TargetType = "reservation",
            TargetId = reservation.Id,
            Details = new { Reason = dto.Reason }
        });

        await _unitOfWork.CommitTransactionAsync();
        await _hubNotification.BroadcastReservationUpdateAsync(branchId, reservation.Id);

        return MapToDto(reservation);
    }

    public async Task ExpirePastReservationsAsync(Guid branchId)
    {
        // SOP §8: Grace period of 15 minutes before auto-cancelling
        var expiredThreshold = DateTimeOffset.UtcNow.AddMinutes(-15);
        
        var expiredReservations = await _unitOfWork.Repository<Reservation>().Query()
            .Where(r => r.BranchId == branchId && r.State == ReservationState.Pending && r.ReservationTime < expiredThreshold)
            .ToListAsync();

        if (!expiredReservations.Any())
            return;

        foreach (var res in expiredReservations)
        {
            res.State = ReservationState.Expired;
            res.ExpiredAt = DateTimeOffset.UtcNow;
            _unitOfWork.Repository<Reservation>().Update(res);

            // Free the PC if reserved
            var pc = await _unitOfWork.Repository<Pc>().GetByIdAsync(res.PcId);
            if (pc != null && pc.State == PcState.Reserved)
            {
                pc.State = PcState.Idle;
                _unitOfWork.Repository<Pc>().Update(pc);
                await _hubNotification.BroadcastPcStatusChangeAsync(branchId, pc.Id);
            }

            await _hubNotification.BroadcastReservationUpdateAsync(branchId, res.Id);
        }

        await _unitOfWork.CommitTransactionAsync();
    }

    private static ReservationDto MapToDto(Reservation r)
    {
        return new ReservationDto
        {
            Id = r.Id,
            PcId = r.PcId,
            CustomerName = r.CustomerName,
            MemberId = r.MemberId,
            ReservationTime = r.ReservationTime,
            DurationMin = r.DurationMin,
            State = r.State,
            Notes = r.Notes
        };
    }
}
