using System.Security.Claims;
using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.API.Controllers;

[Authorize]
public class PresenceController : BaseApiController
{
    private readonly IPresenceService _presenceService;

    public PresenceController(IPresenceService presenceService)
    {
        _presenceService = presenceService;
    }

    [HttpPost("heartbeat")]
    public async Task<IActionResult> Heartbeat([FromBody] PresenceHeartbeatRequest request)
    {
        var userId = CurrentUserId;
        if (userId == Guid.Empty) return Unauthorized();

        var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Người dùng";
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
        var userDepartment = User.FindFirst("department")?.Value;
        var avatarUrl = !string.IsNullOrEmpty(request.AvatarUrl) ? request.AvatarUrl : User.FindFirst("avatarUrl")?.Value;

        await _presenceService.UpdatePresenceAsync(userId, userName, avatarUrl, userRole, userDepartment, request);
        return Ok(ApiResponse<bool>.Ok(true));
    }

    [HttpPost("clear-task")]
    public async Task<IActionResult> ClearEditingTask()
    {
        var userId = CurrentUserId;
        if (userId == Guid.Empty) return Unauthorized();

        await _presenceService.ClearEditingTaskAsync(userId);
        return Ok(ApiResponse<bool>.Ok(true));
    }

    [HttpPost("leave")]
    public async Task<IActionResult> Leave()
    {
        var userId = CurrentUserId;
        if (userId == Guid.Empty) return Unauthorized();

        await _presenceService.ClearPresenceAsync(userId);
        return Ok(ApiResponse<bool>.Ok(true));
    }

    [HttpGet("project/{projectId}")]
    public IActionResult GetProjectPresence(Guid projectId)
    {
        var result = _presenceService.GetProjectPresence(projectId);
        return Ok(ApiResponse<ProjectPresenceDto>.Ok(result));
    }

    [HttpGet("online")]
    public IActionResult GetOnlineUsers()
    {
        var result = _presenceService.GetAllOnlineUsers();
        return Ok(ApiResponse<List<UserPresenceDto>>.Ok(result));
    }
}
