using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeonArenaErp.Api.Filters;
using NeonArenaErp.Application.DTOs.Cash;
using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.Exceptions;
using NeonArenaErp.Application.Interfaces;
using System.Security.Claims;

namespace NeonArenaErp.Api.Controllers;

[ApiController]
[Route("api/cash")]
[Authorize]
[BranchIsolation]
public class CashController : ControllerBase
{
    private readonly ICashRegisterService _cashRegisterService;

    public CashController(ICashRegisterService cashRegisterService)
    {
        _cashRegisterService = cashRegisterService;
    }

    private Guid GetBranchId() => Guid.Parse(HttpContext.Items["BranchId"]!.ToString()!);
    private Guid GetOperatorId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    private Guid GetShiftId()
    {
        var shiftClaim = User.FindFirstValue("shiftId");
        if (string.IsNullOrEmpty(shiftClaim))
            throw new AppException("Active shift required for cash register operations.");
        return Guid.Parse(shiftClaim);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveRegister()
    {
        var result = await _cashRegisterService.GetActiveRegisterAsync(GetBranchId(), GetShiftId());
        return Ok(ApiResponse<CashRegisterDto>.Ok(result));
    }

    [HttpPost("open")]
    public async Task<IActionResult> OpenRegister([FromBody] OpenRegisterDto dto)
    {
        var result = await _cashRegisterService.OpenRegisterAsync(GetBranchId(), GetOperatorId(), GetShiftId(), dto);
        return Ok(ApiResponse<CashRegisterDto>.Ok(result));
    }

    [HttpPost("transaction")]
    public async Task<IActionResult> AddTransaction([FromBody] AddCashTransactionDto dto)
    {
        var result = await _cashRegisterService.AddTransactionAsync(GetBranchId(), GetOperatorId(), GetShiftId(), dto);
        return Ok(ApiResponse<CashRegisterDto>.Ok(result));
    }
}
