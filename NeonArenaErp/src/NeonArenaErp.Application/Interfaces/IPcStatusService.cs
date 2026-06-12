using NeonArenaErp.Application.DTOs.PcStatus;

namespace NeonArenaErp.Application.Interfaces;

public interface IPcStatusService
{
    Task<IEnumerable<PcStatusDto>> GetBranchPcStatusesAsync(Guid branchId);
    Task<PcStatusDto> GetPcStatusAsync(Guid pcId);
    Task BroadcastPcStatusChangeAsync(Guid branchId, Guid pcId);
}
