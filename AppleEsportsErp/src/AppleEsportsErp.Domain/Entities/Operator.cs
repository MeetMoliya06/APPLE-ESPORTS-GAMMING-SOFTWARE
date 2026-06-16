using AppleEsportsErp.Domain.Enums;

namespace AppleEsportsErp.Domain.Entities;

/// <summary>SOP §5.2: Operators — Branch-level operational role with dashboard permissions</summary>
public class Operator
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string? MobileNumber { get; set; }
    public Guid BranchId { get; set; }
    public OperatorStatus Status { get; set; } = OperatorStatus.Active;

    /// <summary>SOP §19.2: Dashboard Permission Control — JSONB stored as string</summary>
    public string DashboardPermissions { get; set; } = @"{
        ""billing_counter"": true,
        ""sessions"": true,
        ""reservations"": true,
        ""food_orders"": true,
        ""cash_register"": true,
        ""cash_desk"": true,
        ""members"": true,
        ""menu_editor"": true,
        ""main_dashboard"": true,
        ""pc_status"": false,
        ""eod"": false,
        ""settings"": false
    }";

    public DateTimeOffset? LastLogin { get; set; }
    public string? DeviceInfo { get; set; } // JSONB
    
    // Live session monitoring
    public bool IsOnline { get; set; }
    public string? CurrentSessionToken { get; set; }
    
    public Guid? CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation
    public Branch Branch { get; set; } = null!;
    public User? Creator { get; set; }
    public ICollection<Shift> Shifts { get; set; } = new List<Shift>();
    public ICollection<Session> Sessions { get; set; } = new List<Session>();
}
