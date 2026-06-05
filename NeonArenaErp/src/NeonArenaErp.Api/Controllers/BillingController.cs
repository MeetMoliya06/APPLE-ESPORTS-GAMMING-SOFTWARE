using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeonArenaErp.Api.Filters;
using NeonArenaErp.Application.DTOs.Billing;
using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.Exceptions;
using NeonArenaErp.Application.Interfaces;
using System.Security.Claims;

namespace NeonArenaErp.Api.Controllers;

[ApiController]
[Route("api/bills")]
[Authorize]
[BranchIsolation]
public class BillingController : ControllerBase
{
    private readonly IBillingService _billingService;

    public BillingController(IBillingService billingService)
    {
        _billingService = billingService;
    }

    private Guid GetBranchId() => Guid.Parse(HttpContext.Items["BranchId"]!.ToString()!);
    private Guid GetOperatorId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    private Guid GetShiftId()
    {
        var shiftClaim = User.FindFirstValue("shiftId");
        if (string.IsNullOrEmpty(shiftClaim))
            throw new AppException("Active shift required for billing operations.");
        return Guid.Parse(shiftClaim);
    }

    [HttpGet]
    public async Task<IActionResult> GetActiveBills([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var result = await _billingService.GetActiveBillsAsync(GetBranchId(), page, pageSize);
        return Ok(ApiResponse<PaginatedResult<BillDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetBill(Guid id)
    {
        var result = await _billingService.GetBillAsync(GetBranchId(), id);
        return Ok(ApiResponse<BillDto>.Ok(result));
    }

    [HttpPost("{id:guid}/discount")]
    [Idempotent]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<IActionResult> ApplyDiscount(Guid id, [FromBody] ApplyDiscountDto dto)
    {
        var result = await _billingService.ApplyDiscountAsync(GetBranchId(), GetOperatorId(), id, dto);
        return Ok(ApiResponse<BillDto>.Ok(result));
    }

    [HttpPost("{id:guid}/pay")]
    [Idempotent]
    public async Task<IActionResult> ProcessPayment(Guid id, [FromBody] ProcessPaymentDto dto)
    {
        var result = await _billingService.ProcessPaymentAsync(GetBranchId(), GetOperatorId(), GetShiftId(), id, dto);
        return Ok(ApiResponse<BillDto>.Ok(result));
    }
}
