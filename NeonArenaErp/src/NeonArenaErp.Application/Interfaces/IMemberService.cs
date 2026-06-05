using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.DTOs.Members;

namespace NeonArenaErp.Application.Interfaces;

public interface IMemberService
{
    Task<PaginatedResult<MemberDto>> GetMembersAsync(Guid branchId, string? search, int page = 1, int pageSize = 50);
    Task<MemberDto> GetMemberByIdAsync(Guid id);
    Task<MemberDto> GetMemberByMobileAsync(string mobileNumber);
    Task<MemberDto> RegisterMemberAsync(Guid branchId, Guid operatorId, RegisterMemberDto dto);
    Task<MemberDto> UpdateMemberAsync(Guid branchId, Guid operatorId, Guid id, UpdateMemberDto dto);
}
