using Microsoft.EntityFrameworkCore;
using NeonArenaErp.Application.Constants;
using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.DTOs.Members;
using NeonArenaErp.Application.Exceptions;
using NeonArenaErp.Application.Interfaces;
using NeonArenaErp.Domain.Entities;
using NeonArenaErp.Domain.Enums;

namespace NeonArenaErp.Infrastructure.Services;

public class MemberService : IMemberService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditService _auditService;

    public MemberService(IUnitOfWork unitOfWork, IAuditService auditService)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
    }

    public async Task<PaginatedResult<MemberDto>> GetMembersAsync(Guid branchId, string? search, int page = 1, int pageSize = 50)
    {
        var query = _unitOfWork.Repository<Member>().Query();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(m => 
                m.MobileNumber.Contains(s) || 
                m.FullName.ToLower().Contains(s) || 
                m.MemberNumber.ToLower().Contains(s));
        }

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(m => m.JoinDate)
                               .Skip((page - 1) * pageSize)
                               .Take(pageSize)
                               .ToListAsync();

        var dtos = items.Select(MapToDto).ToList();
        return new PaginatedResult<MemberDto>(dtos, total, page, pageSize);
    }

    public async Task<MemberDto> GetMemberByIdAsync(Guid id)
    {
        var member = await _unitOfWork.Repository<Member>().GetByIdAsync(id)
            ?? throw new NotFoundException("Member not found.");

        return MapToDto(member);
    }

    public async Task<MemberDto> GetMemberByMobileAsync(string mobileNumber)
    {
        var member = await _unitOfWork.Repository<Member>().Query()
            .FirstOrDefaultAsync(m => m.MobileNumber == mobileNumber)
            ?? throw new NotFoundException($"Member with mobile {mobileNumber} not found.");

        return MapToDto(member);
    }

    public async Task<MemberDto> RegisterMemberAsync(Guid branchId, Guid operatorId, RegisterMemberDto dto)
    {
        var exists = await _unitOfWork.Repository<Member>().Query()
            .AnyAsync(m => m.MobileNumber == dto.MobileNumber);

        if (exists)
            throw new AppException("A member with this mobile number already exists.");

        // Generate member number: MEM-YYMM-XXXX
        var count = await _unitOfWork.Repository<Member>().Query().CountAsync() + 1;
        var memberNum = $"MEM-{DateTime.UtcNow:yyMM}-{count:D4}";

        var member = new Member
        {
            MemberNumber = memberNum,
            FullName = dto.FullName,
            MobileNumber = dto.MobileNumber,
            Email = dto.Email,
            Status = MemberStatus.Active,
            HomeBranchId = branchId,
            JoinDate = DateTimeOffset.UtcNow,
            CreatedBy = operatorId,
            WalletBalance = 0,
            GamingPoints = 0,
            FoodPoints = 0,
            TotalPoints = 0
        };

        await _unitOfWork.Repository<Member>().AddAsync(member);

        await _auditService.LogAsync(new AuditEntry
        {
            OperatorId = operatorId,
            UserRole = "Operator",
            UserName = "System",
            Action = AuditActions.MemberCreate,
            BranchId = branchId,
            TargetType = "member",
            TargetId = member.Id,
            Details = new { MemberNumber = member.MemberNumber, FullName = dto.FullName }
        });

        await _unitOfWork.CommitTransactionAsync();

        return MapToDto(member);
    }

    public async Task<MemberDto> UpdateMemberAsync(Guid branchId, Guid operatorId, Guid id, UpdateMemberDto dto)
    {
        var member = await _unitOfWork.Repository<Member>().GetByIdAsync(id)
            ?? throw new NotFoundException("Member not found.");

        // Check if new mobile belongs to someone else
        var duplicate = await _unitOfWork.Repository<Member>().Query()
            .AnyAsync(m => m.MobileNumber == dto.MobileNumber && m.Id != id);

        if (duplicate)
            throw new AppException("The specified mobile number is already in use by another member.");

        member.FullName = dto.FullName;
        member.MobileNumber = dto.MobileNumber;
        member.Email = dto.Email;

        _unitOfWork.Repository<Member>().Update(member);

        await _auditService.LogAsync(new AuditEntry
        {
            OperatorId = operatorId,
            UserRole = "Operator",
            UserName = "System",
            Action = "member_update",
            BranchId = branchId,
            TargetType = "member",
            TargetId = member.Id,
            Details = new { MemberNumber = member.MemberNumber }
        });

        await _unitOfWork.CommitTransactionAsync();

        return MapToDto(member);
    }

    private static MemberDto MapToDto(Member m)
    {
        return new MemberDto
        {
            Id = m.Id,
            MemberNumber = m.MemberNumber,
            FullName = m.FullName,
            MobileNumber = m.MobileNumber,
            Email = m.Email,
            Status = m.Status,
            WalletBalance = m.WalletBalance,
            GamingPoints = m.GamingPoints,
            FoodPoints = m.FoodPoints,
            TotalPoints = m.TotalPoints,
            JoinDate = m.JoinDate,
            LastVisit = m.LastVisit
        };
    }
}
