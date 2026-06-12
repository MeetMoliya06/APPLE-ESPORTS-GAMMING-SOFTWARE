using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using NeonArenaErp.Application.Constants;

namespace NeonArenaErp.Api.Hubs;

/// <summary>
/// Base hub with branch isolation and group management.
/// SOP §20: All dashboards require live synchronization.
/// Q2 Decision: Auto-negotiation (WebSocket primary, SSE + Long Polling fallback).
/// </summary>
[Authorize]
public abstract class BranchAwareHub : Hub
{
    protected ILogger Logger { get; }

    protected BranchAwareHub(ILogger logger) => Logger = logger;

    public override async Task OnConnectedAsync()
    {
        var role = Context.User?.FindFirstValue(ClaimTypes.Role);
        var branchId = Context.User?.FindFirstValue("branchId");
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        var userName = Context.User?.FindFirstValue(ClaimTypes.Name);

        // SOP §6.4: Operators join their branch group only
        if (role == Roles.Operator && !string.IsNullOrEmpty(branchId))
            await Groups.AddToGroupAsync(Context.ConnectionId, $"branch:{branchId}");

        // Super Admin joins all-branches group
        if (role == Roles.SuperAdmin)
            await Groups.AddToGroupAsync(Context.ConnectionId, "admin:all");

        // User-specific group for targeted notifications
        if (!string.IsNullOrEmpty(userId))
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");

        Logger.LogInformation("Hub connected: {User} ({Role}) [{Hub}] - ConnectionId: {ConnectionId} - Branch: {BranchId}", 
            userName, role, GetType().Name, Context.ConnectionId, branchId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userName = Context.User?.FindFirstValue(ClaimTypes.Name);
        if (exception != null)
        {
            Logger.LogWarning(exception, "Hub disconnected with error: {User} [{Hub}] - ConnectionId: {ConnectionId}", 
                userName, GetType().Name, Context.ConnectionId);
        }
        else
        {
            Logger.LogInformation("Hub disconnected gracefully: {User} [{Hub}] - ConnectionId: {ConnectionId}", 
                userName, GetType().Name, Context.ConnectionId);
        }
        await base.OnDisconnectedAsync(exception);
    }
}

/// <summary>SOP §7: Session state sync — /hubs/sessions</summary>
public class SessionHub : BranchAwareHub
{
    public SessionHub(ILogger<SessionHub> logger) : base(logger) { }
}

/// <summary>SOP §9: Billing counter sync — /hubs/billing</summary>
public class BillingHub : BranchAwareHub
{
    public BillingHub(ILogger<BillingHub> logger) : base(logger) { }
}

/// <summary>SOP §8: Reservation state sync — /hubs/reservations</summary>
public class ReservationHub : BranchAwareHub
{
    public ReservationHub(ILogger<ReservationHub> logger) : base(logger) { }
}

/// <summary>SOP §17: PC state sync — /hubs/pc-status</summary>
public class PcStatusHub : BranchAwareHub
{
    public PcStatusHub(ILogger<PcStatusHub> logger) : base(logger) { }
}

/// <summary>SOP §12: Food order sync — /hubs/food-orders</summary>
public class FoodOrderHub : BranchAwareHub
{
    public FoodOrderHub(ILogger<FoodOrderHub> logger) : base(logger) { }
}

/// <summary>SOP §10/§11: Cash register/desk sync — /hubs/cash</summary>
public class CashHub : BranchAwareHub
{
    public CashHub(ILogger<CashHub> logger) : base(logger) { }
}

/// <summary>Cross-cutting alerts and notifications — /hubs/notifications</summary>
public class NotificationHub : BranchAwareHub
{
    public NotificationHub(ILogger<NotificationHub> logger) : base(logger) { }
}
