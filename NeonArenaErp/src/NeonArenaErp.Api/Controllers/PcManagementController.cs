using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.DTOs.PcManagement;
using NeonArenaErp.Application.Interfaces;
using System.Security.Claims;

namespace NeonArenaErp.Api.Controllers;

[ApiController]
[Route("api/pc-management")]
[Authorize(Roles = "SuperAdmin")] // Q2: Claim-based authorization
public class PcManagementController : ControllerBase
{
    private readonly IPcManagementService _pcManagementService;

    public PcManagementController(IPcManagementService pcManagementService)
    {
        _pcManagementService = pcManagementService;
    }

    private Guid GetSuperAdminId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("branch/{branchId:guid}")]
    public async Task<IActionResult> GetPcsByBranch(Guid branchId, [FromQuery] bool includeDeleted = false)
    {
        var result = await _pcManagementService.GetPcsByBranchAsync(branchId, includeDeleted);
        return Ok(ApiResponse<List<PcDto>>.Ok(result));
    }

    [HttpPost("branch/{branchId:guid}")]
    public async Task<IActionResult> AddPc(Guid branchId, [FromBody] CreatePcDto dto)
    {
        var result = await _pcManagementService.AddPcAsync(branchId, GetSuperAdminId(), dto);
        return Ok(ApiResponse<PcDto>.Ok(result));
    }

    [HttpPut("{pcId:guid}")]
    public async Task<IActionResult> UpdatePc(Guid pcId, [FromBody] UpdatePcDto dto)
    {
        var result = await _pcManagementService.UpdatePcAsync(pcId, GetSuperAdminId(), dto);
        return Ok(ApiResponse<PcDto>.Ok(result));
    }

    [HttpPost("{pcId:guid}/transfer/{newBranchId:guid}")]
    public async Task<IActionResult> TransferPc(Guid pcId, Guid newBranchId)
    {
        var result = await _pcManagementService.TransferPcAsync(pcId, newBranchId, GetSuperAdminId());
        return Ok(ApiResponse<PcDto>.Ok(result));
    }

    [HttpPost("{pcId:guid}/maintenance")]
    public async Task<IActionResult> MarkMaintenance(Guid pcId, [FromQuery] bool enable)
    {
        var result = await _pcManagementService.MarkMaintenanceAsync(pcId, GetSuperAdminId(), enable);
        return Ok(ApiResponse<PcDto>.Ok(result));
    }

    [HttpDelete("{pcId:guid}")]
    public async Task<IActionResult> DeletePc(Guid pcId)
    {
        await _pcManagementService.DeletePcAsync(pcId, GetSuperAdminId());
        return Ok(ApiResponse.Ok());
    }
}
