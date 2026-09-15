using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Application.Services;

public class NotificationService : INotificationService
{
    private readonly IAppDbContext _context;

    public NotificationService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResult<NotificationDto>>> GetUserNotificationsAsync(Guid userId, PaginationParams pagination)
    {
        var query = _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .AsNoTracking();

        var totalCount = await query.CountAsync();
        var pageSize = pagination.PageSize > 0 ? pagination.PageSize : 15;
        var pageIndex = pagination.PageIndex > 0 ? pagination.PageIndex : 1;

        var list = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                ReferenceType = n.ReferenceType,
                ReferenceId = n.ReferenceId,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();

        var paged = new PagedResult<NotificationDto>
        {
            Items = list,
            TotalCount = totalCount,
            PageIndex = pageIndex,
            PageSize = pageSize
        };

        return ApiResponse<PagedResult<NotificationDto>>.Ok(paged);
    }

    public async Task<ApiResponse<bool>> MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        var n = await _context.Notifications.FirstOrDefaultAsync(x => x.Id == notificationId && x.UserId == userId);
        if (n == null) return ApiResponse<bool>.Fail("Không tìm thấy thông báo.");

        n.IsRead = true;
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true);
    }

    public async Task<ApiResponse<bool>> MarkAllAsReadAsync(Guid userId)
    {
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var item in unread)
        {
            item.IsRead = true;
        }

        await _context.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true);
    }

    public async Task CreateNotificationAsync(
        Guid userId,
        string title,
        string message,
        NotificationType type,
        string? refType = null,
        Guid? refId = null)
    {
        var n = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            ReferenceType = refType,
            ReferenceId = refId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(n);
        await _context.SaveChangesAsync();
    }
}

public class ActivityLogService : IActivityLogService
{
    private readonly IAppDbContext _context;

    public ActivityLogService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<ActivityLogDto>>> GetRecentLogsAsync(Guid? projectId = null, Guid? taskId = null, int limit = 50)
    {
        var query = _context.ActivityLogs
            .Include(al => al.User)
            .Include(al => al.Project)
            .Include(al => al.Task)
            .AsNoTracking();

        if (projectId.HasValue)
        {
            query = query.Where(al => al.ProjectId == projectId.Value);
        }

        if (taskId.HasValue)
        {
            query = query.Where(al => al.TaskId == taskId.Value);
        }

        var list = await query
            .OrderByDescending(al => al.CreatedAt)
            .Take(limit)
            .Select(al => new ActivityLogDto
            {
                Id = al.Id,
                UserId = al.UserId,
                UserName = al.User.FullName,
                UserAvatarUrl = al.User.AvatarUrl,
                ProjectId = al.ProjectId,
                ProjectCode = al.Project != null ? al.Project.Code : null,
                ProjectName = al.Project != null ? al.Project.Name : null,
                TaskId = al.TaskId,
                TaskName = al.Task != null ? al.Task.Name : null,
                Action = al.Action,
                Details = al.Details,
                OldValue = al.OldValue,
                NewValue = al.NewValue,
                CreatedAt = al.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<List<ActivityLogDto>>.Ok(list);
    }

    public async Task LogAsync(
        Guid userId,
        ActivityAction action,
        string details,
        Guid? projectId = null,
        Guid? taskId = null,
        string? oldValue = null,
        string? newValue = null)
    {
        var log = new ActivityLog
        {
            UserId = userId,
            ProjectId = projectId,
            TaskId = taskId,
            Action = action,
            Details = details,
            OldValue = oldValue,
            NewValue = newValue,
            CreatedAt = DateTime.UtcNow
        };

        _context.ActivityLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
