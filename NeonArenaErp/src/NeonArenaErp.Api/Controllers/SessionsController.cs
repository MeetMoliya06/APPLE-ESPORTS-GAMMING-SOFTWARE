using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeonArenaErp.Api.Filters;
using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.DTOs.Sessions;
using NeonArenaErp.Application.Interfaces;

namespace NeonArenaErp.Api.Controllers;

[ApiController]
[Route("api/sessions")]
[Authorize]
[BranchIsolation]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessionService;

    public SessionsController(ISessionService sessionService)
    {
        _sessionService = sessionService;
    }

    private Guid GetOperatorId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private Guid GetBranchId() => Guid.Parse(HttpContext.Items["BranchId"]!.ToString()!);
    private Guid GetShiftId() => Guid.Parse(User.FindFirstValue("shiftId") ?? Guid.Empty.ToString());

    [HttpGet]
    public async Task<IActionResult> GetActiveSessions([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var result = await _sessionService.GetActiveSessionsAsync(GetBranchId(), page, pageSize);
        return Ok(ApiResponse<PaginatedResult<SessionDto>>.Ok(result));
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartSession([FromBody] SessionStartDto dto)
    {
        var result = await _sessionService.StartSessionAsync(GetBranchId(), GetOperatorId(), GetShiftId(), dto);
        return Ok(ApiResponse<SessionDto>.Ok(result));
    }

    [HttpPost("{id}/stop")]
    public async Task<IActionResult> StopSession(Guid id)
    {
        var result = await _sessionService.StopSessionAsync(GetBranchId(), GetOperatorId(), id);
        return Ok(ApiResponse<SessionDto>.Ok(result));
    }

    [HttpPost("{id}/extend")]
    public async Task<IActionResult> ExtendSession(Guid id, [FromBody] SessionExtendDto dto)
    {
        var result = await _sessionService.ExtendSessionAsync(GetBranchId(), GetOperatorId(), id, dto);
        return Ok(ApiResponse<SessionDto>.Ok(result));
    }

    [HttpPost("{id}/transfer")]
    public async Task<IActionResult> TransferSession(Guid id, [FromBody] SessionTransferDto dto)
    {
        var result = await _sessionService.TransferSessionAsync(GetBranchId(), GetOperatorId(), id, dto);
        return Ok(ApiResponse<SessionDto>.Ok(result));
    }
}
