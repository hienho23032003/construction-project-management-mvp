using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.API.Controllers;

[Authorize]
[Route("api/user-sessions")]
public class UserSessionsController : BaseApiController
{
    private readonly IUserSessionService _sessionService;

    public UserSessionsController(IUserSessionService sessionService)
    {
        _sessionService = sessionService;
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetLoginHistory(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] Guid? userId,
        [FromQuery] string? search,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 15)
    {
        var pagination = new PaginationParams { PageIndex = pageIndex, PageSize = pageSize };
        var result = await _sessionService.GetLoginHistoryAsync(fromDate, toDate, userId, search, pagination);
        return Ok(result);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var result = await _sessionService.GetSessionStatsAsync();
        return Ok(result);
    }

    [HttpPost("ping")]
    public async Task<IActionResult> Ping([FromBody] PingSessionRequest request)
    {
        if (!request.SessionId.HasValue || request.SessionId.Value == Guid.Empty)
        {
            return BadRequest(ApiResponse<bool>.Fail("SessionId is required."));
        }

        var success = await _sessionService.PingSessionAsync(request.SessionId.Value, CurrentUserId);
        return Ok(ApiResponse<bool>.Ok(success));
    }

    [AllowAnonymous]
    [HttpPost("leave")]
    public async Task<IActionResult> Leave([FromBody] LeaveSessionRequest request)
    {
        if (request?.SessionId.HasValue == true && request.SessionId.Value != Guid.Empty)
        {
            await _sessionService.LeaveSessionAsync(request.SessionId.Value);
        }
        return Ok(ApiResponse<bool>.Ok(true));
    }
}
