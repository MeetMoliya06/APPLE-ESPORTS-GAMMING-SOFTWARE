using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.DTOs.Wallets;

namespace NeonArenaErp.Application.Interfaces;

public interface IWalletService
{
    Task<WalletTransactionDto> TopUpWalletAsync(Guid branchId, Guid operatorId, Guid shiftId, Guid memberId, TopUpWalletDto dto);
    Task<WalletTransactionDto> DeductWalletAsync(Guid branchId, Guid operatorId, Guid memberId, DeductWalletDto dto);
    Task<PaginatedResult<WalletTransactionDto>> GetWalletHistoryAsync(Guid memberId, int page = 1, int pageSize = 50);
}
