using System.Text;
using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Application.Services;

public class ReportService : IReportService
{
    private readonly IAppDbContext _context;

    public ReportService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<ProjectProgressReportDto>>> GetProjectProgressReportAsync(ReportFilterRequest filter, Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false)
    {
        var now = DateTime.UtcNow.Date;
        var query = _context.Projects
            .Include(p => p.Manager)
            .Include(p => p.Tasks)
            .Include(p => p.Members).ThenInclude(m => m.User)
            .AsNoTracking();

        if (!canViewAll && currentUserId.HasValue)
        {
            if (canViewProject)
            {
                query = query.Where(p =>
                    p.Members.Any(m => m.UserId == currentUserId.Value) ||
                    p.ManagerId == currentUserId.Value ||
                    p.CreatedById == currentUserId.Value ||
                    p.Tasks.Any(t => t.Assignees.Any(a => a.UserId == currentUserId.Value)));
            }
            else
            {
                query = query.Where(p =>
                    p.ManagerId == currentUserId.Value ||
                    p.CreatedById == currentUserId.Value ||
                    p.Members.Any(m => m.UserId == currentUserId.Value && (m.RoleInProject == "Quản lý công trình (PM)" || m.RoleInProject == "Quản lý dự án" || m.RoleInProject == "Chỉ huy trưởng")) ||
                    p.Tasks.Any(t => t.Assignees.Any(a => a.UserId == currentUserId.Value) || t.CreatedById == currentUserId.Value));
            }
        }

        if (filter.ProjectId.HasValue)
        {
            query = query.Where(p => p.Id == filter.ProjectId.Value);
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(p => (int)p.Status == (int)filter.Status.Value);
        }

        if (filter.FromDate.HasValue)
        {
            query = query.Where(p => p.StartDate >= filter.FromDate.Value);
        }

        if (filter.ToDate.HasValue)
        {
            query = query.Where(p => p.PlannedEndDate <= filter.ToDate.Value);
        }

        var projects = await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var list = projects.Select(p =>
        {
            var managersList = GetProjectManagers(p);
            var managerNames = managersList.Select(m => m.FullName).ToList();
            var managerName = string.Join(", ", managerNames);
            if (string.IsNullOrWhiteSpace(managerName)) managerName = "-";

            return new ProjectProgressReportDto
            {
                ProjectId = p.Id,
                Code = p.Code,
                Name = p.Name,
                ManagerName = managerName,
                ManagerNames = managerNames,
                Managers = managersList,
                StartDate = p.StartDate,
                PlannedEndDate = p.PlannedEndDate,
                ActualEndDate = p.ActualEndDate,
                Progress = p.Progress,
                Status = p.Status,
                TotalTasks = p.Tasks.Count,
                CompletedTasks = p.Tasks.Count(t => t.Status == TaskItemStatus.Completed),
                InProgressTasks = p.Tasks.Count(t => t.Status == TaskItemStatus.InProgress),
                OverdueTasks = p.Tasks.Count(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now),
                IsOverdue = p.Status != ProjectStatus.Completed && p.PlannedEndDate.Date < now
            };
        }).ToList();

        return ApiResponse<List<ProjectProgressReportDto>>.Ok(list);
    }

    public async Task<ApiResponse<List<TaskReportDto>>> GetTaskReportAsync(ReportFilterRequest filter, Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false)
    {
        var now = DateTime.UtcNow.Date;
        var query = _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.Assignees).ThenInclude(a => a.User)
            .AsNoTracking();

        if (!canViewAll && currentUserId.HasValue)
        {
            if (canViewProject)
            {
                query = query.Where(t =>
                    t.Assignees.Any(a => a.UserId == currentUserId.Value) ||
                    t.CreatedById == currentUserId.Value ||
                    t.Project.ManagerId == currentUserId.Value ||
                    t.Project.CreatedById == currentUserId.Value ||
                    t.Project.Members.Any(m => m.UserId == currentUserId.Value));
            }
            else
            {
                query = query.Where(t =>
                    t.Assignees.Any(a => a.UserId == currentUserId.Value) ||
                    t.CreatedById == currentUserId.Value ||
                    t.Project.ManagerId == currentUserId.Value ||
                    t.Project.CreatedById == currentUserId.Value ||
                    t.Project.Members.Any(m => m.UserId == currentUserId.Value && (m.RoleInProject == "Quản lý công trình (PM)" || m.RoleInProject == "Quản lý dự án" || m.RoleInProject == "Chỉ huy trưởng")));
            }
        }

