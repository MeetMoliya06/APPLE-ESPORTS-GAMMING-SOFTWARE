using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeonArenaErp.Api.Filters;
using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.DTOs.FoodOrders;
using NeonArenaErp.Application.Exceptions;
using NeonArenaErp.Application.Interfaces;
using System.Security.Claims;

namespace NeonArenaErp.Api.Controllers;

[ApiController]
[Route("api/food-orders")]
[Authorize]
[BranchIsolation]
public class FoodOrdersController : ControllerBase
{
    private readonly IFoodOrderService _foodOrderService;

    public FoodOrdersController(IFoodOrderService foodOrderService)
    {
        _foodOrderService = foodOrderService;
    }

    private Guid GetBranchId() => Guid.Parse(HttpContext.Items["BranchId"]!.ToString()!);
    private Guid GetOperatorId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    private Guid GetShiftId()
    {
        var shiftClaim = User.FindFirstValue("shiftId");
        if (string.IsNullOrEmpty(shiftClaim))
            throw new AppException("Active shift required for food operations.");
        return Guid.Parse(shiftClaim);
    }

    [HttpGet]
    public async Task<IActionResult> GetActiveOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var result = await _foodOrderService.GetActiveOrdersAsync(GetBranchId(), page, pageSize);
        return Ok(ApiResponse<PaginatedResult<FoodOrderDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var result = await _foodOrderService.GetOrderAsync(GetBranchId(), id);
        return Ok(ApiResponse<FoodOrderDto>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> PlaceOrder([FromBody] CreateFoodOrderDto dto)
    {
        var result = await _foodOrderService.PlaceOrderAsync(GetBranchId(), GetOperatorId(), GetShiftId(), dto);
        return Ok(ApiResponse<FoodOrderDto>.Ok(result));
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
    {
        var result = await _foodOrderService.UpdateOrderStatusAsync(GetBranchId(), GetOperatorId(), id, dto);
        return Ok(ApiResponse<FoodOrderDto>.Ok(result));
    }
}
