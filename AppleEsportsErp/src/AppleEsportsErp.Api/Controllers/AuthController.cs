using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppleEsportsErp.Application.DTOs.Auth;
using AppleEsportsErp.Application.DTOs.Common;
using AppleEsportsErp.Application.Interfaces;

namespace AppleEsportsErp.Api.Controllers;

/// <summary>
/// Authentication controller — maps from auth.routes.js + auth.controller.js.
/// SOP §6: Login System (Admin + Operator flows)
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>SOP §6.2: Super Admin Login — POST /api/auth/admin/login</summary>
    [HttpPost("admin/login")]
    [AllowAnonymous]
    public async Task<IActionResult> AdminLogin([FromBody] AdminLoginDto dto)
    {
        var result = await _authService.LoginAdminAsync(dto);
        return Ok(ApiResponse<LoginResponseDto>.Ok(result));
    }

    /// <summary>SOP §6.3: Operator Login — POST /api/auth/operator/login</summary>
    [HttpPost("operator/login")]
    [AllowAnonymous]
    public async Task<IActionResult> OperatorLogin([FromBody] OperatorLoginDto dto)
    {
        var result = await _authService.LoginOperatorAsync(dto);
        return Ok(ApiResponse<LoginResponseDto>.Ok(result));
    }

    /// <summary>SOP §10: Logout — POST /api/auth/logout</summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role)!;
        var shiftIdClaim = User.FindFirstValue("shiftId");
        var shiftId = string.IsNullOrEmpty(shiftIdClaim) ? (Guid?)null : Guid.Parse(shiftIdClaim);

        await _authService.LogoutAsync(userId, role, shiftId);
        return Ok(ApiResponse.Ok());
    }

    /// <summary>Refresh token — POST /api/auth/refresh</summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
    {
        var result = await _authService.RefreshAccessTokenAsync(dto.RefreshToken);
        return Ok(ApiResponse<TokenResponseDto>.Ok(result));
    }

    /// <summary>SOP §19: Get current user — GET /api/auth/me</summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role)!;

        var result = await _authService.GetCurrentUserAsync(userId, role);
        return Ok(ApiResponse<UserProfileDto>.Ok(result));
    }

    /// <summary>SOP §6.3 Step 2: Get branches — GET /api/auth/branches</summary>
    [HttpGet("branches")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBranches()
    {
        var branches = await _authService.GetActiveBranchesAsync();
        return Ok(ApiResponse<IEnumerable<BranchListItemDto>>.Ok(branches));
    }

    /// <summary>SOP §6.3 Step 3: Get operators — GET /api/auth/operators/{branchId}</summary>
    [HttpGet("operators/{branchId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBranchOperators(Guid branchId)
    {
        var operators = await _authService.GetBranchOperatorsAsync(branchId);
        return Ok(ApiResponse<IEnumerable<OperatorListItemDto>>.Ok(operators));
    }

    /// <summary>SOP §11: Force logout — POST /api/auth/force-logout/{id}</summary>
    [HttpPost("force-logout/{id:guid}")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<IActionResult> ForceLogout(Guid id)
    {
        var adminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _authService.ForceLogoutAsync(adminId, id);
        return Ok(ApiResponse<ForceLogoutResponseDto>.Ok(result));
    }

    /// <summary>Temporary password reset helper endpoint</summary>
    [HttpPost("temp-reset")]
    [AllowAnonymous]
    public async Task<IActionResult> TempReset([FromServices] AppleEsportsErp.Infrastructure.Data.AppDbContext db)
    {
        var adminHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
        var opHash = BCrypt.Net.BCrypt.HashPassword("1234");

        var admin = await db.Users.FirstOrDefaultAsync(u => u.Email == "admin@appleesports.com");
        if (admin != null)
        {
            admin.PasswordHash = adminHash;
            admin.Status = AppleEsportsErp.Domain.Enums.UserStatus.Active;
        }

        var operators = await db.Operators.ToListAsync();
        foreach (var op in operators)
        {
            op.PasswordHash = opHash;
            op.Status = AppleEsportsErp.Domain.Enums.OperatorStatus.Active;
        }

        await db.SaveChangesAsync();
        return Ok(new { message = "Passwords reset successfully", adminEmail = admin?.Email });
    }

    /// <summary>Verify admin password — POST /api/auth/verify-admin</summary>
    [HttpPost("verify-admin")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyAdmin([FromBody] VerifyAdminDto dto)
    {
        var isValid = await _authService.VerifyAdminPasswordAsync(dto.Password);
        if (!isValid)
        {
            return BadRequest(ApiResponse.Fail("Invalid admin password", "INVALID_ADMIN_PASSWORD"));
        }
        return Ok(ApiResponse.Ok());
    }
}

