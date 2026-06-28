using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using AppleEsportsErp.Domain.Entities;
using AppleEsportsErp.Domain.Enums;
using AppleEsportsErp.Infrastructure.Data;

namespace AppleEsportsErp.Api.Hubs;

/// <summary>
/// Unauthenticated Hub for PC Overlay Clients.
/// Since PCs run in an anonymous overlay context, we do not require [Authorize].
/// </summary>
public class PcOverlayHub : Hub
{
    private readonly ILogger<PcOverlayHub> _logger;
    private readonly IHubContext<PcStatusHub> _pcStatusHub;
    private readonly IHubContext<FoodOrderHub> _foodOrderHub;
    private readonly IHubContext<SessionHub> _sessionHub;
    private readonly IHubContext<NotificationHub> _notificationHub;
    private readonly AppDbContext _db;

    public PcOverlayHub(
        ILogger<PcOverlayHub> logger,
        IHubContext<PcStatusHub> pcStatusHub,
        IHubContext<FoodOrderHub> foodOrderHub,
        IHubContext<SessionHub> sessionHub,
        IHubContext<NotificationHub> notificationHub,
        AppDbContext db)
    {
        _logger = logger;
        _pcStatusHub = pcStatusHub;
        _foodOrderHub = foodOrderHub;
        _sessionHub = sessionHub;
        _notificationHub = notificationHub;
        _db = db;
    }

