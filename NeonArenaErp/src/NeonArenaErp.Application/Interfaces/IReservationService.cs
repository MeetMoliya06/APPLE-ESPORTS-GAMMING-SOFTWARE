using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.DTOs.Reservations;

namespace NeonArenaErp.Application.Interfaces;

public interface IReservationService
{
    Task<PaginatedResult<ReservationDto>> GetActiveReservationsAsync(Guid branchId, int page = 1, int pageSize = 50);
    Task<ReservationDto> GetReservationAsync(Guid id);
    Task<ReservationDto> CreateReservationAsync(Guid branchId, Guid operatorId, CreateReservationDto dto);
    Task<ReservationDto> CancelReservationAsync(Guid branchId, Guid operatorId, Guid id, CancelReservationDto dto);
    Task<ReservationDto> StartReservedSessionAsync(Guid branchId, Guid operatorId, Guid id);
    Task<ReservationDto> OverrideReservationAsync(Guid branchId, Guid operatorId, Guid id, OverrideReservationDto dto);
    
    // Auto-expire reservations (can be called periodically or passively on fetch)
    Task ExpirePastReservationsAsync(Guid branchId);
}
