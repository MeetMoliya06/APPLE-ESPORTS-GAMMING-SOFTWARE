using Microsoft.AspNetCore.Authorization;
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using NeonArenaErp.Api.Filters;

namespace NeonArenaErp.Api.Controllers;













/// <summary>SOP §13: Menu / Inventory — maps from inventory.routes.js</summary>
[ApiController]
[Route("api/inventory")]
[Authorize]
[BranchIsolation]
public class InventoryController : ControllerBase
{
    private readonly NeonArenaErp.Application.Interfaces.IUnitOfWork _unitOfWork;

    public InventoryController(NeonArenaErp.Application.Interfaces.IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? branchId = null)
    {
        var targetBranchId = branchId ?? Guid.Parse(HttpContext.Items["BranchId"]!.ToString()!);
        
        var items = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryItem>()
            .Query()
            .Where(i => i.BranchId == targetBranchId && i.Status == NeonArenaErp.Domain.Enums.FoodAvailability.Available)
            .OrderBy(i => i.Category)
            .ThenBy(i => i.ItemName)
            .ToListAsync();
            
        var dtos = items.Select(i => new {
            i.Id,
            i.ItemName,
            i.Category,
            i.Price,
            i.CurrentStock,
            i.MinStockLimit,
            Status = i.Status.ToString(),
            IsLowStock = i.CurrentStock <= i.MinStockLimit
        });

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(dtos));
    }

    [HttpPatch("{id}/stock")]
    public async Task<IActionResult> UpdateStock(Guid id, [FromBody] UpdateStockRequest request)
    {
        var item = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryItem>()
            .Query()
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return NotFound(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Inventory item not found"));

        item.CurrentStock = request.CurrentStock;
        item.UpdatedAt = DateTimeOffset.UtcNow;

        _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryItem>().Update(item);
        await _unitOfWork.SaveChangesAsync();

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { item.Id, item.CurrentStock }));
    }

    public record UpdateStockRequest(int CurrentStock);
}






/// <summary>SOP §16: Branches — maps from branches.routes.js (Super Admin only)</summary>
[ApiController]
[Route("api/branches")]
[Authorize(Policy = "SuperAdminOnly")]
public class BranchesController : ControllerBase
{
    private readonly NeonArenaErp.Application.Interfaces.IUnitOfWork _unitOfWork;

