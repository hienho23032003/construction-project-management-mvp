using BCrypt.Net;
using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Application.Services;

public class UserService : IUserService
{
    private readonly IAppDbContext _context;

    public UserService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResult<UserDto>>> GetAllUsersAsync(PaginationParams pagination)
    {
        var query = _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(pagination.Search))
        {
            var s = pagination.Search.ToLower().Trim();
            query = query.Where(u => u.FullName.ToLower().Contains(s) || u.Email.ToLower().Contains(s) || (u.Department != null && u.Department.ToLower().Contains(s)));
        }

        var totalCount = await query.CountAsync();

        query = pagination.SortBy?.ToLower() switch
        {
            "fullname" => pagination.IsDescending ? query.OrderByDescending(u => u.FullName) : query.OrderBy(u => u.FullName),
            "email" => pagination.IsDescending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "department" => pagination.IsDescending ? query.OrderByDescending(u => u.Department) : query.OrderBy(u => u.Department),
            "role" => pagination.IsDescending ? query.OrderByDescending(u => u.Role) : query.OrderBy(u => u.Role),
            _ => pagination.IsDescending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.FullName)
        };

        var users = await query
            .Skip((pagination.PageIndex - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Department = u.Department,
                AvatarUrl = u.AvatarUrl,
                Role = u.Role,
                Roles = u.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role!.Name).ToList(),
                RoleIds = u.UserRoles.Select(ur => ur.RoleId).ToList(),
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<UserDto>>.Ok(new PagedResult<UserDto>
        {
            Items = users,
            TotalCount = totalCount,
            PageIndex = pagination.PageIndex,
            PageSize = pagination.PageSize
        });
    }

    public async Task<ApiResponse<List<UserDto>>> GetAllUsersListAsync()
    {
        var users = await _context.Users
            .Where(u => u.IsActive)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .OrderBy(u => u.FullName)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Department = u.Department,
                AvatarUrl = u.AvatarUrl,
                Role = u.Role,
                Roles = u.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role!.Name).ToList(),
                RoleIds = u.UserRoles.Select(ur => ur.RoleId).ToList(),
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<List<UserDto>>.Ok(users);
    }

    public async Task<ApiResponse<UserDto>> GetUserByIdAsync(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("Không tìm thấy nhân viên.");
        }

        return ApiResponse<UserDto>.Ok(new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Department = user.Department,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role,
            Roles = user.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role!.Name).ToList(),
            RoleIds = user.UserRoles.Select(ur => ur.RoleId).ToList(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        });
    }

    public async Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserRequest request)
    {
        var existing = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower().Trim());
        if (existing)
        {
            return ApiResponse<UserDto>.Fail("Email nhân viên đã tồn tại.");
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone,
            Department = request.Department,
            Role = request.Role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        if (request.RoleIds != null && request.RoleIds.Count > 0)
        {
            foreach (var rId in request.RoleIds.Distinct())
            {
                user.UserRoles.Add(new UserRoleMapping
                {
                    UserId = user.Id,
                    RoleId = rId,
                    AssignedAt = DateTime.UtcNow
                });
            }
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return await GetUserByIdAsync(user.Id);
    }

    public async Task<ApiResponse<UserDto>> UpdateUserAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("Không tìm thấy nhân viên.");
        }

        user.FullName = request.FullName.Trim();
        user.Phone = request.Phone;
        user.Department = request.Department;
        user.Role = request.Role;
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        }

        if (request.RoleIds != null)
        {
            var requestedRoleIds = request.RoleIds.Distinct().ToList();
            var existingUserRoles = await _context.UserRoles
                .Where(ur => ur.UserId == id)
                .ToListAsync();

            var toRemove = existingUserRoles.Where(ur => !requestedRoleIds.Contains(ur.RoleId)).ToList();
            if (toRemove.Any())
            {
                _context.UserRoles.RemoveRange(toRemove);
            }

            var existingRoleIds = existingUserRoles.Select(ur => ur.RoleId).ToHashSet();
            var toAdd = requestedRoleIds.Where(rId => !existingRoleIds.Contains(rId)).ToList();
            foreach (var rId in toAdd)
            {
                _context.UserRoles.Add(new UserRoleMapping
                {
                    UserId = user.Id,
                    RoleId = rId,
                    AssignedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();

        return await GetUserByIdAsync(user.Id);
    }

    public async Task<ApiResponse<bool>> DeleteUserAsync(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .Include(u => u.Sessions)
            .Include(u => u.TaskAssignments)
            .Include(u => u.ProjectMemberships)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return ApiResponse<bool>.Fail("Không tìm thấy nhân viên.");
        }

        _context.UserRoles.RemoveRange(user.UserRoles);
        _context.UserLoginSessions.RemoveRange(user.Sessions);
        _context.TaskAssignees.RemoveRange(user.TaskAssignments);
        _context.ProjectMembers.RemoveRange(user.ProjectMemberships);
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Đã xóa tài khoản nhân viên thành công.");
    }

    public async Task<ApiResponse<bool>> ToggleUserStatusAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return ApiResponse<bool>.Fail("Không tìm thấy nhân viên.");
        }

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var msg = user.IsActive ? "Đã mở khóa tài khoản nhân sự thành công." : "Đã khóa tài khoản nhân sự thành công.";
        return ApiResponse<bool>.Ok(user.IsActive, msg);
    }

    public async Task<ApiResponse<List<EmployeeWorkloadSummaryDto>>> GetWorkloadSummaryAsync()
    {
        var now = DateTime.UtcNow.Date;
        var users = await _context.Users
            .Where(u => u.IsActive)
            .Include(u => u.TaskAssignments)
                .ThenInclude(ta => ta.Task)
            .ToListAsync();

        var list = users.Select(u =>
        {
            var tasks = u.TaskAssignments.Select(ta => ta.Task).Where(t => t != null).ToList();
            var active = tasks.Count(t => t.Status == TaskItemStatus.InProgress || t.Status == TaskItemStatus.NotStarted || t.Status == TaskItemStatus.OnHold);
            var completed = tasks.Count(t => t.Status == TaskItemStatus.Completed);
            var overdue = tasks.Count(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now);

            return new EmployeeWorkloadSummaryDto
            {
                UserId = u.Id,
                FullName = u.FullName,
                Department = u.Department,
                ActiveTasks = active,
                CompletedTasks = completed,
                OverdueTasks = overdue
            };
        }).OrderByDescending(x => x.ActiveTasks).ToList();

        return ApiResponse<List<EmployeeWorkloadSummaryDto>>.Ok(list);
    }

    public async Task<ApiResponse<EmployeeProgressDetailDto>> GetUserProgressSummaryAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.ProjectMemberships)
                .ThenInclude(pm => pm.Project)
            .Include(u => u.TaskAssignments)
                .ThenInclude(ta => ta.Task)
                    .ThenInclude(t => t.Project)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return ApiResponse<EmployeeProgressDetailDto>.Fail("Không tìm thấy thông tin nhân sự.");
        }

        var now = DateTime.UtcNow.Date;
        var userDto = new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Department = user.Department,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role,
            Roles = user.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role!.Name).ToList(),
            RoleIds = user.UserRoles.Select(ur => ur.RoleId).ToList(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        // Tasks assigned to user
        var taskItems = user.TaskAssignments
            .Where(ta => ta.Task != null)
            .Select(ta =>
            {
                var t = ta.Task!;
                var isOverdue = t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now;
                var daysRemaining = (t.PlannedEndDate.Date - now).Days;

                return new EmployeeTaskItemDto
                {
                    TaskId = t.Id,
                    ProjectId = t.ProjectId,
                    ProjectCode = t.Project?.Code ?? string.Empty,
                    ProjectName = t.Project?.Name ?? string.Empty,
                    Name = t.Name,
                    Status = t.Status,
                    Priority = t.Priority,
                    Progress = t.Progress,
                    StartDate = t.StartDate,
                    PlannedEndDate = t.PlannedEndDate,
                    ActualEndDate = t.ActualEndDate,
                    IsOverdue = isOverdue,
                    DaysRemaining = daysRemaining,
                    AssignedAt = ta.AssignedAt
                };
            })
            .OrderByDescending(t => t.IsOverdue)
            .ThenBy(t => t.PlannedEndDate)
            .ToList();

        // KPI Stats
        var totalTasks = taskItems.Count;
        var completedTasks = taskItems.Count(t => t.Status == TaskItemStatus.Completed);
        var inProgressTasks = taskItems.Count(t => t.Status == TaskItemStatus.InProgress);
        var notStartedTasks = taskItems.Count(t => t.Status == TaskItemStatus.NotStarted);
        var overdueTasks = taskItems.Count(t => t.IsOverdue);

        var avgProgress = totalTasks > 0 ? Math.Round(taskItems.Average(t => t.Progress), 1) : 0;
        
        var onTimeCount = taskItems.Count(t =>
            (t.Status == TaskItemStatus.Completed && (t.ActualEndDate == null || t.ActualEndDate.Value.Date <= t.PlannedEndDate.Date)) ||
            (t.Status != TaskItemStatus.Completed && !t.IsOverdue)
        );
        var onTimeRate = totalTasks > 0 ? Math.Round((double)onTimeCount / totalTasks * 100, 1) : 100.0;

        // Projects participated
        var projects = user.ProjectMemberships
            .Where(pm => pm.Project != null)
            .Select(pm =>
            {
                var p = pm.Project!;
                var projectTasks = taskItems.Where(t => t.ProjectId == p.Id).ToList();
                var pTotal = projectTasks.Count;
                var pCompleted = projectTasks.Count(t => t.Status == TaskItemStatus.Completed);
                var pInProgress = projectTasks.Count(t => t.Status == TaskItemStatus.InProgress);
                var pOverdue = projectTasks.Count(t => t.IsOverdue);
                var pAvgProg = pTotal > 0 ? Math.Round(projectTasks.Average(t => t.Progress), 1) : p.Progress;

                return new EmployeeProjectParticipationDto
                {
                    ProjectId = p.Id,
                    ProjectCode = p.Code,
                    ProjectName = p.Name,
                    ProjectLocation = p.Location,
                    ProjectStatus = p.Status,
                    ProjectProgress = p.Progress,
                    RoleInProject = pm.RoleInProject,
                    JoinedAt = pm.JoinedAt,
                    TotalTasks = pTotal,
                    CompletedTasks = pCompleted,
                    InProgressTasks = pInProgress,
                    OverdueTasks = pOverdue,
                    AverageProgress = pAvgProg
                };
            })
            .OrderByDescending(p => p.ProjectStatus == ProjectStatus.InProgress)
            .ThenByDescending(p => p.JoinedAt)
            .ToList();

        // Check if user has tasks in projects they aren't explicitly in ProjectMemberships
        var projectIdsInMemberships = projects.Select(p => p.ProjectId).ToHashSet();
        var extraProjectTasks = taskItems.Where(t => !projectIdsInMemberships.Contains(t.ProjectId)).GroupBy(t => t.ProjectId).ToList();
        foreach (var grp in extraProjectTasks)
        {
            var firstTask = grp.First();
            var pTotal = grp.Count();
            var pCompleted = grp.Count(t => t.Status == TaskItemStatus.Completed);
            var pInProgress = grp.Count(t => t.Status == TaskItemStatus.InProgress);
            var pOverdue = grp.Count(t => t.IsOverdue);
            var pAvgProg = Math.Round(grp.Average(t => t.Progress), 1);

            projects.Add(new EmployeeProjectParticipationDto
            {
                ProjectId = firstTask.ProjectId,
                ProjectCode = firstTask.ProjectCode,
                ProjectName = firstTask.ProjectName,
                ProjectStatus = ProjectStatus.InProgress,
                RoleInProject = "Thành viên phân công",
                JoinedAt = firstTask.AssignedAt,
                TotalTasks = pTotal,
                CompletedTasks = pCompleted,
                InProgressTasks = pInProgress,
                OverdueTasks = pOverdue,
                AverageProgress = pAvgProg
            });
        }

        // Recent Activities by user
        var activities = await _context.ActivityLogs
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(15)
            .Select(a => new EmployeeActivityLogDto
            {
                Id = a.Id,
                Action = a.Action,
                Details = a.Details,
                ProjectName = a.Project != null ? a.Project.Name : null,
                TaskName = a.Task != null ? a.Task.Name : null,
                OldValue = a.OldValue,
                NewValue = a.NewValue,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        var result = new EmployeeProgressDetailDto
        {
            User = userDto,
            Stats = new EmployeeKpiStatsDto
            {
                TotalProjects = projects.Count,
                TotalTasks = totalTasks,
                CompletedTasks = completedTasks,
                InProgressTasks = inProgressTasks,
                NotStartedTasks = notStartedTasks,
                OverdueTasks = overdueTasks,
                AverageTaskProgress = avgProgress,
                OnTimeCompletionRate = onTimeRate
            },
            Projects = projects,
            Tasks = taskItems,
            RecentActivities = activities
        };

        return ApiResponse<EmployeeProgressDetailDto>.Ok(result);
    }
}
