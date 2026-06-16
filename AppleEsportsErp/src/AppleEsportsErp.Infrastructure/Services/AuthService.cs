using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AppleEsportsErp.Application.Constants;
using AppleEsportsErp.Application.DTOs.Auth;
using AppleEsportsErp.Application.Exceptions;
using AppleEsportsErp.Application.Interfaces;
using AppleEsportsErp.Domain.Entities;
using AppleEsportsErp.Domain.Enums;
using AppleEsportsErp.Infrastructure.Data;
using AppleEsportsErp.Infrastructure.Identity;
using BCryptNet = BCrypt.Net.BCrypt;

namespace AppleEsportsErp.Infrastructure.Services;

/// <summary>
/// Full AuthService implementation — 1:1 mapping from auth.service.js.
/// SOP §6: Login System (Admin + Operator flows)
/// SOP §21: Security Model (hashing, tokens, device tracking)
/// SOP §10: Shift Management (auto shift start on login)
/// </summary>
public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly JwtTokenService _jwt;
    private readonly IAuditService _audit;
    private readonly ILogger<AuthService> _logger;
    private readonly ITokenRevocationService _tokenRevocation;
    private const int SALT_ROUNDS = 12;

    public AuthService(AppDbContext db, JwtTokenService jwt, IAuditService audit, ILogger<AuthService> logger, ITokenRevocationService tokenRevocation)
    {
        _db = db;
        _jwt = jwt;
        _audit = audit;
        _logger = logger;
        _tokenRevocation = tokenRevocation;
    }

    /// <summary>
    /// SOP §6.2: Super Admin Login — Email/Password → Validate credentials, permissions, device, account status.
    /// SOP: Super Admin session persists until logout/timeout/password reset/forced signout.
    /// Maps from: auth.service.js loginAdmin()
    /// </summary>
    public async Task<LoginResponseDto> LoginAdminAsync(AdminLoginDto dto)
    {
        // 1. Find admin user
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
            throw new AuthenticationException("Invalid email or password", "INVALID_CREDENTIALS");

        // 2. Check account status
        if (user.Status != UserStatus.Active)
            throw new AuthorizationException($"Account is {user.Status}. Contact system administrator.", "ACCOUNT_INACTIVE");

        // 3. Verify password — SOP §21.1: Password Hashing = YES
        if (!BCryptNet.Verify(dto.Password, user.PasswordHash))
        {
            // Log failed attempt — SOP §22: Audit every critical action
            await _audit.LogAsync(new AuditEntry
            {
                UserId = user.Id,
                UserRole = Roles.SuperAdmin,
                UserName = user.FullName,
                Action = AuditActions.FailedLogin,
                Details = new { reason = "Invalid password", deviceInfo = dto.DeviceInfo },
            });
            throw new AuthenticationException("Invalid email or password", "INVALID_CREDENTIALS");
        }

        // 4. Generate tokens — Q1 Decision: full claims embedded in JWT
        var claims = new Dictionary<string, string>
        {
            [ClaimTypes.NameIdentifier] = user.Id.ToString(),
            [ClaimTypes.Role] = Roles.SuperAdmin,
            [ClaimTypes.Name] = user.FullName,
        };

        var accessToken = _jwt.GenerateAccessToken(claims);
        var refreshToken = _jwt.GenerateRefreshToken(claims);

        // 5. Update last login + device info — SOP §21.1: Device Tracking
        user.LastLogin = DateTimeOffset.UtcNow;
        user.DeviceInfo = dto.DeviceInfo != null ? JsonSerializer.Serialize(dto.DeviceInfo) : null;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();

        // 6. Audit log — SOP §22
        await _audit.LogAsync(new AuditEntry
        {
            UserId = user.Id,
            UserRole = Roles.SuperAdmin,
            UserName = user.FullName,
            Action = AuditActions.Login,
            Details = new { method = "email_password", deviceInfo = dto.DeviceInfo },
        });

        _logger.LogInformation("Super Admin logged in: {Name}", user.FullName);

        return new LoginResponseDto
        {
            User = new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = Roles.SuperAdmin,
                Status = user.Status.ToString().ToLowerInvariant(),
                LastLogin = user.LastLogin,
            },
            AccessToken = accessToken,
            RefreshToken = refreshToken,
        };
    }

    /// <summary>
    /// SOP §6.3: Operator Login — Select Branch → Select Profile → Enter PIN → System starts shift.
    /// SOP: Operator CANNOT see other branch data (enforced via branch assignment check).
    /// Maps from: auth.service.js loginOperator()
    /// </summary>
    public async Task<LoginResponseDto> LoginOperatorAsync(OperatorLoginDto dto)
    {
        // 1. Verify branch exists and is active
        var branch = await _db.Branches.FirstOrDefaultAsync(b => b.Id == dto.BranchId);
        if (branch == null)
            throw new NotFoundException("Branch not found", "BRANCH_NOT_FOUND");
        if (branch.Status != BranchStatus.Active)
            throw new AuthorizationException("Branch is currently inactive", "BRANCH_INACTIVE");

        // 2. Find operator assigned to this branch
        var op = await _db.Operators.FirstOrDefaultAsync(
            o => o.Username == dto.Username && o.BranchId == dto.BranchId);
        if (op == null)
            throw new AuthenticationException("Invalid credentials or operator not assigned to this branch", "INVALID_CREDENTIALS");

        // 3. Check operator status — SOP §12: Operator Status Types
        if (op.Status == OperatorStatus.Suspended)
            throw new AuthorizationException("Operator account is suspended. Contact Super Admin.", "OPERATOR_SUSPENDED");
        if (op.Status == OperatorStatus.Disabled)
            throw new AuthorizationException("Operator account is disabled. Contact Super Admin.", "OPERATOR_DISABLED");

        // 4. Verify password/PIN
        if (!BCryptNet.Verify(dto.Password, op.PasswordHash))
        {
            await _audit.LogAsync(new AuditEntry
            {
                OperatorId = op.Id,
                UserRole = Roles.Operator,
                UserName = op.FullName,
                Action = AuditActions.FailedLogin,
                BranchId = dto.BranchId,
                BranchName = branch.Name,
                Details = new { reason = "Invalid password/PIN", deviceInfo = dto.DeviceInfo },
            });
            throw new AuthenticationException("Invalid password or PIN", "INVALID_CREDENTIALS");
        }

        // 5. Start shift — SOP §5: log operator, branch, login time, device
        var shift = new Shift
        {
            OperatorId = op.Id,
            BranchId = dto.BranchId,
            LoginTime = DateTimeOffset.UtcNow,
            DeviceInfo = dto.DeviceInfo != null ? JsonSerializer.Serialize(dto.DeviceInfo) : null,
            Status = ShiftStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        _db.Shifts.Add(shift);

        // 6. Update operator status to active
        op.Status = OperatorStatus.Active;
        op.LastLogin = DateTimeOffset.UtcNow;
        op.DeviceInfo = dto.DeviceInfo != null ? JsonSerializer.Serialize(dto.DeviceInfo) : null;
        op.IsOnline = true;
        op.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        // 7. Generate tokens with branch + permissions embedded — Q1 Decision
        var claims = new Dictionary<string, string>
        {
            [ClaimTypes.NameIdentifier] = op.Id.ToString(),
            [ClaimTypes.Role] = Roles.Operator,
            [ClaimTypes.Name] = op.FullName,
            ["branchId"] = op.BranchId.ToString(),
            ["shiftId"] = shift.Id.ToString(),
            ["dashboardPermissions"] = op.DashboardPermissions ?? "{}",
        };

        var accessToken = _jwt.GenerateAccessToken(claims);
        var refreshToken = _jwt.GenerateRefreshToken(claims);

        // 8. Audit log — login
        await _audit.LogAsync(new AuditEntry
        {
            OperatorId = op.Id,
            UserRole = Roles.Operator,
            UserName = op.FullName,
            Action = AuditActions.Login,
            BranchId = dto.BranchId,
            BranchName = branch.Name,
            Details = new { shiftId = shift.Id, loginTime = shift.LoginTime, deviceInfo = dto.DeviceInfo },
        });

        // 9. Shift start audit
        await _audit.LogAsync(new AuditEntry
        {
            OperatorId = op.Id,
            UserRole = Roles.Operator,
            UserName = op.FullName,
            Action = AuditActions.ShiftStart,
            BranchId = dto.BranchId,
            BranchName = branch.Name,
            Details = new { shiftId = shift.Id },
        });

        _logger.LogInformation("Operator logged in: {Name} @ {Branch}", op.FullName, branch.Name);

        return new LoginResponseDto
        {
            User = new UserProfileDto
            {
                Id = op.Id,
                FullName = op.FullName,
                Username = op.Username,
                Role = Roles.Operator,
                BranchId = op.BranchId,
                BranchName = branch.Name,
                ShiftId = shift.Id,
                DashboardPermissions = op.DashboardPermissions != null
                    ? JsonSerializer.Deserialize<object>(op.DashboardPermissions)
                    : null,
                Status = op.Status.ToString().ToLowerInvariant(),
                LastLogin = op.LastLogin,
                ActiveShift = new ActiveShiftDto { Id = shift.Id, LoginTime = shift.LoginTime },
            },
            AccessToken = accessToken,
            RefreshToken = refreshToken,
        };
    }

    /// <summary>
    /// SOP §10: Logout — closes shift for operators.
    /// SOP: System records logout time, shift summary, revenue, actions.
    /// Maps from: auth.service.js logout()
    /// </summary>
    public async Task LogoutAsync(Guid userId, string role, Guid? shiftId)
    {
        if (role == Roles.Operator && shiftId.HasValue)
        {
            // Close the operator's shift
            var shift = await _db.Shifts.FirstOrDefaultAsync(
                s => s.Id == shiftId.Value && s.OperatorId == userId && s.Status == ShiftStatus.Active);
            if (shift != null)
            {
                shift.LogoutTime = DateTimeOffset.UtcNow;
                shift.Status = ShiftStatus.Completed;
            }

            // Update operator status
            var op = await _db.Operators.FindAsync(userId);
            if (op != null) 
            {
                op.Status = OperatorStatus.LoggedOut;
                op.IsOnline = false;
            }

            await _db.SaveChangesAsync();
            _logger.LogInformation("Operator shift ended: {UserId}, shift: {ShiftId}", userId, shiftId);
        }

        // Fetch user name for audit
        string userName = "Unknown";
        if (role == Roles.SuperAdmin)
        {
            var user = await _db.Users.FindAsync(userId);
            userName = user?.FullName ?? "Admin";
        }
        else
        {
            var op = await _db.Operators.FindAsync(userId);
            userName = op?.FullName ?? "Operator";
        }

        await _audit.LogAsync(new AuditEntry
        {
            UserId = role == Roles.SuperAdmin ? userId : null,
            OperatorId = role == Roles.Operator ? userId : null,
            UserRole = role,
            UserName = userName,
            Action = AuditActions.Logout,
            Details = new { shiftId },
        });

        // Revoke tokens globally for this user (hardens against stale token reuse)
        await _tokenRevocation.RevokeUserTokensAsync(userId, TimeSpan.FromDays(7));
    }

    /// <summary>
    /// SOP §11: Force Logout — Super Admin forcibly logs out an operator.
    /// Instantly revoke access, terminate session, block future login.
    /// Maps from: auth.service.js forceLogout()
    /// </summary>
    public async Task<ForceLogoutResponseDto> ForceLogoutAsync(Guid adminId, Guid operatorId)
    {
        var op = await _db.Operators
            .Include(o => o.Branch)
            .FirstOrDefaultAsync(o => o.Id == operatorId);
        if (op == null)
            throw new NotFoundException("Operator not found", "OPERATOR_NOT_FOUND");

        // Close ALL active shifts for this operator
        var activeShifts = await _db.Shifts
            .Where(s => s.OperatorId == operatorId && s.Status == ShiftStatus.Active)
            .ToListAsync();
        foreach (var shift in activeShifts)
        {
            shift.LogoutTime = DateTimeOffset.UtcNow;
            shift.Status = ShiftStatus.ForceClosed;
        }

        // Set operator status to logged_out
        op.Status = OperatorStatus.LoggedOut;
        op.IsOnline = false;

        await _db.SaveChangesAsync();

        // Get admin name for audit
        var admin = await _db.Users.FindAsync(adminId);
        var adminName = admin?.FullName ?? "Admin";

        await _audit.LogAsync(new AuditEntry
        {
            UserId = adminId,
            UserRole = Roles.SuperAdmin,
            UserName = adminName,
            Action = AuditActions.ForcedLogout,
            TargetType = "operator",
            TargetId = operatorId,
            BranchId = op.BranchId,
            BranchName = op.Branch?.Name,
            Details = new { operatorName = op.FullName, reason = "Forced logout by Super Admin" },
        });

        _logger.LogWarning("FORCE LOGOUT: {Operator} by {Admin}", op.FullName, adminName);

        // Force revoke all existing tokens for this operator
        await _tokenRevocation.RevokeUserTokensAsync(operatorId, TimeSpan.FromDays(7));

        return new ForceLogoutResponseDto { Success = true, Operator = op.FullName };
    }

    /// <summary>
    /// Refresh access token — re-verify user is still active before issuing.
    /// Maps from: auth.service.js refreshAccessToken()
    /// </summary>
    public async Task<TokenResponseDto> RefreshAccessTokenAsync(string refreshToken)
    {
        var principal = _jwt.ValidateRefreshToken(refreshToken);
        if (principal == null)
            throw new AuthenticationException("Invalid refresh token", "REFRESH_INVALID");

        var id = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        var role = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(role))
            throw new AuthenticationException("Invalid refresh token", "REFRESH_INVALID");

        var userId = Guid.Parse(id);

        // Re-verify user still exists and is active
        if (role == Roles.SuperAdmin)
        {
            var active = await _db.Users.AnyAsync(u => u.Id == userId && u.Status == UserStatus.Active);
            if (!active) throw new AuthorizationException("Account is no longer active", "ACCOUNT_INACTIVE");
        }
        else if (role == Roles.Operator)
        {
            var active = await _db.Operators.AnyAsync(o => o.Id == userId && o.Status == OperatorStatus.Active);
            if (!active) throw new AuthorizationException("Account is no longer active", "ACCOUNT_INACTIVE");
        }

        // Re-generate with same payload
        var claims = new Dictionary<string, string>();
        foreach (var claim in principal.Claims)
        {
            if (!claims.ContainsKey(claim.Type))
                claims[claim.Type] = claim.Value;
        }

        return new TokenResponseDto { AccessToken = _jwt.GenerateAccessToken(claims) };
    }

    /// <summary>
    /// SOP §19: Get current user profile with permissions.
    /// Returns full dashboard permission map for frontend rendering.
    /// Maps from: auth.service.js getCurrentUser()
    /// </summary>
    public async Task<UserProfileDto> GetCurrentUserAsync(Guid userId, string role)
    {
        if (role == Roles.SuperAdmin)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) throw new NotFoundException("User not found", "USER_NOT_FOUND");

            return new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = Roles.SuperAdmin,
                Status = user.Status.ToString().ToLowerInvariant(),
                LastLogin = user.LastLogin,
            };
        }

        if (role == Roles.Operator)
        {
            var op = await _db.Operators
                .Include(o => o.Branch)
                .FirstOrDefaultAsync(o => o.Id == userId);
            if (op == null) throw new NotFoundException("Operator not found", "OPERATOR_NOT_FOUND");

            // Get active shift
            var activeShift = await _db.Shifts
                .Where(s => s.OperatorId == userId && s.Status == ShiftStatus.Active)
                .OrderByDescending(s => s.LoginTime)
                .Select(s => new ActiveShiftDto { Id = s.Id, LoginTime = s.LoginTime })
                .FirstOrDefaultAsync();

            return new UserProfileDto
            {
                Id = op.Id,
                FullName = op.FullName,
                Username = op.Username,
                Role = Roles.Operator,
                BranchId = op.BranchId,
                BranchName = op.Branch?.Name,
                DashboardPermissions = op.DashboardPermissions != null
                    ? JsonSerializer.Deserialize<object>(op.DashboardPermissions)
                    : null,
                Status = op.Status.ToString().ToLowerInvariant(),
                LastLogin = op.LastLogin,
                ActiveShift = activeShift,
            };
        }

        throw new AppException("Invalid role", System.Net.HttpStatusCode.BadRequest, "INVALID_ROLE");
    }

    /// <summary>SOP §6.3 Step 2: Get active branches for login screen</summary>
    public async Task<IEnumerable<BranchListItemDto>> GetActiveBranchesAsync()
    {
        return await _db.Branches
            .Where(b => b.Status == BranchStatus.Active)
            .OrderBy(b => b.Name)
            .Select(b => new BranchListItemDto
            {
                Id = b.Id,
                Name = b.Name,
                Address = b.Address,
                Status = b.Status.ToString().ToLowerInvariant(),
                OpeningTime = b.OpeningTime.ToString("HH:mm"),
                ClosingTime = b.ClosingTime.ToString("HH:mm"),
            })
            .ToListAsync();
    }

    /// <summary>SOP §6.3 Step 3: Get operators for a branch (for operator selection screen)</summary>
    public async Task<IEnumerable<OperatorListItemDto>> GetBranchOperatorsAsync(Guid branchId)
    {
        return await _db.Operators
            .Where(o => o.BranchId == branchId && o.Status != OperatorStatus.Disabled)
            .OrderBy(o => o.FullName)
            .Select(o => new OperatorListItemDto
            {
                Id = o.Id,
                FullName = o.FullName,
                Username = o.Username,
                Status = o.Status.ToString().ToLowerInvariant(),
            })
            .ToListAsync();
    }

    /// <summary>Verify if admin password is valid</summary>
    public async Task<bool> VerifyAdminPasswordAsync(string password)
    {
        var admin = await _db.Users.FirstOrDefaultAsync(u => u.Role == Roles.SuperAdmin || u.Email == "admin@appleesports.com");
        if (admin == null) return false;
        return BCryptNet.Verify(password, admin.PasswordHash);
    }
}
