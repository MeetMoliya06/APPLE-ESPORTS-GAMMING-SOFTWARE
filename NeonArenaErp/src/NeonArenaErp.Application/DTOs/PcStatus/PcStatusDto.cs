using NeonArenaErp.Domain.Enums;

namespace NeonArenaErp.Application.DTOs.PcStatus;

public class PcStatusDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string IpAddress { get; set; } = null!;
    public PcState State { get; set; }
    public Guid BranchId { get; set; }
    
    // Active session details (if busy or awaiting billing)
    public Guid? ActiveSessionId { get; set; }
    public DateTimeOffset? SessionEndTime { get; set; }
    public string? CustomerName { get; set; }
    
    // Upcoming reservation details (if reserved)
    public Guid? NextReservationId { get; set; }
    public DateTimeOffset? NextReservationTime { get; set; }
}
