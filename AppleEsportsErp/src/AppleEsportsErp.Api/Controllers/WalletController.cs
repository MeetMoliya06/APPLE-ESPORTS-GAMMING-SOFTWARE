using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AppleEsportsErp.Api.Filters;
using AppleEsportsErp.Application.DTOs.Common;
using AppleEsportsErp.Application.DTOs.Wallets;
using AppleEsportsErp.Application.Exceptions;
using AppleEsportsErp.Application.Interfaces;
using System.Security.Claims;

namespace AppleEsportsErp.Api.Controllers;

[ApiController]
[Route("api/wallets")]
[Authorize]
[BranchIsolation]
public class WalletController : ControllerBase
{
    private readonly IWalletService _walletService;

    public WalletController(IWalletService walletService)
    {
        _walletService = walletService;
    }

    private Guid GetBranchId() => Guid.Parse(HttpContext.Items["BranchId"]!.ToString()!);
    private Guid GetOperatorId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    private Guid GetShiftId()
    {
        var shiftClaim = User.FindFirstValue("shiftId");
        if (string.IsNullOrEmpty(shiftClaim))
            throw new AppException("Active shift required for wallet operations.");
        return Guid.Parse(shiftClaim);
    }

    [HttpGet("{memberId:guid}")]
    public async Task<IActionResult> GetWalletHistory(Guid memberId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var result = await _walletService.GetWalletHistoryAsync(memberId, page, pageSize);
        return Ok(ApiResponse<PaginatedResult<WalletTransactionDto>>.Ok(result));
    }

    [HttpPost("{memberId:guid}/topup")]
    [Idempotent]
    public async Task<IActionResult> TopUpWallet(Guid memberId, [FromBody] TopUpWalletDto dto)
    {
        var result = await _walletService.TopUpWalletAsync(GetBranchId(), GetOperatorId(), GetShiftId(), memberId, dto);
        return Ok(ApiResponse<WalletTransactionDto>.Ok(result));
    }

    [HttpPost("{memberId:guid}/deduct")]
    [Idempotent]
    public async Task<IActionResult> DeductWallet(Guid memberId, [FromBody] DeductWalletDto dto)
    {
        var result = await _walletService.DeductWalletAsync(GetBranchId(), GetOperatorId(), memberId, dto);
        return Ok(ApiResponse<WalletTransactionDto>.Ok(result));
    }
}
