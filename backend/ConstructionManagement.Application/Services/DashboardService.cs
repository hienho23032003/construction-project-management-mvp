using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IAppDbContext _context;

    public DashboardService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<DashboardSummaryDto>> GetDashboardSummaryAsync(DateTime? fromDate = null, DateTime? toDate = null)
    {
        var now = DateTime.UtcNow.Date;
        var sevenDaysFromNow = now.AddDays(7);

        // 1. Projects Query Filter
        var projectsQuery = _context.Projects.AsNoTracking().AsQueryable();
        if (fromDate.HasValue)
        {
            var fDate = fromDate.Value.Date;
            projectsQuery = projectsQuery.Where(p => p.PlannedEndDate >= fDate);
        }
        if (toDate.HasValue)
        {
            var tDate = toDate.Value.Date;
            projectsQuery = projectsQuery.Where(p => p.StartDate <= tDate);
        }

        // Project Counts - Executed in SQL
        var totalProjects = await projectsQuery.CountAsync();
        var inProgressProjects = await projectsQuery.CountAsync(p => p.Status == ProjectStatus.InProgress);
        var completedProjects = await projectsQuery.CountAsync(p => p.Status == ProjectStatus.Completed);
        var overdueProjects = await projectsQuery.CountAsync(p => p.Status != ProjectStatus.Completed && p.PlannedEndDate < now);

        // Top 6 Recent Projects with Progress - Server-side Projection
        var projectProgressList = await projectsQuery
            .OrderByDescending(p => p.CreatedAt)
            .Take(6)
            .Select(p => new ProjectProgressSummaryDto
            {
                ProjectId = p.Id,
                ProjectCode = p.Code,
                ProjectName = p.Name,
                Progress = p.Progress,
                Status = p.Status,
                PlannedEndDate = p.PlannedEndDate,
                TotalTasks = p.Tasks.Count,
                CompletedTasks = p.Tasks.Count(t => t.Status == TaskItemStatus.Completed)
            })
            .ToListAsync();

        // 2. Tasks Query Filter
        var tasksQuery = _context.Tasks.AsNoTracking().AsQueryable();
        if (fromDate.HasValue)
        {
            var fDate = fromDate.Value.Date;
            tasksQuery = tasksQuery.Where(t => t.PlannedEndDate >= fDate);
        }
        if (toDate.HasValue)
        {
            var tDate = toDate.Value.Date;
            tasksQuery = tasksQuery.Where(t => t.StartDate <= tDate);
        }

        // Task Counts - Executed in SQL
        var totalTasks = await tasksQuery.CountAsync();
        var completedTasks = await tasksQuery.CountAsync(t => t.Status == TaskItemStatus.Completed);
        var inProgressTasks = await tasksQuery.CountAsync(t => t.Status == TaskItemStatus.InProgress);
        var notStartedTasks = await tasksQuery.CountAsync(t => t.Status == TaskItemStatus.NotStarted);
        var onHoldTasks = await tasksQuery.CountAsync(t => t.Status == TaskItemStatus.OnHold);
        var overdueTasksCount = await tasksQuery.CountAsync(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate < now);

        // Task Distribution Chart Data
        var taskDistribution = new List<TaskStatusDistributionDto>
        {
            new() { Status = "Đã hoàn thành", Count = completedTasks, Color = "#10b981" },
            new() { Status = "Đang thực hiện", Count = inProgressTasks, Color = "#0284c7" },
            new() { Status = "Chưa bắt đầu", Count = notStartedTasks, Color = "#64748b" },
            new() { Status = "Tạm dừng", Count = onHoldTasks, Color = "#f59e0b" },
            new() { Status = "Quá hạn", Count = overdueTasksCount, Color = "#ef4444" }
        };

        // 3. Overdue Tasks - Take 20 directly from SQL
        var overdueTasks = await tasksQuery
            .Where(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate < now)
            .OrderBy(t => t.PlannedEndDate)
            .Take(20)
            .Select(t => new OverdueTaskDto
            {
                TaskId = t.Id,
                TaskName = t.Name,
                ProjectId = t.ProjectId,
                ProjectCode = t.Project.Code,
                ProjectName = t.Project.Name,
                PlannedEndDate = t.PlannedEndDate,
                OverdueDays = (int)(now - t.PlannedEndDate).TotalDays,
                Progress = t.Progress,
                AssigneeNames = t.Assignees.Select(a => a.User.FullName).ToList()
            })
            .ToListAsync();

        // 4. Upcoming Deadlines - Take 20 directly from SQL
        var upcomingDeadlines = await tasksQuery
            .Where(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate >= now && t.PlannedEndDate <= sevenDaysFromNow)
            .OrderBy(t => t.PlannedEndDate)
            .Take(20)
            .Select(t => new UpcomingDeadlineDto
            {
                TaskId = t.Id,
                TaskName = t.Name,
                ProjectCode = t.Project.Code,
                PlannedEndDate = t.PlannedEndDate,
                DaysRemaining = (int)(t.PlannedEndDate - now).TotalDays,
                Progress = t.Progress,
                AssigneeNames = t.Assignees.Select(a => a.User.FullName).ToList()
            })
            .ToListAsync();

        // 5. Employee Workload - Top 6 directly computed via SQL
        var employeeWorkload = await _context.Users
            .Where(u => u.IsActive)
            .Select(u => new EmployeeWorkloadSummaryDto
            {
                UserId = u.Id,
                FullName = u.FullName,
                Department = u.Department,
                ActiveTasks = u.TaskAssignments.Count(ta => ta.Task.Status == TaskItemStatus.InProgress || ta.Task.Status == TaskItemStatus.NotStarted || ta.Task.Status == TaskItemStatus.OnHold),
                CompletedTasks = u.TaskAssignments.Count(ta => ta.Task.Status == TaskItemStatus.Completed),
                OverdueTasks = u.TaskAssignments.Count(ta => ta.Task.Status != TaskItemStatus.Completed && ta.Task.PlannedEndDate < now)
            })
            .OrderByDescending(x => x.ActiveTasks)
            .Take(6)
            .ToListAsync();

        // 6. Recent Activities - Take 10 directly from SQL
        var activitiesQuery = _context.ActivityLogs.AsNoTracking().AsQueryable();
        if (fromDate.HasValue)
        {
            var fDate = fromDate.Value.Date;
            activitiesQuery = activitiesQuery.Where(al => al.CreatedAt >= fDate);
        }
        if (toDate.HasValue)
        {
            var tDateEnd = toDate.Value.Date.AddDays(1);
            activitiesQuery = activitiesQuery.Where(al => al.CreatedAt < tDateEnd);
        }

        var recentActivities = await activitiesQuery
            .OrderByDescending(al => al.CreatedAt)
            .Take(10)
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

        var summary = new DashboardSummaryDto
        {
            TotalProjects = totalProjects,
            InProgressProjects = inProgressProjects,
            CompletedProjects = completedProjects,
            OverdueProjects = overdueProjects,

            TotalTasks = totalTasks,
            CompletedTasks = completedTasks,
            InProgressTasks = inProgressTasks,
            OverdueTasks = overdueTasksCount,

            ProjectProgressList = projectProgressList,
            TaskStatusDistribution = taskDistribution,
            CriticalOverdueTasks = overdueTasks,
            UpcomingDeadlines = upcomingDeadlines,
            EmployeeWorkloadList = employeeWorkload,
            RecentActivities = recentActivities
        };

        return ApiResponse<DashboardSummaryDto>.Ok(summary);
    }
}