        if (filter.ProjectId.HasValue)
        {
            query = query.Where(t => t.ProjectId == filter.ProjectId.Value);
        }

        if (filter.UserId.HasValue)
        {
            query = query.Where(t => t.Assignees.Any(a => a.UserId == filter.UserId.Value));
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(t => t.Status == filter.Status.Value);
        }

        if (filter.FromDate.HasValue)
        {
            query = query.Where(t => t.StartDate >= filter.FromDate.Value);
        }

        if (filter.ToDate.HasValue)
        {
            query = query.Where(t => t.PlannedEndDate <= filter.ToDate.Value);
        }

        var tasks = await query
            .OrderBy(t => t.ProjectId)
            .ThenBy(t => t.StartDate)
            .ToListAsync();

        var list = tasks.Select(t => new TaskReportDto
        {
            TaskId = t.Id,
            TaskName = t.Name,
            ProjectCode = t.Project.Code,
            ProjectName = t.Project.Name,
            AssigneeNames = string.Join(", ", t.Assignees.Select(a => a.User.FullName)),
            Assignees = t.Assignees.Select(a => new ReportAssigneeDto
            {
                Id = a.User.Id,
                FullName = a.User.FullName,
                AvatarUrl = a.User.AvatarUrl,
                Email = a.User.Email
            }).ToList(),
            Status = t.Status,
            Progress = t.Progress,
            StartDate = t.StartDate,
            PlannedEndDate = t.PlannedEndDate,
            ActualEndDate = t.ActualEndDate,
            IsOverdue = t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now
        }).ToList();

