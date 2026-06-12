using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeonArenaErp.Api.Filters;
using NeonArenaErp.Application.DTOs.Common;
using NeonArenaErp.Application.DTOs.Members;
using NeonArenaErp.Application.Interfaces;
using System.Security.Claims;

namespace NeonArenaErp.Api.Controllers;

[ApiController]
[Route("api/members")]
[Authorize]
[BranchIsolation]
public class MembersController : ControllerBase
{
    private readonly IMemberService _memberService;

    public MembersController(IMemberService memberService)
    {
        _memberService = memberService;
    }

    private Guid GetBranchId() => Guid.Parse(HttpContext.Items["BranchId"]!.ToString()!);
    private Guid GetOperatorId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetMembers([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var result = await _memberService.GetMembersAsync(GetBranchId(), search, page, pageSize);
        return Ok(ApiResponse<PaginatedResult<MemberDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetMemberById(Guid id)
    {
        var result = await _memberService.GetMemberByIdAsync(id);
        return Ok(ApiResponse<MemberDto>.Ok(result));
    }

    [HttpGet("phone/{mobileNumber}")]
    public async Task<IActionResult> GetMemberByMobile(string mobileNumber)
    {
        var result = await _memberService.GetMemberByMobileAsync(mobileNumber);
        return Ok(ApiResponse<MemberDto>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> RegisterMember([FromBody] RegisterMemberDto dto)
    {
        var result = await _memberService.RegisterMemberAsync(GetBranchId(), GetOperatorId(), dto);
        return Ok(ApiResponse<MemberDto>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateMember(Guid id, [FromBody] UpdateMemberDto dto)
    {
        Console.WriteLine($"[DEBUG UpdateMember] id: {id}, FullName: {dto.FullName}, DisableLogin: {dto.DisableLogin}, Username: {dto.Username}");
        var result = await _memberService.UpdateMemberAsync(GetBranchId(), GetOperatorId(), id, dto);
        return Ok(ApiResponse<MemberDto>.Ok(result));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteMember(Guid id)
    {
        await _memberService.DeleteMemberAsync(GetBranchId(), GetOperatorId(), id);
        return Ok(ApiResponse<object>.Ok(null));
    }

    /// <summary>Member self-login — POST /api/members/login (no auth required)</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> MemberLogin([FromBody] MemberLoginDto dto)
    {
        var result = await _memberService.LoginMemberAsync(dto);
        return Ok(ApiResponse<MemberLoginResponseDto>.Ok(result));
    }
}
