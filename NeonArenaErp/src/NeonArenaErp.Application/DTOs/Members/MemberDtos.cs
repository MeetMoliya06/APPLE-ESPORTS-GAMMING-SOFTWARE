using System.ComponentModel.DataAnnotations;
using NeonArenaErp.Domain.Enums;

namespace NeonArenaErp.Application.DTOs.Members;

public class MemberDto
{
    public Guid Id { get; set; }
    public string MemberNumber { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string MobileNumber { get; set; } = null!;
    public string? Email { get; set; }
    public MemberStatus Status { get; set; }
    
    public decimal WalletBalance { get; set; }
    public int GamingPoints { get; set; }
    public int FoodPoints { get; set; }
    public int TotalPoints { get; set; }
    
    public DateTimeOffset JoinDate { get; set; }
    public DateTimeOffset? LastVisit { get; set; }
}

public class RegisterMemberDto
{
    [Required]
    public string FullName { get; set; } = null!;
    
    [Required]
    [RegularExpression(@"^\d{10}$", ErrorMessage = "Invalid mobile number format.")]
    public string MobileNumber { get; set; } = null!;
    
    [EmailAddress]
    public string? Email { get; set; }
}

public class UpdateMemberDto
{
    [Required]
    public string FullName { get; set; } = null!;
    
    [Required]
    [RegularExpression(@"^\d{10}$", ErrorMessage = "Invalid mobile number format.")]
    public string MobileNumber { get; set; } = null!;
    
    [EmailAddress]
    public string? Email { get; set; }
}
