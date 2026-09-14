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

        var projectsQuery = _context.Projects
            .Include(p => p.Tasks)
            .AsNoTracking()
            .AsQueryable();

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

        var projects = await projectsQuery.ToListAsync();

        var tasksQuery = _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.Assignees).ThenInclude(a => a.User)
            .AsNoTracking()
            .AsQueryable();

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

        var tasks = await tasksQuery.ToListAsync();

        var users = await _context.Users
            .Where(u => u.IsActive)
            .Include(u => u.TaskAssignments).ThenInclude(ta => ta.Task)
            .AsNoTracking()
            .ToListAsync();

        var activitiesQuery = _context.ActivityLogs
            .Include(al => al.User)
            .Include(al => al.Project)
            .Include(al => al.Task)
            .AsNoTracking()
            .AsQueryable();

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

        // Project progress list
        var projectProgressList = projects
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
            }).ToList();

        // Task distribution
        var totalTaskCount = tasks.Count;
        var taskDistribution = new List<TaskStatusDistributionDto>
        {
            new() { Status = "Đã hoàn thành", Count = tasks.Count(t => t.Status == TaskItemStatus.Completed), Color = "#10b981" },
            new() { Status = "Đang thực hiện", Count = tasks.Count(t => t.Status == TaskItemStatus.InProgress), Color = "#0284c7" },
            new() { Status = "Chưa bắt đầu", Count = tasks.Count(t => t.Status == TaskItemStatus.NotStarted), Color = "#64748b" },
            new() { Status = "Tạm dừng", Count = tasks.Count(t => t.Status == TaskItemStatus.OnHold), Color = "#f59e0b" },
            new() { Status = "Quá hạn", Count = tasks.Count(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now), Color = "#ef4444" }
        };

        // Overdue tasks
        var overdueTasks = tasks
            .Where(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now)
            .OrderBy(t => t.PlannedEndDate)
            .Take(5)
            .Select(t => new OverdueTaskDto
            {
                TaskId = t.Id,
                TaskName = t.Name,
                ProjectId = t.ProjectId,
                ProjectCode = t.Project.Code,
                ProjectName = t.Project.Name,
                PlannedEndDate = t.PlannedEndDate,
                OverdueDays = (int)(now - t.PlannedEndDate.Date).TotalDays,
                Progress = t.Progress,
                AssigneeNames = t.Assignees.Select(a => a.User.FullName).ToList()
            }).ToList();

        // Upcoming deadlines
        var upcomingDeadlines = tasks
            .Where(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date >= now && t.PlannedEndDate.Date <= now.AddDays(7))
            .OrderBy(t => t.PlannedEndDate)
            .Take(5)
            .Select(t => new UpcomingDeadlineDto
            {
                TaskId = t.Id,
                TaskName = t.Name,
                ProjectCode = t.Project.Code,
                PlannedEndDate = t.PlannedEndDate,
                DaysRemaining = (int)(t.PlannedEndDate.Date - now).TotalDays,
                Progress = t.Progress,
                AssigneeNames = t.Assignees.Select(a => a.User.FullName).ToList()
            }).ToList();

        // Employee workload
        var employeeWorkload = users
            .Select(u =>
            {
                var userTasks = tasks.Where(t => t.Assignees.Any(a => a.UserId == u.Id)).ToList();
                return new EmployeeWorkloadSummaryDto
                {
                    UserId = u.Id,
                    FullName = u.FullName,
                    Department = u.Department,
                    ActiveTasks = userTasks.Count(t => t.Status == TaskItemStatus.InProgress || t.Status == TaskItemStatus.NotStarted || t.Status == TaskItemStatus.OnHold),
                    CompletedTasks = userTasks.Count(t => t.Status == TaskItemStatus.Completed),
                    OverdueTasks = userTasks.Count(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now)
                };
            })
            .OrderByDescending(x => x.ActiveTasks)
            .Take(6)
            .ToList();

        var summary = new DashboardSummaryDto
        {
            TotalProjects = projects.Count,
            InProgressProjects = projects.Count(p => p.Status == ProjectStatus.InProgress),
            CompletedProjects = projects.Count(p => p.Status == ProjectStatus.Completed),
            OverdueProjects = projects.Count(p => p.Status != ProjectStatus.Completed && p.PlannedEndDate.Date < now),

            TotalTasks = tasks.Count,
            CompletedTasks = tasks.Count(t => t.Status == TaskItemStatus.Completed),
            InProgressTasks = tasks.Count(t => t.Status == TaskItemStatus.InProgress),
            OverdueTasks = tasks.Count(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now),

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
