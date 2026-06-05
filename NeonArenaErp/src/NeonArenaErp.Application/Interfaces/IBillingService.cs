using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.DTOs.Billing;

namespace NeonArenaErp.Application.Interfaces;

public interface IBillingService
{
    Task<PaginatedResult<BillDto>> GetActiveBillsAsync(Guid branchId, int page = 1, int pageSize = 50);
    Task<BillDto> GetBillAsync(Guid branchId, Guid id);
    Task<BillDto> ApplyDiscountAsync(Guid branchId, Guid superAdminId, Guid id, ApplyDiscountDto dto);
    Task<BillDto> ProcessPaymentAsync(Guid branchId, Guid operatorId, Guid shiftId, Guid id, ProcessPaymentDto dto);
}
