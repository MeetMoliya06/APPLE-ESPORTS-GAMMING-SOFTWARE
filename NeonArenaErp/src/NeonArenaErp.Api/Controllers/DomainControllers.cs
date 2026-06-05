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
}





/// <summary>SOP §16: Branches — maps from branches.routes.js (Super Admin only)</summary>
[ApiController]
[Route("api/branches")]
[Authorize(Policy = "SuperAdminOnly")]
public class BranchesController : ControllerBase
{
    [HttpGet] public IActionResult GetAll() => Ok(new { success = true, message = "Branches endpoint ready" });
}

/// <summary>SOP §5: Operators — maps from operators.routes.js</summary>
[ApiController]
[Route("api/operators")]
[Authorize(Policy = "SuperAdminOnly")]
public class OperatorsController : ControllerBase
{
    [HttpGet] public IActionResult GetAll() => Ok(new { success = true, message = "Operators endpoint ready" });
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
        var result = await _dashboardService.GetSummaryAsync(branchId);
        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<NeonArenaErp.Application.DTOs.Dashboard.DashboardSummaryDto>.Ok(result));
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetRecentTransactions([FromQuery] Guid? branchId = null, [FromQuery] int limit = 20)
    {
        var result = await _dashboardService.GetRecentActivityAsync(branchId, limit);
        return Ok(NeonArenaErp.Application.DTOs.Common.ApiResponse<IEnumerable<NeonArenaErp.Application.DTOs.Dashboard.RecentActivityDto>>.Ok(result));
    }
}
