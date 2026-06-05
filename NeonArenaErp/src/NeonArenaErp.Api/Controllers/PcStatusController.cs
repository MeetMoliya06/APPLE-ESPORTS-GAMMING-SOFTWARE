using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeonArenaErp.Api.Filters;
using NeonArenaErp.Application.Interfaces;
using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.DTOs.PcStatus;

namespace NeonArenaErp.Api.Controllers;

[ApiController]
[Route("api/pcs")]
[Authorize]
[BranchIsolation]
public class PcsController : ControllerBase
{
    private readonly IPcStatusService _pcStatusService;

    public PcsController(IPcStatusService pcStatusService)
    {
        _pcStatusService = pcStatusService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var branchId = Guid.Parse(HttpContext.Items["BranchId"]!.ToString()!);
        var pcs = await _pcStatusService.GetBranchPcStatusesAsync(branchId);
        
        return Ok(ApiResponse<IEnumerable<PcStatusDto>>.Ok(pcs));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var pc = await _pcStatusService.GetPcStatusAsync(id);
        return Ok(ApiResponse<PcStatusDto>.Ok(pc));
    }
}
