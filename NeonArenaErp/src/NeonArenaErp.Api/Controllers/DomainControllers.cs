using Microsoft.AspNetCore.Authorization;
using System;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
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
    public async Task<IActionResult> GetAll([FromQuery] bool includeAll = false, [FromQuery] Guid? branchId = null)
    {
        Console.WriteLine($"[DEBUG GetAll] HttpContext is null: {HttpContext == null}");
        if (HttpContext != null)
        {
            Console.WriteLine($"[DEBUG GetAll] HttpContext.Items is null: {HttpContext.Items == null}");
            Console.WriteLine($"[DEBUG GetAll] BranchId in Items: {HttpContext.Items["BranchId"]}");
        }
        var branchIdStr = HttpContext?.Items["BranchId"]?.ToString();
        var targetBranchId = branchId 
            ?? (string.IsNullOrEmpty(branchIdStr) ? (Guid?)null : Guid.Parse(branchIdStr));
            
        if (targetBranchId == null)
        {
            var firstBranch = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Branch>().Query().FirstOrDefaultAsync();
            if (firstBranch == null)
            {
                return BadRequest(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("No branches found in the system"));
            }
            targetBranchId = firstBranch.Id;
        }
        
        var query = _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryItem>()
            .Query()
            .Where(i => i.BranchId == targetBranchId);

        if (!includeAll)
        {
            query = query.Where(i => i.Status != NeonArenaErp.Domain.Enums.FoodAvailability.Disabled);
        }

        var items = await query
            .OrderBy(i => i.Category)
            .ThenBy(i => i.ItemName)
            .ToListAsync();
            
        var dtos = items.Select(i => new {
            i.Id,
            i.ItemName,
            i.Category,
            i.Price,
            i.CurrentStock,
            i.SoldQty,
            i.MinStockLimit,
            Status = i.Status.ToString(),
            IsLowStock = i.CurrentStock <= i.MinStockLimit,
            i.ImageUrl,
            i.CreatedAt,
            i.UpdatedAt
        });

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(dtos));
    }

    [HttpPost]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateInventoryItemDto dto)
    {
        var targetBranchId = dto.BranchId ?? Guid.Parse(HttpContext.Items["BranchId"]!.ToString()!);
        
        var item = new NeonArenaErp.Domain.Entities.InventoryItem
        {
            Id = Guid.NewGuid(),
            BranchId = targetBranchId,
            ItemName = dto.ItemName,
            Category = dto.Category,
            Price = dto.Price,
            CurrentStock = dto.CurrentStock,
            SoldQty = 0,
            MinStockLimit = dto.MinStockLimit,
            Status = dto.Status,
            ImageUrl = dto.ImageUrl,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryItem>().AddAsync(item);
        
        // Log initial stock creation as "refill"
        var isOp = User.FindFirstValue(ClaimTypes.Role) == "operator";
        var log = new NeonArenaErp.Domain.Entities.InventoryLog
        {
            Id = Guid.NewGuid(),
            InventoryId = item.Id,
            BranchId = targetBranchId,
            OperatorId = isOp ? Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!) : (Guid?)null,
            Action = "refill",
            Quantity = dto.CurrentStock,
            OldValue = "0",
            NewValue = dto.CurrentStock.ToString(),
            Reason = "Initial menu item creation",
            CreatedAt = DateTimeOffset.UtcNow
        };
        await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryLog>().AddAsync(log);

        await _unitOfWork.SaveChangesAsync();

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new {
            item.Id,
            item.ItemName,
            item.Category,
            item.Price,
            item.CurrentStock,
            item.SoldQty,
            item.MinStockLimit,
            Status = item.Status.ToString(),
            IsLowStock = item.CurrentStock <= item.MinStockLimit,
            item.ImageUrl,
            item.CreatedAt,
            item.UpdatedAt
        }));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInventoryItemDto dto)
    {
        var item = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryItem>()
            .Query()
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return NotFound(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Inventory item not found"));

        var now = DateTimeOffset.UtcNow;
        var isOp = User.FindFirstValue(ClaimTypes.Role) == "operator";
        var logOperatorId = isOp ? Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!) : (Guid?)null;

        // Audit changes if price/status/stock changed
        if (item.Price != dto.Price)
        {
            var log = new NeonArenaErp.Domain.Entities.InventoryLog
            {
                Id = Guid.NewGuid(),
                InventoryId = item.Id,
                BranchId = item.BranchId,
                OperatorId = logOperatorId,
                Action = "price_change",
                OldValue = item.Price.ToString("F2"),
                NewValue = dto.Price.ToString("F2"),
                Reason = "Price updated via menu editor",
                CreatedAt = now
            };
            await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryLog>().AddAsync(log);
        }

        if (item.Status != dto.Status)
        {
            var log = new NeonArenaErp.Domain.Entities.InventoryLog
            {
                Id = Guid.NewGuid(),
                InventoryId = item.Id,
                BranchId = item.BranchId,
                OperatorId = logOperatorId,
                Action = "status_change",
                OldValue = item.Status.ToString(),
                NewValue = dto.Status.ToString(),
                Reason = "Status updated via menu editor",
                CreatedAt = now
            };
            await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryLog>().AddAsync(log);
        }

        if (item.CurrentStock != dto.CurrentStock)
        {
            var log = new NeonArenaErp.Domain.Entities.InventoryLog
            {
                Id = Guid.NewGuid(),
                InventoryId = item.Id,
                BranchId = item.BranchId,
                OperatorId = logOperatorId,
                Action = "refill",
                Quantity = dto.CurrentStock - item.CurrentStock,
                OldValue = item.CurrentStock.ToString(),
                NewValue = dto.CurrentStock.ToString(),
                Reason = "Stock count updated via menu editor",
                CreatedAt = now
            };
            await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryLog>().AddAsync(log);
        }

        item.ItemName = dto.ItemName;
        item.Category = dto.Category;
        item.Price = dto.Price;
        item.CurrentStock = dto.CurrentStock;
        item.MinStockLimit = dto.MinStockLimit;
        item.Status = dto.Status;
        item.ImageUrl = dto.ImageUrl;
        item.UpdatedAt = now;

        _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryItem>().Update(item);
        await _unitOfWork.SaveChangesAsync();

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new {
            item.Id,
            item.ItemName,
            item.Category,
            item.Price,
            item.CurrentStock,
            item.SoldQty,
            item.MinStockLimit,
            Status = item.Status.ToString(),
            IsLowStock = item.CurrentStock <= item.MinStockLimit,
            item.ImageUrl,
            item.CreatedAt,
            item.UpdatedAt
        }));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryItem>()
            .Query()
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return NotFound(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Inventory item not found"));

        try
        {
            _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryItem>().Remove(item);
            await _unitOfWork.SaveChangesAsync();
            return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { message = "Item deleted successfully" }));
        }
        catch (Exception)
        {
            // If deleting throws due to foreign keys, soft-delete by setting status to Disabled
            item.Status = NeonArenaErp.Domain.Enums.FoodAvailability.Disabled;
            item.UpdatedAt = DateTimeOffset.UtcNow;
            _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryItem>().Update(item);
            await _unitOfWork.SaveChangesAsync();
            return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { message = "Item cannot be permanently deleted due to existing orders. It has been deactivated instead." }));
        }
    }

    [HttpPost("{id}/reconcile")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<IActionResult> Reconcile(Guid id, [FromBody] ReconcileStockDto dto)
    {
        var item = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryItem>()
            .Query()
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return NotFound(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("Inventory item not found"));

        var oldStock = item.CurrentStock;
        var physicalCount = dto.PhysicalCount;
        var now = DateTimeOffset.UtcNow;
        var isOp = User.FindFirstValue(ClaimTypes.Role) == "operator";
        var logOperatorId = isOp ? Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!) : (Guid?)null;

        item.CurrentStock = physicalCount;
        item.UpdatedAt = now;

        if (physicalCount == 0)
        {
            item.Status = NeonArenaErp.Domain.Enums.FoodAvailability.OutOfStock;
        }
        else if (item.Status == NeonArenaErp.Domain.Enums.FoodAvailability.OutOfStock && physicalCount > 0)
        {
            item.Status = NeonArenaErp.Domain.Enums.FoodAvailability.Available;
        }

        _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryItem>().Update(item);

        var log = new NeonArenaErp.Domain.Entities.InventoryLog
        {
            Id = Guid.NewGuid(),
            InventoryId = item.Id,
            BranchId = item.BranchId,
            OperatorId = logOperatorId,
            Action = "discrepancy",
            Quantity = physicalCount - oldStock,
            OldValue = oldStock.ToString(),
            NewValue = physicalCount.ToString(),
            Reason = dto.Reason ?? "Physical inventory reconciliation count mismatch",
            CreatedAt = now
        };
        await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryLog>().AddAsync(log);

        await _unitOfWork.SaveChangesAsync();

        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Ok(new { item.Id, item.CurrentStock, Status = item.Status.ToString() }));
    }

    [HttpGet("discrepancies")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<IActionResult> GetDiscrepancies([FromQuery] Guid? branchId = null)
    {
        Console.WriteLine($"[DEBUG GetDiscrepancies] HttpContext is null: {HttpContext == null}");
        if (HttpContext != null)
        {
            Console.WriteLine($"[DEBUG GetDiscrepancies] HttpContext.Items is null: {HttpContext.Items == null}");
            Console.WriteLine($"[DEBUG GetDiscrepancies] BranchId in Items: {HttpContext.Items["BranchId"]}");
        }
        var branchIdStr = HttpContext?.Items["BranchId"]?.ToString();
        var targetBranchId = branchId 
            ?? (string.IsNullOrEmpty(branchIdStr) ? (Guid?)null : Guid.Parse(branchIdStr));
            
        if (targetBranchId == null)
        {
            var firstBranch = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.Branch>().Query().FirstOrDefaultAsync();
            if (firstBranch == null)
            {
                return BadRequest(NeonArenaErp.Application.DTOs.Common.ApiResponse<object>.Fail("No branches found in the system"));
            }
            targetBranchId = firstBranch.Id;
        }

        var logs = await _unitOfWork.Repository<NeonArenaErp.Domain.Entities.InventoryLog>()
            .Query()
            .Include(l => l.InventoryItem)
            .Where(l => l.BranchId == targetBranchId && l.Action == "discrepancy")
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        var dtos = logs.Select(l => new {
            l.Id,
            l.InventoryId,
            ItemName = l.InventoryItem?.ItemName ?? "Unknown",
            l.OperatorId,
            l.Action,
            l.Quantity,
            l.OldValue,
            l.NewValue,
            l.Reason,
            l.CreatedAt
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

public class CreateInventoryItemDto
{
    [Required]
    public string ItemName { get; set; } = null!;
    public string? Category { get; set; }
    [Required]
    [Range(0, 1000000)]
    public decimal Price { get; set; }
    [Required]
    [Range(0, 100000)]
    public int CurrentStock { get; set; }
    [Required]
    [Range(0, 100000)]
    public int MinStockLimit { get; set; } = 5;
    [Required]
    public NeonArenaErp.Domain.Enums.FoodAvailability Status { get; set; } = NeonArenaErp.Domain.Enums.FoodAvailability.Available;
    public string? ImageUrl { get; set; }
    public Guid? BranchId { get; set; }
}

public class UpdateInventoryItemDto
{
    [Required]
    public string ItemName { get; set; } = null!;
    public string? Category { get; set; }
    [Required]
    [Range(0, 1000000)]
    public decimal Price { get; set; }
    [Required]
    [Range(0, 100000)]
    public int CurrentStock { get; set; }
    [Required]
    [Range(0, 100000)]
    public int MinStockLimit { get; set; } = 5;
    [Required]
    public NeonArenaErp.Domain.Enums.FoodAvailability Status { get; set; }
    public string? ImageUrl { get; set; }
}

public class ReconcileStockDto
{
    [Required]
    public int PhysicalCount { get; set; }
    public string? Reason { get; set; }
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