    public BranchesController(NeonArenaErp.Application.Interfaces.IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var branches = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Branch>()
            .Query()
            .OrderBy(b => b.Name)
            .ToListAsync();

        var dtos = branches.Select(b => new NeonArenaErp.Application.DTOs.Settings.BranchDto
        {
            Id = b.Id,
            Name = b.Name,
            Address = b.Address,
            OpeningTime = b.OpeningTime.ToString("HH:mm"),
            ClosingTime = b.ClosingTime.ToString("HH:mm"),
            Status = b.Status.ToString(),
            CreatedAt = b.CreatedAt
        });

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(dtos));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] NeonArenaErp.Application.DTOs.Settings.CreateBranchDto dto)
    {
        var branch = new NeonArenaErp.Domain.Entities.Branch
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Address = dto.Address,
            OpeningTime = TimeOnly.Parse(dto.OpeningTime),
            ClosingTime = TimeOnly.Parse(dto.ClosingTime),
            Status = NeonArenaErp.Domain.Enums.BranchStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Branch>().AddAsync(branch);
        await _unitOfWork.SaveChangesAsync();

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { branch.Id, branch.Name }));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] NeonArenaErp.Application.DTOs.Settings.UpdateBranchDto dto)
    {
        var branch = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Branch>().Query().FirstOrDefaultAsync(b => b.Id == id);
        if (branch == null) return NotFound(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Branch not found"));

        branch.Name = dto.Name;
        branch.Address = dto.Address;
        branch.OpeningTime = TimeOnly.Parse(dto.OpeningTime);
        branch.ClosingTime = TimeOnly.Parse(dto.ClosingTime);
        branch.UpdatedAt = DateTimeOffset.UtcNow;

        _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Branch>().Update(branch);
        await _unitOfWork.SaveChangesAsync();

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { branch.Id, branch.Name }));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var branch = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Branch>().Query().FirstOrDefaultAsync(b => b.Id == id);
        if (branch == null) return NotFound(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Branch not found"));

        // Soft delete: toggle to Inactive
        branch.Status = NeonArenaErp.Domain.Enums.BranchStatus.Inactive;
        branch.UpdatedAt = DateTimeOffset.UtcNow;
        _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Branch>().Update(branch);
        await _unitOfWork.SaveChangesAsync();

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { message = "Branch deactivated successfully" }));
    }

    [HttpPost("{id}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var branch = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Branch>().Query().FirstOrDefaultAsync(b => b.Id == id);
        if (branch == null) return NotFound(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Branch not found"));

        branch.Status = NeonArenaErp.Domain.Enums.BranchStatus.Active;
        branch.UpdatedAt = DateTimeOffset.UtcNow;
        _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Branch>().Update(branch);
        await _unitOfWork.SaveChangesAsync();

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { message = "Branch activated successfully" }));
    }

    [HttpDelete("{id}/permanent")]
    public async Task<IActionResult> DeletePermanent(Guid id)
    {
        var branch = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Branch>().Query().FirstOrDefaultAsync(b => b.Id == id);
        if (branch == null) return NotFound(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Branch not found"));

        // Block deletion if the branch has any financial/session history — irreversible data loss
        var hasBills = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Bill>().Query().AnyAsync(b => b.BranchId == id);
        var hasSessions = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Session>().Query().AnyAsync(s => s.BranchId == id);
        var hasShifts = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Shift>().Query().AnyAsync(s => s.BranchId == id);

        if (hasBills || hasSessions || hasShifts)
        {
            return BadRequest(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail(
                "Cannot permanently delete this branch because it has transaction history (bills, sessions, or shifts). Deactivate the branch instead to preserve audit trails."));
        }

        // No financial history — safe to cascade delete in dependency order
        var pcs = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Pc>().Query().Where(p => p.BranchId == id).ToListAsync();
        foreach (var pc in pcs)
            _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Pc>().Remove(pc);

        var operators = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Operator>().Query().Where(o => o.BranchId == id).ToListAsync();
        foreach (var op in operators)
            _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Operator>().Remove(op);

        _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Branch>().Remove(branch);

        try
        {
            await _unitOfWork.SaveChangesAsync();
            return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { message = "Branch and its operators/rigs deleted permanently." }));
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail(
                $"Deletion blocked by remaining linked records: {ex.InnerException?.Message ?? ex.Message}"));
        }
    }
}

/// <summary>SOP §5: Operators — maps from operators.routes.js</summary>
[ApiController]
[Route("api/operators")]
[Authorize(Policy = "SuperAdminOnly")]
public class OperatorsController : ControllerBase
{
    private readonly NeonArenaErp.Application.Interfaces.IUnitOfWork _unitOfWork;