    public async Task ConnectPc(string pcId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"pc:{pcId}");
        _logger.LogInformation("PC Overlay Connected: {PcId} (ConnectionId: {ConnectionId})", pcId, Context.ConnectionId);
    }

    public async Task Heartbeat(HeartbeatPayload payload)
    {
        // Broadcast to operators that this PC is active
        _logger.LogDebug("Heartbeat received from {PcId}", payload.PcId);
        await _pcStatusHub.Clients.All.SendAsync("PcStatusUpdated", new
        {
            PcId = payload.PcId,
            Status = "active",
            LastActive = payload.Timestamp
        });
    }

    public async Task IdleDetected(IdlePayload payload)
    {
        _logger.LogWarning("PC {PcId} went idle at {IdleSince}", payload.PcId, payload.IdleSince);
        await _pcStatusHub.Clients.All.SendAsync("PcStatusUpdated", new
        {
            PcId = payload.PcId,
            Status = "idle",
            LastActive = payload.IdleSince
        });
    }

    public async Task ActivityEvent(ActivityPayload payload)
    {
        _logger.LogInformation("Activity on {PcId}: {Event}", payload.PcId, payload.Event);
    }

    public async Task<object> PlaceFoodOrder(FoodOrderPayload payload)
    {
        _logger.LogInformation("Food order {OrderId} placed from {PcId}", payload.OrderId, payload.PcId);

        // Resolve PC → session → branch for persistence
        var pc = await _db.Pcs.FirstOrDefaultAsync(p =>
            p.Id.ToString() == payload.PcId || p.PcNumber == payload.PcId || p.PcName == payload.PcId);

        if (pc != null)
        {
            var session = string.IsNullOrEmpty(payload.SessionId)
                ? await _db.Sessions.Where(s => s.PcId == pc.Id && s.State == SessionState.Active)
                                    .OrderByDescending(s => s.StartTime).FirstOrDefaultAsync()
                : await _db.Sessions.FirstOrDefaultAsync(s => s.Id.ToString() == payload.SessionId);

            var orderNumber = $"ORD-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}-{new Random().Next(100, 999)}";

            var order = new FoodOrder
            {
                Id = Guid.NewGuid(),
                OrderNumber = payload.OrderId ?? orderNumber,
                SessionId = session?.Id,
                PcId = pc.Id,
                BranchId = pc.BranchId,
                CustomerName = session?.CustomerName,
                MemberId = session?.MemberId,
                TotalAmount = payload.TotalAmount,
                PaymentType = "session_bill",
                Status = OrderStatus.Pending,
                OrderTime = DateTimeOffset.UtcNow,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                // Items not persisted at row level from overlay (InventoryId FK required).
                // Full item list is broadcast to operators via SignalR below.
                Items = new List<FoodOrderItem>()
            };

            _db.FoodOrders.Add(order);

            // Update session food charges
            if (session != null)
            {
                session.FoodAmount += payload.TotalAmount;
                session.TotalAmount = session.GamingAmount + session.FoodAmount;
                session.UpdatedAt = DateTimeOffset.UtcNow;
            }

            await _db.SaveChangesAsync();

            // Notify operator's food dashboard
            await _foodOrderHub.Clients.All.SendAsync("NewFoodOrder", new
            {
                orderId = order.Id,
                orderNumber = order.OrderNumber,
                pcId = pc.Id,
                pcName = pc.PcName ?? pc.PcNumber,
                branchId = pc.BranchId,
                customerName = order.CustomerName,
                totalAmount = order.TotalAmount,
                status = order.Status.ToString(),
                items = payload.Items,
                orderTime = order.OrderTime
            });

            // Also push bill update back to the PC overlay
            await Clients.Group($"pc:{payload.PcId}").SendAsync("BillUpdated", new
            {
                foodCharges = session?.FoodAmount ?? payload.TotalAmount,
                totalBill = session?.TotalAmount ?? payload.TotalAmount,
                newOrderId = order.Id,
                newOrderNumber = order.OrderNumber
            });

            return new { success = true, orderId = order.Id.ToString(), orderNumber = order.OrderNumber };
        }

        // PC not found — still broadcast so operators see it
        await _foodOrderHub.Clients.All.SendAsync("NewFoodOrder", payload);
        return new { success = true, orderId = payload.OrderId };
    }

    public async Task<object> RequestExtension(ExtensionPayload payload)
    {
        _logger.LogInformation("Extension request from {PcId} for {Duration} mins", payload.PcId, payload.Duration);
        
        // Notify operators
        await _sessionHub.Clients.All.SendAsync("ExtensionRequested", payload);
        
        // Simulating approval for the sake of the overlay testing. 
        // In real life, we would await an operator response.
        return new { success = true, status = "pending_operator_approval" };
    }

    public async Task<object> CallOperator(CallPayload payload)
    {
        _logger.LogInformation("Operator called to {PcId}", payload.PcId);
        
        // Alert all operators
        await _notificationHub.Clients.All.SendAsync("Alert", new 
        { 
            Type = "OperatorCall",
            PcId = payload.PcId, 
            Timestamp = payload.Timestamp,
            Message = $"Assistance required at {payload.PcId}" 
        });
        
        return new { success = true };
    }

    public async Task<object> RequestWalkinSession(WalkinSessionPayload payload)
    {
        _logger.LogInformation("Walk-in session request from {PcId} by {CustomerName} for {Duration} mins", payload.PcId, payload.CustomerName, payload.Duration);
        
        // Alert all operators via SessionHub or NotificationHub
        await _notificationHub.Clients.All.SendAsync("Alert", new 
        { 
            Type = "WalkinSessionRequest",
            PcId = payload.PcId, 
            CustomerName = payload.CustomerName,
            Duration = payload.Duration,
            Timestamp = DateTimeOffset.UtcNow.ToString("o"),
            Message = payload.Duration == 0 ? $"Walk-in request: {payload.CustomerName} wants a Pay As You Go session at {payload.PcId}" : $"Walk-in request: {payload.CustomerName} wants {payload.Duration} mins at {payload.PcId}" 
        });
        
        return new { success = true, status = "pending_operator_approval" };
    }

    public async Task<object> DeclineWalkinRequest(string pcId, string reason)
    {
        _logger.LogInformation("Walk-in request for {PcId} was declined: {Reason}", pcId, reason);
        
        // Notify the specific PC that its request was declined
        await Clients.Group($"pc:{pcId}").SendAsync("WalkinRequestDeclined", new
        {
            reason = reason
        });

        return new { success = true };
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("PC Overlay Disconnected (ConnectionId: {ConnectionId})", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}

// DTOs

public class HeartbeatPayload
{
    [JsonPropertyName("pcId")] public string PcId { get; set; } = string.Empty;
    [JsonPropertyName("sessionId")] public string? SessionId { get; set; }
    [JsonPropertyName("timestamp")] public string Timestamp { get; set; } = string.Empty;
    [JsonPropertyName("status")] public string Status { get; set; } = string.Empty;
}

public class IdlePayload
{
    [JsonPropertyName("pcId")] public string PcId { get; set; } = string.Empty;
    [JsonPropertyName("sessionId")] public string? SessionId { get; set; }
    [JsonPropertyName("idleSince")] public string IdleSince { get; set; } = string.Empty;
}

public class ActivityPayload
{
    [JsonPropertyName("pcId")] public string PcId { get; set; } = string.Empty;
    [JsonPropertyName("sessionId")] public string? SessionId { get; set; }
    [JsonPropertyName("event")] public string Event { get; set; } = string.Empty;
    [JsonPropertyName("timestamp")] public string Timestamp { get; set; } = string.Empty;
}

public class FoodOrderPayload
{
    [JsonPropertyName("pcId")] public string PcId { get; set; } = string.Empty;
    [JsonPropertyName("sessionId")] public string? SessionId { get; set; }
    [JsonPropertyName("orderId")] public string OrderId { get; set; } = string.Empty;
    [JsonPropertyName("totalAmount")] public decimal TotalAmount { get; set; }
    [JsonPropertyName("items")] public List<FoodItemPayload> Items { get; set; } = new();
}

public class FoodItemPayload
{
    [JsonPropertyName("menuItemId")] public int MenuItemId { get; set; }
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("quantity")] public int Quantity { get; set; }
    [JsonPropertyName("price")] public decimal Price { get; set; }
}

public class ExtensionPayload
{
    [JsonPropertyName("pcId")] public string PcId { get; set; } = string.Empty;
    [JsonPropertyName("sessionId")] public string? SessionId { get; set; }
    [JsonPropertyName("duration")] public int Duration { get; set; }
}

public class CallPayload
{
    [JsonPropertyName("pcId")] public string PcId { get; set; } = string.Empty;
    [JsonPropertyName("sessionId")] public string? SessionId { get; set; }
    [JsonPropertyName("timestamp")] public string Timestamp { get; set; } = string.Empty;
}

public class WalkinSessionPayload
{
    [JsonPropertyName("pcId")] public string PcId { get; set; } = string.Empty;
    [JsonPropertyName("customerName")] public string CustomerName { get; set; } = string.Empty;
    [JsonPropertyName("duration")] public int Duration { get; set; }
}
