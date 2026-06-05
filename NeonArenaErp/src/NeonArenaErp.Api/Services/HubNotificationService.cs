using Microsoft.AspNetCore.SignalR;
using NeonArenaErp.Api.Hubs;
using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.Interfaces;

namespace NeonArenaErp.Api.Services;

public class HubNotificationService : IHubNotificationService
{
    private readonly IHubContext<PcStatusHub> _pcStatusHub;
    private readonly IHubContext<SessionHub> _sessionHub;
    private readonly IHubContext<ReservationHub> _reservationHub;
    private readonly IHubContext<BillingHub> _billingHub;
    private readonly IHubContext<FoodOrderHub> _foodOrderHub;
    private readonly IHubContext<CashHub> _cashHub;

    public HubNotificationService(
        IHubContext<PcStatusHub> pcStatusHub,
        IHubContext<SessionHub> sessionHub,
        IHubContext<ReservationHub> reservationHub,
        IHubContext<BillingHub> billingHub,
        IHubContext<FoodOrderHub> foodOrderHub,
        IHubContext<CashHub> cashHub)
    {
        _pcStatusHub = pcStatusHub;
        _sessionHub = sessionHub;
        _reservationHub = reservationHub;
        _billingHub = billingHub;
        _foodOrderHub = foodOrderHub;
        _cashHub = cashHub;
    }

    public async Task BroadcastPcStatusChangeAsync(Guid branchId, Guid pcId)
    {
        var payload = new { pcId, branchId };
        await _pcStatusHub.Clients.Group($"branch:{branchId}")
            .SendAsync("PcStatusChanged", new EventEnvelope<object>(payload));
    }

    public async Task BroadcastSessionUpdateAsync(Guid branchId, Guid sessionId)
    {
        var payload = new { sessionId, branchId };
        await _sessionHub.Clients.Group($"branch:{branchId}")
            .SendAsync("SessionUpdated", new EventEnvelope<object>(payload));
    }

    public async Task BroadcastReservationUpdateAsync(Guid branchId, Guid reservationId)
    {
        var payload = new { reservationId, branchId };
        await _reservationHub.Clients.Group($"branch:{branchId}")
            .SendAsync("ReservationUpdated", new EventEnvelope<object>(payload));
    }

    public async Task BroadcastBillingUpdateAsync(Guid branchId, Guid billId)
    {
        var payload = new { billId, branchId };
        await _billingHub.Clients.Group($"branch:{branchId}")
            .SendAsync("BillUpdated", new EventEnvelope<object>(payload));
    }

    public async Task BroadcastFoodOrderUpdateAsync(Guid branchId, Guid orderId)
    {
        var payload = new { orderId, branchId };
        await _foodOrderHub.Clients.Group($"branch:{branchId}")
            .SendAsync("FoodOrderUpdated", new EventEnvelope<object>(payload));
    }

    public async Task BroadcastCashRegisterUpdateAsync(Guid branchId, Guid registerId)
    {
        var payload = new { registerId, branchId };
        await _cashHub.Clients.Group($"branch:{branchId}")
            .SendAsync("CashRegisterUpdated", new EventEnvelope<object>(payload));
    }

    public async Task BroadcastPcManagementUpdateAsync(Guid branchId, Guid pcId, string action)
    {
        var payload = new { pcId, branchId, action };
        await _pcStatusHub.Clients.Group($"branch:{branchId}")
            .SendAsync("PcManagementUpdated", new EventEnvelope<object>(payload));
    }
}
