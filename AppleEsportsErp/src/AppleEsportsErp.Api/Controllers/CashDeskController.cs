using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AppleEsportsErp.Api.Filters;
using AppleEsportsErp.Application.DTOs.Cash;
using AppleEsportsErp.Application.DTOs.Common;
using AppleEsportsErp.Application.Exceptions;
using AppleEsportsErp.Application.Interfaces;
using System.Security.Claims;

namespace AppleEsportsErp.Api.Controllers;

[ApiController]
[Route("api/cash-desk")]
[Authorize]
[BranchIsolation]
public class CashDeskController : ControllerBase
{
    private readonly ICashDeskService _cashDeskService;

    public CashDeskController(ICashDeskService cashDeskService)
    {
        _cashDeskService = cashDeskService;
    }

    private Guid GetBranchId() => Guid.Parse(HttpContext.Items["BranchId"]!.ToString()!);
    private Guid GetOperatorId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    private Guid GetShiftId()
    {
        var shiftClaim = User.FindFirstValue("shiftId");
        if (string.IsNullOrEmpty(shiftClaim))
            throw new AppException("Active shift required for cash desk operations.");
        return Guid.Parse(shiftClaim);
    }

    [HttpPost("verify-start")]
    [Idempotent]
    public async Task<IActionResult> StartVerification()
    {
        await _cashDeskService.StartVerificationAsync(GetBranchId(), GetOperatorId(), GetShiftId());
        return Ok(new { success = true, message = "Verification started, register locked." });
    }

    [HttpPost("denominations")]
    [Idempotent]
    public async Task<IActionResult> SubmitDenominations([FromBody] SubmitDenominationDto dto)
    {
        var result = await _cashDeskService.SubmitDenominationsAsync(GetBranchId(), GetOperatorId(), GetShiftId(), dto);
        return Ok(ApiResponse<DenominationCountDto>.Ok(result));
    }

    [HttpPost("close/{registerId:guid}")]
    [Idempotent]
    public async Task<IActionResult> CloseRegister(Guid registerId)
    {
        await _cashDeskService.CloseRegisterAsync(GetBranchId(), GetOperatorId(), GetShiftId(), registerId);
        return Ok(new { success = true, message = "Register closed successfully" });
    }
}
