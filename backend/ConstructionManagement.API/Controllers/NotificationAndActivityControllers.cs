using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.API.Controllers;

[Authorize]
public class NotificationsController : BaseApiController
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications([FromQuery] PaginationParams pagination)
    {
        var result = await _notificationService.GetUserNotificationsAsync(CurrentUserId, pagination);
        return Ok(result);
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var result = await _notificationService.MarkAsReadAsync(id, CurrentUserId);
        return Ok(result);
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var result = await _notificationService.MarkAllAsReadAsync(CurrentUserId);
        return Ok(result);
    }
}

[Authorize]
[Route("api/activity-logs")]
public class ActivityLogsController : BaseApiController
{
    private readonly IActivityLogService _activityLogService;

    public ActivityLogsController(IActivityLogService activityLogService)
    {
        _activityLogService = activityLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs(
        [FromQuery] PaginationParams pagination,
        [FromQuery] Guid? projectId,
        [FromQuery] Guid? taskId,
        [FromQuery] Guid? userId,
        [FromQuery] string? action = null)
    {
        var result = await _activityLogService.GetActivityLogsPagedAsync(pagination, projectId, taskId, userId, action);
        return Ok(result);
    }
}