    public OperatorsController(NeonArenaErp.Application.Interfaces.IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var operators = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Operator>()
            .Query()
            .Include(o => o.Branch)
            .OrderBy(o => o.FullName)
            .ToListAsync();

        var dtos = operators.Select(o => new NeonArenaErp.Application.DTOs.Settings.OperatorDto
        {
            Id = o.Id,
            FullName = o.FullName,
            Username = o.Username,
            BranchId = o.BranchId,
            BranchName = o.Branch?.Name ?? "Unknown",
            Status = o.Status.ToString(),
            DashboardPermissions = o.DashboardPermissions ?? "{}",
            CreatedAt = o.CreatedAt
        });

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(dtos));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] NeonArenaErp.Application.DTOs.Settings.CreateOperatorDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Password is required to create an operator."));

        // Check username uniqueness within the branch
        var usernameTaken = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Operator>()
            .Query().AnyAsync(o => o.Username == dto.Username.Trim() && o.BranchId == dto.BranchId);
        if (usernameTaken)
            return BadRequest(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail($"Username '{dto.Username}' is already taken in this branch."));

        var op = new NeonArenaErp.Domain.Entities.Operator
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName,
            Username = dto.Username.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            BranchId = dto.BranchId,
            DashboardPermissions = dto.DashboardPermissions,
            Status = NeonArenaErp.Domain.Enums.OperatorStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Operator>().AddAsync(op);
        await _unitOfWork.SaveChangesAsync();

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { op.Id, op.Username }));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] NeonArenaErp.Application.DTOs.Settings.UpdateOperatorDto dto)
    {
        var op = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Operator>().Query().FirstOrDefaultAsync(o => o.Id == id);
        if (op == null) return NotFound(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Operator not found"));

        op.FullName = dto.FullName;
        op.Username = dto.Username;
        op.BranchId = dto.BranchId;
        op.DashboardPermissions = dto.DashboardPermissions;
        op.UpdatedAt = DateTimeOffset.UtcNow;

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            op.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Operator>().Update(op);
        await _unitOfWork.SaveChangesAsync();

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { op.Id, op.Username }));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var op = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Operator>().Query().FirstOrDefaultAsync(o => o.Id == id);
        if (op == null) return NotFound(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Operator not found"));

        // Soft delete: toggle status to Disabled
        op.Status = NeonArenaErp.Domain.Enums.OperatorStatus.Disabled;
        op.UpdatedAt = DateTimeOffset.UtcNow;
        _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Operator>().Update(op);
        await _unitOfWork.SaveChangesAsync();

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { message = "Operator disabled successfully" }));
    }

    [HttpPost("{id}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var op = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Operator>().Query().FirstOrDefaultAsync(o => o.Id == id);
        if (op == null) return NotFound(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Operator not found"));

        op.Status = NeonArenaErp.Domain.Enums.OperatorStatus.Active;
        op.UpdatedAt = DateTimeOffset.UtcNow;
        _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Operator>().Update(op);
        await _unitOfWork.SaveChangesAsync();

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { message = "Operator activated successfully" }));
    }

    [HttpDelete("{id}/permanent")]
    public async Task<IActionResult> DeletePermanent(Guid id)
    {
        var op = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Operator>().Query().FirstOrDefaultAsync(o => o.Id == id);
        if (op == null) return NotFound(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Operator not found"));

        try
        {
            _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Operator>().Remove(op);
            await _unitOfWork.SaveChangesAsync();
            return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { message = "Operator deleted permanently" }));
        }
        catch (DbUpdateException)
        {
            return BadRequest(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Cannot delete operator permanently because they have associated transactional history (shifts, sessions, bills, etc.). You can disable their account instead."));
        }
    }
}

/// <summary>SOP §18: Main Dashboard — maps from dashboard.routes.js</summary>
[ApiController]
[Route("api/dashboard")]
[Authorize]
[BranchIsolation]
public class DashboardController : ControllerBase
{
    private readonly NeonArenaErp.Application.Interfaces.IDashboardService _dashboardService;

    public DashboardController(NeonArenaErp.Application.Interfaces.IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] Guid? branchId = null)
    {
        var targetBranchId = branchId;
        if (targetBranchId == null && HttpContext.Items.TryGetValue("BranchId", out var itemVal) && itemVal != null)
        {
            var parsedVal = itemVal.ToString();
            if (!string.IsNullOrEmpty(parsedVal) && Guid.TryParse(parsedVal, out var g))
            {
                targetBranchId = g;
            }
        }
        var result = await _dashboardService.GetSummaryAsync(targetBranchId);
        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<NeonArenaErp.Application.DTOs.Dashboard.DashboardSummaryDto>.Ok(result));
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetRecentTransactions([FromQuery] Guid? branchId = null, [FromQuery] int limit = 20)
    {
        var targetBranchId = branchId;
        if (targetBranchId == null && HttpContext.Items.TryGetValue("BranchId", out var itemVal) && itemVal != null)
        {
            var parsedVal = itemVal.ToString();
            if (!string.IsNullOrEmpty(parsedVal) && Guid.TryParse(parsedVal, out var g))
            {
                targetBranchId = g;
            }
        }
        var result = await _dashboardService.GetRecentActivityAsync(targetBranchId, limit);
        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<IEnumerable<NeonArenaErp.Application.DTOs.Dashboard.RecentActivityDto>>.Ok(result));
    }

    [HttpGet("branches-summary")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<IActionResult> GetBranchSummaries()
    {
        var result = await _dashboardService.GetBranchSummariesAsync();
        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<IEnumerable<NeonArenaErp.Application.DTOs.Dashboard.BranchDashboardSummaryDto>>.Ok(result));
    }
}