        return ApiResponse<List<TaskReportDto>>.Ok(list);
    }

    public async Task<ApiResponse<List<OverdueReportDto>>> GetOverdueReportAsync(ReportFilterRequest filter, Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false)
    {
        var now = DateTime.UtcNow.Date;
        var query = _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.Assignees).ThenInclude(a => a.User)
            .Where(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now)
            .AsNoTracking();

        if (!canViewAll && currentUserId.HasValue)
        {
            if (canViewProject)
            {
                query = query.Where(t =>
                    t.Assignees.Any(a => a.UserId == currentUserId.Value) ||
                    t.CreatedById == currentUserId.Value ||
                    t.Project.ManagerId == currentUserId.Value ||
                    t.Project.CreatedById == currentUserId.Value ||
                    t.Project.Members.Any(m => m.UserId == currentUserId.Value));
            }
            else
            {
                query = query.Where(t =>
                    t.Assignees.Any(a => a.UserId == currentUserId.Value) ||
                    t.CreatedById == currentUserId.Value ||
                    t.Project.ManagerId == currentUserId.Value ||
                    t.Project.CreatedById == currentUserId.Value ||
                    t.Project.Members.Any(m => m.UserId == currentUserId.Value && (m.RoleInProject == "Quản lý công trình (PM)" || m.RoleInProject == "Quản lý dự án" || m.RoleInProject == "Chỉ huy trưởng")));
            }
        }

        if (filter.ProjectId.HasValue)
        {
            query = query.Where(t => t.ProjectId == filter.ProjectId.Value);
        }

        if (filter.UserId.HasValue)
        {
            query = query.Where(t => t.Assignees.Any(a => a.UserId == filter.UserId.Value));
        }

        if (filter.FromDate.HasValue)
        {
            query = query.Where(t => t.PlannedEndDate >= filter.FromDate.Value);
        }

        if (filter.ToDate.HasValue)
        {
            query = query.Where(t => t.PlannedEndDate <= filter.ToDate.Value);
        }

        var tasks = await query
            .OrderBy(t => t.PlannedEndDate)
            .ToListAsync();

        var list = tasks.Select(t => new OverdueReportDto
        {
            TaskId = t.Id,
            TaskName = t.Name,
            ProjectCode = t.Project.Code,
            ProjectName = t.Project.Name,
            AssigneeNames = string.Join(", ", t.Assignees.Select(a => a.User.FullName)),
            Assignees = t.Assignees.Select(a => new ReportAssigneeDto
            {
                Id = a.User.Id,
                FullName = a.User.FullName,
                AvatarUrl = a.User.AvatarUrl,
                Email = a.User.Email
            }).ToList(),
            PlannedEndDate = t.PlannedEndDate,
            OverdueDays = (int)(now - t.PlannedEndDate.Date).TotalDays,
            Progress = t.Progress,
            Status = t.Status
        }).ToList();

        return ApiResponse<List<OverdueReportDto>>.Ok(list);
    }

    public async Task<ApiResponse<List<EmployeeWorkloadReportDto>>> GetEmployeeWorkloadReportAsync(ReportFilterRequest filter, Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false)
    {
        var now = DateTime.UtcNow.Date;
        var usersQuery = _context.Users
            .Where(u => u.IsActive)
            .Include(u => u.TaskAssignments).ThenInclude(ta => ta.Task)
            .AsNoTracking();

        List<Guid> managedProjectIds = new();

        if (!canViewAll)
        {
            if (canViewProject && currentUserId.HasValue)
            {
                managedProjectIds = await _context.Projects
                    .Where(p => p.ManagerId == currentUserId.Value ||
                                p.CreatedById == currentUserId.Value ||
                                p.Members.Any(m => m.UserId == currentUserId.Value && (m.RoleInProject == "Quản lý công trình (PM)" || m.RoleInProject == "Quản lý dự án" || m.RoleInProject == "Chỉ huy trưởng")))
                    .Select(p => p.Id)
                    .ToListAsync();

                var memberUserIds = await _context.ProjectMembers
                    .Where(pm => managedProjectIds.Contains(pm.ProjectId))
                    .Select(pm => pm.UserId)
                    .Distinct()
                    .ToListAsync();

                var assigneeUserIds = await _context.TaskAssignees
                    .Where(ta => managedProjectIds.Contains(ta.Task.ProjectId))
                    .Select(ta => ta.UserId)
                    .Distinct()
                    .ToListAsync();

                var allowedUserIds = memberUserIds
                    .Union(assigneeUserIds)
                    .Append(currentUserId.Value)
                    .Distinct()
                    .ToList();

                usersQuery = usersQuery.Where(u => allowedUserIds.Contains(u.Id));
            }
            else if (currentUserId.HasValue)
            {
                usersQuery = usersQuery.Where(u => u.Id == currentUserId.Value);
            }
        }

        if (filter.UserId.HasValue)
        {
            usersQuery = usersQuery.Where(u => u.Id == filter.UserId.Value);
        }

        var users = await usersQuery.ToListAsync();

        var list = users.Select(u =>
        {
            var tasks = u.TaskAssignments.Select(ta => ta.Task).Where(t => t != null).ToList();

            if (!canViewAll && canViewProject && currentUserId.HasValue && u.Id != currentUserId.Value)
            {
                tasks = tasks.Where(t => managedProjectIds.Contains(t.ProjectId)).ToList();
            }

            if (filter.ProjectId.HasValue)
            {
                tasks = tasks.Where(t => t.ProjectId == filter.ProjectId.Value).ToList();
            }

            if (filter.FromDate.HasValue)
            {
                tasks = tasks.Where(t => t.StartDate >= filter.FromDate.Value || t.PlannedEndDate >= filter.FromDate.Value).ToList();
            }

            if (filter.ToDate.HasValue)
            {
                tasks = tasks.Where(t => t.StartDate <= filter.ToDate.Value || t.PlannedEndDate <= filter.ToDate.Value).ToList();
            }

            var active = tasks.Count(t => t.Status == TaskItemStatus.InProgress || t.Status == TaskItemStatus.NotStarted || t.Status == TaskItemStatus.OnHold);
            var completed = tasks.Count(t => t.Status == TaskItemStatus.Completed);
            var overdue = tasks.Count(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now);
            var avgProgress = tasks.Any() ? Math.Round(tasks.Average(t => t.Progress), 1) : 0;

            return new EmployeeWorkloadReportDto
            {
                UserId = u.Id,
                FullName = u.FullName,
                AvatarUrl = u.AvatarUrl,
                Department = u.Department,
                Email = u.Email,
                TotalTasks = tasks.Count,
                ActiveTasks = active,
                CompletedTasks = completed,
                OverdueTasks = overdue,
                AverageProgress = avgProgress
            };
        }).OrderByDescending(x => x.ActiveTasks).ToList();

        return ApiResponse<List<EmployeeWorkloadReportDto>>.Ok(list);
    }

    public async Task<byte[]> ExportReportCsvAsync(string reportType, ReportFilterRequest filter, Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false)
    {
        var sb = new StringBuilder();
        // UTF-8 BOM for Excel Vietnamese text support
        sb.Append('\uFEFF');

        if (reportType.Equals("projects", StringComparison.OrdinalIgnoreCase))
        {
            var res = await GetProjectProgressReportAsync(filter, currentUserId, canViewAll, canViewProject);
            sb.AppendLine("Mã Dự Án,Tên Công Trình,Người Quản Lý,Ngày Bắt Đầu,Hạn Dự Kiến,Tiến Độ (%),Trạng Thái,Tổng Task,Task Xong,Task Quá Hạn");
            foreach (var p in res.Data ?? new List<ProjectProgressReportDto>())
            {
                sb.AppendLine($"\"{p.Code}\",\"{p.Name}\",\"{p.ManagerName}\",\"{p.StartDate:dd/MM/yyyy}\",\"{p.PlannedEndDate:dd/MM/yyyy}\",{p.Progress},\"{p.Status}\",{p.TotalTasks},{p.CompletedTasks},{p.OverdueTasks}");
            }
        }
        else if (reportType.Equals("overdue", StringComparison.OrdinalIgnoreCase))
        {
            var res = await GetOverdueReportAsync(filter, currentUserId, canViewAll, canViewProject);
            sb.AppendLine("Mã Dự Án,Tên Công Việc,Người Phụ Trách,Hạn Dự Kiến,Số Ngày Quá Hạn,Tiến Độ (%),Trạng Thái");
            foreach (var t in res.Data ?? new List<OverdueReportDto>())
            {
                sb.AppendLine($"\"{t.ProjectCode}\",\"{t.TaskName}\",\"{t.AssigneeNames}\",\"{t.PlannedEndDate:dd/MM/yyyy}\",{t.OverdueDays},{t.Progress},\"{t.Status}\"");
            }
        }
        else if (reportType.Equals("workload", StringComparison.OrdinalIgnoreCase))
        {
            var res = await GetEmployeeWorkloadReportAsync(filter, currentUserId, canViewAll, canViewProject);
            sb.AppendLine("Họ Và Tên,Phòng Ban,Email,Tổng Task,Task Đang Làm,Task Đã Xong,Task Quá Hạn,Tiến Độ TB (%)");
            foreach (var w in res.Data ?? new List<EmployeeWorkloadReportDto>())
            {
                sb.AppendLine($"\"{w.FullName}\",\"{w.Department}\",\"{w.Email}\",{w.TotalTasks},{w.ActiveTasks},{w.CompletedTasks},{w.OverdueTasks},{w.AverageProgress}");
            }
        }
        else
        {
            var res = await GetTaskReportAsync(filter, currentUserId, canViewAll, canViewProject);
            sb.AppendLine("Mã Dự Án,Tên Dự Án,Tên Công Việc,Người Phụ Trách,Ngày Bắt Đầu,Hạn Dự Kiến,Tiến Độ (%),Trạng Thái");
            foreach (var t in res.Data ?? new List<TaskReportDto>())
            {
                sb.AppendLine($"\"{t.ProjectCode}\",\"{t.ProjectName}\",\"{t.TaskName}\",\"{t.AssigneeNames}\",\"{t.StartDate:dd/MM/yyyy}\",\"{t.PlannedEndDate:dd/MM/yyyy}\",{t.Progress},\"{t.Status}\"");
            }
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static List<ProjectManagerUserDto> GetProjectManagers(Domain.Entities.Project p)
    {
        var managers = p.Members
            .Where(m => m.RoleInProject == "Quản lý công trình (PM)" || m.RoleInProject == "Quản lý dự án" || m.RoleInProject == "Chỉ huy trưởng" || m.UserId == p.ManagerId)
            .Select(m => new ProjectManagerUserDto
            {
                Id = m.UserId,
                FullName = m.User.FullName,
                AvatarUrl = m.User.AvatarUrl,
                Email = m.User.Email
            })
            .GroupBy(m => m.Id)
            .Select(g => g.First())
            .ToList();

        if (!managers.Any() && p.Manager != null)
        {
            managers.Add(new ProjectManagerUserDto
            {
                Id = p.Manager.Id,
                FullName = p.Manager.FullName,
                AvatarUrl = p.Manager.AvatarUrl,
                Email = p.Manager.Email
            });
        }

        return managers;
    }
}
