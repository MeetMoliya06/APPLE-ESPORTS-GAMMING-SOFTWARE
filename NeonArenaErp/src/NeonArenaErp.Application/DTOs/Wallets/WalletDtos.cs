using System.ComponentModel.DataAnnotations;
using NeonArenaErp.Domain.Enums;

namespace NeonArenaErp.Application.DTOs.Wallets;

public class WalletTransactionDto
{
    public Guid Id { get; set; }
    public Guid MemberId { get; set; }
    public WalletAction Action { get; set; }
    public decimal Amount { get; set; }
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }
    public string? PaymentType { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class TopUpWalletDto
{
    [Required]
    public decimal Amount { get; set; }
    
    [Required]
    public string PaymentType { get; set; } = null!; // "Cash", "Online"
    
    public string? Reason { get; set; }
}

public class DeductWalletDto
{
    [Required]
    public decimal Amount { get; set; }
    
    [Required]
    public string Reason { get; set; } = null!;
    
    public Guid? BillId { get; set; }
}
