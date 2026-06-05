using NeonArenaErp.Application.DTOs.Auth;

namespace NeonArenaErp.Application.Interfaces;

/// <summary>
/// Authentication service contract — maps from auth.service.js
/// SOP §6: Login System, §21: Security Model, §10: Shift Management
/// </summary>
public interface IAuthService
{
    /// <summary>SOP §6.2: Super Admin Login</summary>
    Task<LoginResponseDto> LoginAdminAsync(AdminLoginDto dto);

    /// <summary>SOP §6.3: Operator Login — branch → profile → PIN → shift start</summary>
    Task<LoginResponseDto> LoginOperatorAsync(OperatorLoginDto dto);

    /// <summary>SOP §10: Logout — closes shift for operators</summary>
    Task LogoutAsync(Guid userId, string role, Guid? shiftId);

    /// <summary>SOP §11: Force Logout — Super Admin forcibly logs out an operator</summary>
    Task<ForceLogoutResponseDto> ForceLogoutAsync(Guid adminId, Guid operatorId);

    /// <summary>Refresh access token</summary>
    Task<TokenResponseDto> RefreshAccessTokenAsync(string refreshToken);

    /// <summary>SOP §19: Current user profile with dashboard permissions</summary>
    Task<UserProfileDto> GetCurrentUserAsync(Guid userId, string role);

    /// <summary>SOP §6.3 Step 2: Get active branches for login screen</summary>
    Task<IEnumerable<BranchListItemDto>> GetActiveBranchesAsync();

    /// <summary>SOP §6.3 Step 3: Get operators for a branch</summary>
    Task<IEnumerable<OperatorListItemDto>> GetBranchOperatorsAsync(Guid branchId);
}
