using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppleEsportsErp.Application.DTOs.Common;
using AppleEsportsErp.Application.DTOs.Sessions;
using AppleEsportsErp.Application.Interfaces;
using AppleEsportsErp.Domain.Enums;
using AppleEsportsErp.Infrastructure.Data;
using AppleEsportsErp.Domain.Entities;
using AppleEsportsErp.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace AppleEsportsErp.Api.Controllers;

/// <summary>
/// Unauthenticated public endpoints used by the user panel (kiosk, walk-in, member portal, PC overlay).
/// No JWT required — branch isolation is handled by explicit branchId parameters.
/// </summary>
[ApiController]
[Route("api/public")]
[AllowAnonymous]
public class PublicController : ControllerBase
{
    private readonly AppDbContext _db;

    public PublicController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>List all active branches — shown in walk-in & member branch selection screens.</summary>
    [HttpGet("branches")]
    public async Task<IActionResult> GetBranches()
    {
        var branches = await _db.Branches
            .Where(b => b.Status == BranchStatus.Active)
            .OrderBy(b => b.Name)
            .Select(b => new { b.Id, b.Name, b.Address })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(branches));
    }

    /// <summary>List idle PCs for a branch — shown in member portal PC selection screen.</summary>
    [HttpGet("branches/{branchId:guid}/pcs/idle")]
    public async Task<IActionResult> GetIdlePcs(Guid branchId)
    {
        var pcs = await _db.Pcs
            .Where(p => p.BranchId == branchId && p.State == PcState.Idle)
            .OrderBy(p => p.PcNumber)
            .Select(p => new { p.Id, Name = p.PcName ?? p.PcNumber })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(pcs));
    }

    /// <summary>
    /// Get the active session for a PC — used by the overlay on startup to load real session data.
    /// Accepts either a PC UUID or a PC name string (e.g. "PC-07").
    /// </summary>
    [HttpGet("session/pc/{pcIdentifier}")]
    public async Task<IActionResult> GetSessionByPc(string pcIdentifier)
    {
        // Try UUID first, fall back to name lookup
        Domain.Entities.Pc? pc = null;
        if (Guid.TryParse(pcIdentifier, out var pcGuid))
        {
            pc = await _db.Pcs.FirstOrDefaultAsync(p => p.Id == pcGuid);
        }
        else
        {
            pc = await _db.Pcs.FirstOrDefaultAsync(p => p.PcNumber == pcIdentifier || p.PcName == pcIdentifier);
        }

        if (pc == null)
            return Ok(new { success = true, data = (object?)null });

        var session = await _db.Sessions
            .Include(s => s.FoodOrders).ThenInclude(fo => fo.Items)
            .Where(s => s.PcId == pc.Id && s.State == SessionState.Active)
            .OrderByDescending(s => s.StartTime)
            .FirstOrDefaultAsync();

        if (session == null)
            return Ok(new { success = true, data = (object?)null });

        var foodCharges = session.FoodOrders.Sum(fo => fo.TotalAmount);
        var elapsedMinutes = (DateTimeOffset.UtcNow - session.StartTime).TotalMinutes;
        var remainingSeconds = session.PlannedDurationMin.HasValue
            ? Math.Max(0, (session.PlannedDurationMin.Value - elapsedMinutes) * 60)
            : null as double?;

        var result = new
        {
            sessionId = session.Id.ToString(),
            pcId = pc.Id.ToString(),
            pcName = pc.PcName ?? pc.PcNumber,
            customerName = session.CustomerName ?? "Guest",
            sessionStart = session.StartTime,
            remainingTime = remainingSeconds.HasValue ? (int)remainingSeconds.Value : (int?)null,
            plannedDurationMin = session.PlannedDurationMin,
            gamingCharges = session.GamingAmount,
            foodCharges,
            foodItems = session.FoodOrders
                .SelectMany(fo => fo.Items)
                .Select(i => new { i.ItemName, i.Quantity, i.UnitPrice })
                .ToList(),
            totalBill = session.GamingAmount + foodCharges,
            sessionStatus = session.State.ToString().ToLowerInvariant(),
            memberId = session.MemberId?.ToString(),
        };

        return Ok(ApiResponse<object>.Ok(result));
    }
    [HttpGet("pcs/{pcIdentifier}")]
    public async Task<IActionResult> GetPc(string pcIdentifier)
    {
        Domain.Entities.Pc? pc = null;
        if (Guid.TryParse(pcIdentifier, out var pcGuid))
        {
            pc = await _db.Pcs.FirstOrDefaultAsync(p => p.Id == pcGuid);
        }
        else
        {
            pc = await _db.Pcs.FirstOrDefaultAsync(p => p.PcNumber == pcIdentifier || p.PcName == pcIdentifier);
        }

        if (pc == null)
            return Ok(new { success = false, error = "PC not found" });

        return Ok(ApiResponse<object>.Ok(new { id = pc.Id, name = pc.PcName ?? pc.PcNumber, branchId = pc.BranchId }));
    }

    [HttpPost("pcs/{pcId}/decline-walkin")]
    [Authorize]
    public async Task<IActionResult> DeclineWalkinRequest(string pcId, [FromServices] IHubContext<PcOverlayHub> overlayHub)
    {
        await overlayHub.Clients.Group($"pc:{pcId}").SendAsync("WalkinRequestDeclined", new { reason = "Operator declined the request" });
        return Ok(ApiResponse<object>.Ok(null));
    }

    [HttpPost("sessions/member-start")]
    [Authorize] // Requires valid MemberToken
    public async Task<IActionResult> StartMemberSession(
        [FromHeader(Name = "X-Branch-Id")] string branchIdStr,
        [FromBody] SessionStartDto dto,
        [FromServices] ISessionService sessionService)
    {
        if (string.IsNullOrEmpty(branchIdStr) || !Guid.TryParse(branchIdStr, out var branchId))
            return BadRequest(new { success = false, error = "X-Branch-Id header is required and must be a valid GUID." });

        // Retrieve or create System Operator and Shift
        var sysUsername = $"system_admin_{branchId:N}";
        var sysOp = await _db.Operators.FirstOrDefaultAsync(o => o.BranchId == branchId && o.Username == sysUsername);
        if (sysOp == null)
        {
            sysOp = new Operator
            {
                Id = Guid.NewGuid(),
                BranchId = branchId,
                FullName = "System Administrator",
                Username = sysUsername,
                PasswordHash = "LOCKED",
                Status = OperatorStatus.Active,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            _db.Operators.Add(sysOp);
            await _db.SaveChangesAsync();
        }

        var activeShift = await _db.Shifts.FirstOrDefaultAsync(s => s.BranchId == branchId && s.Status == ShiftStatus.Active && s.OperatorId == sysOp.Id);
        if (activeShift == null)
        {
            activeShift = new Shift
            {
                Id = Guid.NewGuid(),
                BranchId = branchId,
                OperatorId = sysOp.Id,
                LoginTime = DateTimeOffset.UtcNow,
                CreatedAt = DateTimeOffset.UtcNow,
                Status = ShiftStatus.Active
            };
            _db.Shifts.Add(activeShift);

            var register = new CashRegister
            {
                Id = Guid.NewGuid(),
                BranchId = branchId,
                OperatorId = sysOp.Id,
                ShiftId = activeShift.Id,
                OpeningBalance = 0,
                ExpectedDrawerCash = 0,
                TotalCashSales = 0,
                TotalSplitCash = 0,
                Status = CashRegisterStatus.Open,
                OpenedAt = DateTimeOffset.UtcNow
            };
            _db.CashRegisters.Add(register);
            await _db.SaveChangesAsync();
        }

        var result = await sessionService.StartSessionAsync(branchId, sysOp.Id, activeShift.Id, dto);
        return Ok(ApiResponse<SessionDto>.Ok(result));
    }
}
