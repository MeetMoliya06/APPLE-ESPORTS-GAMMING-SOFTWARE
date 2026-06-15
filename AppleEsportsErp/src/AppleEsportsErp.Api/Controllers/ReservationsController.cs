using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AppleEsportsErp.Api.Filters;
using AppleEsportsErp.Application.DTOs.Common;
using AppleEsportsErp.Application.DTOs.Reservations;
using AppleEsportsErp.Application.Interfaces;
using System.Security.Claims;

namespace AppleEsportsErp.Api.Controllers;

[ApiController]
[Route("api/reservations")]
[Authorize]
[BranchIsolation]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationsController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    private Guid GetBranchId() => Guid.Parse(HttpContext.Items["BranchId"]!.ToString()!);
    private Guid GetOperatorId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetActiveReservations([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var result = await _reservationService.GetActiveReservationsAsync(GetBranchId(), page, pageSize);
        return Ok(ApiResponse<PaginatedResult<ReservationDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateReservation([FromBody] CreateReservationDto dto)
    {
        var result = await _reservationService.CreateReservationAsync(GetBranchId(), GetOperatorId(), dto);
        return Ok(ApiResponse<ReservationDto>.Ok(result));
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelReservation(Guid id, [FromBody] CancelReservationDto dto)
    {
        var result = await _reservationService.CancelReservationAsync(GetBranchId(), GetOperatorId(), id, dto);
        return Ok(ApiResponse<ReservationDto>.Ok(result));
    }

    [HttpPost("{id}/start")]
    public async Task<IActionResult> StartReservedSession(Guid id)
    {
        var result = await _reservationService.StartReservedSessionAsync(GetBranchId(), GetOperatorId(), id);
        return Ok(ApiResponse<ReservationDto>.Ok(result));
    }

    [HttpPost("{id}/override")]
    public async Task<IActionResult> OverrideReservation(Guid id, [FromBody] OverrideReservationDto dto)
    {
        var result = await _reservationService.OverrideReservationAsync(GetBranchId(), GetOperatorId(), id, dto);
        return Ok(ApiResponse<ReservationDto>.Ok(result));
    }
}
