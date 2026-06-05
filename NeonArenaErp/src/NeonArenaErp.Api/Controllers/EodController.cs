using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeonArenaErp.Api.Filters;
using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.DTOs.Eod;
using NeonArenaErp.Application.Interfaces;
using NeonArenaErp.Application.Constants;
using System.Security.Claims;

namespace NeonArenaErp.Api.Controllers;

[ApiController]
[Route("api/eod")]
[Authorize]
[BranchIsolation]
public class EodController : ControllerBase
{
    private readonly IEodService _eodService;

    public EodController(IEodService eodService)
    {
        _eodService = eodService;
    }

    private Guid GetBranchId() => Guid.Parse(HttpContext.Items["BranchId"]!.ToString()!);
    private Guid GetOperatorId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("report")]
    [HttpGet("preview")]
    public async Task<IActionResult> GetPreview([FromQuery] DateTimeOffset? date)
    {
        var targetDate = (date ?? DateTimeOffset.UtcNow).ToUniversalTime();
        var result = await _eodService.GenerateEodReportAsync(GetBranchId(), targetDate);
        return Ok(ApiResponse<EodReportDto>.Ok(result));
    }

    [HttpGet("validation")]
    public async Task<IActionResult> GetValidationStatus([FromQuery] DateTimeOffset? date)
    {
        var targetDate = (date ?? DateTimeOffset.UtcNow).ToUniversalTime();
        var result = await _eodService.GetValidationStatusAsync(GetBranchId(), targetDate);
        return Ok(ApiResponse<ValidationStatusDto>.Ok(result));
    }

    [HttpPost("finalize")]
    [Authorize(Roles = Roles.SuperAdmin)] // Strictly SuperAdmin as per SOP
    public async Task<IActionResult> FinalizeEod([FromBody] FinalizeEodRequest request)
    {
        var targetDate = (request.Date ?? DateTimeOffset.UtcNow).ToUniversalTime();
        var result = await _eodService.FinalizeEodAsync(GetBranchId(), GetOperatorId(), targetDate);
        return Ok(ApiResponse<EodSnapshotDto>.Ok(result));
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistoricalEod([FromQuery] DateTimeOffset date)
    {
        var result = await _eodService.GetHistoricalEodAsync(GetBranchId(), date.ToUniversalTime());
        if (result == null) return NotFound(ApiResponse<EodSnapshotDto>.Fail("No finalized EOD snapshot found for the specified date."));
        return Ok(ApiResponse<EodSnapshotDto>.Ok(result));
    }
}

public class FinalizeEodRequest
{
    public DateTimeOffset? Date { get; set; }
}
