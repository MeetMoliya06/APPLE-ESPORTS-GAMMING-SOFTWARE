using NeonArenaErp.Application.DTOs.Dashboard;

namespace NeonArenaErp.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(Guid? branchId = null);
    Task<IEnumerable<RecentActivityDto>> GetRecentActivityAsync(Guid? branchId = null, int limit = 20);
    Task<IEnumerable<BranchDashboardSummaryDto>> GetBranchSummariesAsync();
    Task InvalidateCacheAsync(Guid? branchId = null);
    Task BroadcastDashboardUpdateAsync(Guid? branchId = null);
}
