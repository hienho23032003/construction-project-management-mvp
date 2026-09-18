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

    public async Task<ApiResponse<PagedResult<ActivityLogDto>>> GetActivityLogsPagedAsync(
        PaginationParams pagination,
        Guid? projectId = null,
        Guid? taskId = null,
        Guid? userId = null,
        string? action = null)
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

        if (userId.HasValue)
        {
            query = query.Where(al => al.UserId == userId.Value);
        }

        if (!string.IsNullOrWhiteSpace(action) && action != "ALL")
        {
            var actionLower = action.Trim().ToLower();
            if (actionLower == "status")
            {
                query = query.Where(al => al.Action == ActivityAction.StatusChanged);
            }
            else if (actionLower == "progress")
            {
                query = query.Where(al => al.Action == ActivityAction.ProgressChanged);
            }
            else if (actionLower == "assign")
            {
                query = query.Where(al => al.Action == ActivityAction.TaskAssigned);
            }
            else if (actionLower == "date")
            {
                query = query.Where(al => al.Action == ActivityAction.DeadlineChanged);
            }
            else if (actionLower == "create")
            {
                query = query.Where(al => al.Action == ActivityAction.TaskCreated || al.Action == ActivityAction.ProjectCreated);
            }
            else if (actionLower == "delete")
            {
                query = query.Where(al => al.Action == ActivityAction.TaskDeleted || al.Action == ActivityAction.ProjectDeleted);
            }
            else if (Enum.TryParse<ActivityAction>(action, true, out var parsedAction))
            {
                query = query.Where(al => al.Action == parsedAction);
            }
        }

        if (!string.IsNullOrWhiteSpace(pagination.Search))
        {
            var search = pagination.Search.Trim().ToLower();
            query = query.Where(al =>
                (al.User != null && al.User.FullName.ToLower().Contains(search)) ||
                (al.Task != null && al.Task.Name.ToLower().Contains(search)) ||
                (al.Details != null && al.Details.ToLower().Contains(search)) ||
                (al.OldValue != null && al.OldValue.ToLower().Contains(search)) ||
                (al.NewValue != null && al.NewValue.ToLower().Contains(search)) ||
                (al.Project != null && (al.Project.Name.ToLower().Contains(search) || al.Project.Code.ToLower().Contains(search)))
            );
        }

        var totalCount = await query.CountAsync();

        var pageIndex = pagination.PageIndex > 0 ? pagination.PageIndex : 1;
        var pageSize = pagination.PageSize > 0 ? pagination.PageSize : 10;

        var items = await query
            .OrderByDescending(al => al.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
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

        var result = new PagedResult<ActivityLogDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageIndex = pageIndex,
            PageSize = pageSize
        };

        return ApiResponse<PagedResult<ActivityLogDto>>.Ok(result);
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
        // Debounce / coalesce rapid logs for the same user, task, and action within 15 seconds
        if (taskId.HasValue && (action == ActivityAction.TaskAssigned || action == ActivityAction.TaskUpdated || action == ActivityAction.ProgressChanged))
        {
            var cutoff = DateTime.UtcNow.AddSeconds(-15);
            var recentLog = await _context.ActivityLogs
                .Where(al => al.UserId == userId && al.TaskId == taskId && al.Action == action && al.CreatedAt >= cutoff)
                .OrderByDescending(al => al.CreatedAt)
                .FirstOrDefaultAsync();

            if (recentLog != null)
            {
                // Update existing recent log to prevent spamming multiple entries for rapid edits
                recentLog.NewValue = newValue;
                recentLog.Details = details;
                recentLog.CreatedAt = DateTime.UtcNow;

                if (!string.IsNullOrEmpty(recentLog.OldValue) && recentLog.OldValue == recentLog.NewValue)
                {
                    _context.ActivityLogs.Remove(recentLog);
                }

                await _context.SaveChangesAsync();
                return;
            }
        }

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
