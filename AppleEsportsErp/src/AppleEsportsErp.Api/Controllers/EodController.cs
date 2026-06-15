using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AppleEsportsErp.Api.Filters;
using AppleEsportsErp.Application.DTOs.Common;
using AppleEsportsErp.Application.DTOs.Eod;
using AppleEsportsErp.Application.Interfaces;
using AppleEsportsErp.Application.Constants;
using System.Security.Claims;

using Microsoft.EntityFrameworkCore;

namespace AppleEsportsErp.Api.Controllers;

[ApiController]
[Route("api/eod")]
[Authorize]
[BranchIsolation]
public class EodController : ControllerBase
{
    private readonly IEodService _eodService;
    private readonly IUnitOfWork _unitOfWork;

    public EodController(IEodService eodService, IUnitOfWork unitOfWork)
    {
        _eodService = eodService;
        _unitOfWork = unitOfWork;
    }

    [HttpGet("range-report")]
    public async Task<IActionResult> GetRangeReport(
        [FromQuery] DateTimeOffset? startDate, 
        [FromQuery] DateTimeOffset? endDate, 
        [FromQuery] Guid? branchId = null)
    {
        var targetBranchId = branchId ?? GetBranchId();
        
        var startUtc = (startDate ?? DateTimeOffset.UtcNow.AddDays(-30)).ToUniversalTime();
        var endUtc = (endDate ?? DateTimeOffset.UtcNow).ToUniversalTime();

        var bills = await _unitOfWork.Repository<AppleEsportsErp.Domain.Entities.Bill>()
            .Query()
            .Where(b => b.BranchId == targetBranchId 
                     && b.Status == AppleEsportsErp.Domain.Enums.BillStatus.Completed 
                     && b.CompletedAt >= startUtc 
                     && b.CompletedAt <= endUtc)
            .ToListAsync();

        var dailyReport = bills
            .GroupBy(b => b.CompletedAt!.Value.Date)
            .Select(g => new {
                Date = g.Key.ToString("yyyy-MM-dd"),
                GamingRevenue = g.Sum(b => b.GamingAmount),
                FoodRevenue = g.Sum(b => b.FoodAmount),
                TotalRevenue = g.Sum(b => b.TotalAmount)
            })
            .OrderBy(r => r.Date)
            .ToList();

        var monthlyReport = bills
            .GroupBy(b => new { b.CompletedAt!.Value.Year, b.CompletedAt!.Value.Month })
            .Select(g => new {
                Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                GamingRevenue = g.Sum(b => b.GamingAmount),
                FoodRevenue = g.Sum(b => b.FoodAmount),
                TotalRevenue = g.Sum(b => b.TotalAmount)
            })
            .OrderBy(r => r.Month)
            .ToList();

        return Ok(ApiResponse<object>.Ok(new {
            Daily = dailyReport,
            Monthly = monthlyReport
        }));
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
