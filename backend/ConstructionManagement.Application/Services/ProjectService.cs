using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Application.Services;

public class ProjectService : IProjectService
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogService _activityLogService;

    public ProjectService(IAppDbContext context, IActivityLogService activityLogService)
    {
        _context = context;
        _activityLogService = activityLogService;
    }

    public async Task<ApiResponse<PagedResult<ProjectDto>>> GetAllProjectsAsync(PaginationParams pagination, ProjectStatus? status = null)
    {
        var query = _context.Projects
            .Include(p => p.Manager)
            .Include(p => p.Tasks)
            .Include(p => p.Members)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(pagination.Search))
        {
            var s = pagination.Search.ToLower().Trim();
            query = query.Where(p => p.Name.ToLower().Contains(s) || p.Code.ToLower().Contains(s) || (p.Location != null && p.Location.ToLower().Contains(s)));
        }

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        var totalCount = await query.CountAsync();

        // Dynamic Sorting
        query = pagination.SortBy?.ToLower() switch
        {
            "code" => pagination.IsDescending ? query.OrderByDescending(p => p.Code) : query.OrderBy(p => p.Code),
            "name" => pagination.IsDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "startdate" => pagination.IsDescending ? query.OrderByDescending(p => p.StartDate) : query.OrderBy(p => p.StartDate),
            "plannedenddate" => pagination.IsDescending ? query.OrderByDescending(p => p.PlannedEndDate) : query.OrderBy(p => p.PlannedEndDate),
            "progress" => pagination.IsDescending ? query.OrderByDescending(p => p.Progress) : query.OrderBy(p => p.Progress),
            "status" => pagination.IsDescending ? query.OrderByDescending(p => p.Status) : query.OrderBy(p => p.Status),
            _ => pagination.IsDescending ? query.OrderBy(p => p.CreatedAt) : query.OrderByDescending(p => p.CreatedAt)
        };

        var now = DateTime.UtcNow.Date;
        var pagedProjects = await query
            .Skip((pagination.PageIndex - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,
                Description = p.Description,
                Location = p.Location,
                ManagerId = p.ManagerId,
                ManagerName = p.Manager != null ? p.Manager.FullName : null,
                StartDate = p.StartDate,
                PlannedEndDate = p.PlannedEndDate,
                ActualEndDate = p.ActualEndDate,
                Status = p.Status,
                Progress = p.Progress,
                Priority = p.Priority,
                TaskCount = p.Tasks.Count,
                CompletedTaskCount = p.Tasks.Count(t => t.Status == TaskItemStatus.Completed),
                OverdueTaskCount = p.Tasks.Count(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now),
                MemberCount = p.Members.Count,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        var result = new PagedResult<ProjectDto>
        {
            Items = pagedProjects,
            TotalCount = totalCount,
            PageIndex = pagination.PageIndex,
            PageSize = pagination.PageSize
        };

        return ApiResponse<PagedResult<ProjectDto>>.Ok(result);
    }

    public async Task<ApiResponse<List<ProjectDto>>> GetAllProjectsListAsync()
    {
        var now = DateTime.UtcNow.Date;
        var projects = await _context.Projects
            .Include(p => p.Manager)
            .Include(p => p.Tasks)
            .Include(p => p.Members)
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,
                Description = p.Description,
                Location = p.Location,
                ManagerId = p.ManagerId,
                ManagerName = p.Manager != null ? p.Manager.FullName : null,
                StartDate = p.StartDate,
                PlannedEndDate = p.PlannedEndDate,
                ActualEndDate = p.ActualEndDate,
                Status = p.Status,
                Progress = p.Progress,
                Priority = p.Priority,
                TaskCount = p.Tasks.Count,
                CompletedTaskCount = p.Tasks.Count(t => t.Status == TaskItemStatus.Completed),
                OverdueTaskCount = p.Tasks.Count(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now),
                MemberCount = p.Members.Count,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<List<ProjectDto>>.Ok(projects);
    }

    public async Task<ApiResponse<ProjectDetailDto>> GetProjectByIdAsync(Guid id)
    {
        var p = await _context.Projects
            .Include(p => p.Manager)
            .Include(p => p.Members)
                .ThenInclude(m => m.User)
            .Include(p => p.Tasks)
                .ThenInclude(t => t.Assignees)
                    .ThenInclude(a => a.User)
            .Include(p => p.Tasks)
                .ThenInclude(t => t.Comments)
            .Include(p => p.ActivityLogs)
                .ThenInclude(al => al.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (p == null)
        {
            return ApiResponse<ProjectDetailDto>.Fail("Không tìm thấy dự án.");
        }

        var now = DateTime.UtcNow.Date;
        var taskDtos = p.Tasks
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.StartDate)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                ProjectId = t.ProjectId,
                ProjectName = p.Name,
                ProjectCode = p.Code,
                ParentId = t.ParentId,
                ParentName = p.Tasks.FirstOrDefault(parent => parent.Id == t.ParentId)?.Name,
                Name = t.Name,
                Description = t.Description,
                Status = t.Status,
                Priority = t.Priority,
                StartDate = t.StartDate,
                PlannedEndDate = t.PlannedEndDate,
                ActualEndDate = t.ActualEndDate,
                Progress = t.Progress,
                Weight = t.Weight,
                SortOrder = t.SortOrder,
                Assignees = t.Assignees.Select(a => new TaskAssigneeDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    FullName = a.User.FullName,
                    Email = a.User.Email,
                    Department = a.User.Department,
                    AssignedAt = a.AssignedAt
                }).ToList(),
                SubTaskCount = p.Tasks.Count(st => st.ParentId == t.Id),
                CommentCount = t.Comments.Count,
                CreatedAt = t.CreatedAt
            }).ToList();

        var memberDtos = p.Members.Select(m => new ProjectMemberDto
        {
            Id = m.Id,
            ProjectId = m.ProjectId,
            UserId = m.UserId,
            FullName = m.User.FullName,
            Email = m.User.Email,
            Department = m.User.Department,
            RoleInProject = m.RoleInProject,
            JoinedAt = m.JoinedAt
        }).ToList();

        var activityDtos = p.ActivityLogs
            .OrderByDescending(al => al.CreatedAt)
            .Take(20)
            .Select(al => new ActivityLogDto
            {
                Id = al.Id,
                UserId = al.UserId,
                UserName = al.User.FullName,
                ProjectId = al.ProjectId,
                ProjectCode = p.Code,
                ProjectName = p.Name,
                TaskId = al.TaskId,
                TaskName = al.TaskId.HasValue ? p.Tasks.FirstOrDefault(t => t.Id == al.TaskId.Value)?.Name : null,
                Action = al.Action,
                Details = al.Details,
                OldValue = al.OldValue,
                NewValue = al.NewValue,
                CreatedAt = al.CreatedAt
            }).ToList();

        var detail = new ProjectDetailDto
        {
            Id = p.Id,
            Code = p.Code,
            Name = p.Name,
            Description = p.Description,
            Location = p.Location,
            ManagerId = p.ManagerId,
            ManagerName = p.Manager?.FullName,
            StartDate = p.StartDate,
            PlannedEndDate = p.PlannedEndDate,
            ActualEndDate = p.ActualEndDate,
            Status = p.Status,
            Progress = p.Progress,
            Priority = p.Priority,
            TaskCount = p.Tasks.Count,
            CompletedTaskCount = p.Tasks.Count(t => t.Status == TaskItemStatus.Completed),
            OverdueTaskCount = p.Tasks.Count(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now),
            MemberCount = p.Members.Count,
            CreatedAt = p.CreatedAt,
            Members = memberDtos,
            Tasks = taskDtos,
            RecentActivities = activityDtos
        };

        return ApiResponse<ProjectDetailDto>.Ok(detail);
    }

    public async Task<ApiResponse<ProjectDto>> CreateProjectAsync(CreateProjectRequest request, Guid currentUserId)
    {
        var existingCode = await _context.Projects.AnyAsync(p => p.Code.ToLower() == request.Code.ToLower().Trim());
        if (existingCode)
        {
            return ApiResponse<ProjectDto>.Fail($"Mã công trình/dự án '{request.Code}' đã tồn tại.");
        }

        var project = new Project
        {
            Code = request.Code.Trim().ToUpper(),
            Name = request.Name.Trim(),
            Description = request.Description,
            Location = request.Location,
            ManagerId = request.ManagerId,
            StartDate = request.StartDate,
            PlannedEndDate = request.PlannedEndDate,
            Status = ProjectStatus.NotStarted,
            Progress = 0.0,
            Priority = request.Priority,
            CreatedById = currentUserId,
            CreatedAt = DateTime.UtcNow
        };

        // Add manager as member if specified
        if (request.ManagerId.HasValue)
        {
            project.Members.Add(new ProjectMember
            {
                UserId = request.ManagerId.Value,
                RoleInProject = "Quản lý công trình (PM)",
                JoinedAt = DateTime.UtcNow
            });
        }

        if (request.MemberUserIds != null)
        {
            foreach (var memberId in request.MemberUserIds.Distinct())
            {
                if (memberId != request.ManagerId)
                {
                    project.Members.Add(new ProjectMember
                    {
                        UserId = memberId,
                        RoleInProject = "Thành viên dự án",
                        JoinedAt = DateTime.UtcNow
                    });
                }
            }
        }

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        await _activityLogService.LogAsync(
            currentUserId,
            ActivityAction.ProjectCreated,
            $"Tạo mới công trình {project.Code} - {project.Name}",
            projectId: project.Id
        );

        return await GetProjectDtoAsync(project.Id);
    }

    public async Task<ApiResponse<ProjectDto>> UpdateProjectAsync(Guid id, UpdateProjectRequest request, Guid currentUserId)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
        {
            return ApiResponse<ProjectDto>.Fail("Không tìm thấy dự án.");
        }

        var oldStatus = project.Status;
        project.Name = request.Name.Trim();
        project.Description = request.Description;
        project.Location = request.Location;
        project.ManagerId = request.ManagerId;
        project.StartDate = request.StartDate;
        project.PlannedEndDate = request.PlannedEndDate;
        project.ActualEndDate = request.ActualEndDate;
        project.Status = request.Status;
        project.Priority = request.Priority;
        project.UpdatedAt = DateTime.UtcNow;

        if (request.Status == ProjectStatus.Completed && !project.ActualEndDate.HasValue)
        {
            project.ActualEndDate = DateTime.UtcNow;
            project.Progress = 100.0;
        }

        await _context.SaveChangesAsync();

        await _activityLogService.LogAsync(
            currentUserId,
            ActivityAction.ProjectUpdated,
            $"Cập nhật thông tin công trình {project.Code}",
            projectId: project.Id,
            oldValue: oldStatus.ToString(),
            newValue: project.Status.ToString()
        );

        return await GetProjectDtoAsync(project.Id);
    }

    public async Task<ApiResponse<bool>> DeleteProjectAsync(Guid id, Guid currentUserId)
    {
        var project = await _context.Projects
            .Include(p => p.Tasks)
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return ApiResponse<bool>.Fail("Không tìm thấy dự án.");
        }

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();

        await _activityLogService.LogAsync(
            currentUserId,
            ActivityAction.ProjectUpdated,
            $"Xóa dự án {project.Code} - {project.Name}"
        );

        return ApiResponse<bool>.Ok(true, "Đã xóa dự án thành công.");
    }

    public async Task<ApiResponse<List<ProjectMemberDto>>> GetProjectMembersAsync(Guid projectId)
    {
        var project = await _context.Projects
            .Include(p => p.Manager)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        var members = await _context.ProjectMembers
            .Where(pm => pm.ProjectId == projectId)
            .Include(pm => pm.User)
            .Select(pm => new ProjectMemberDto
            {
                Id = pm.Id,
                ProjectId = pm.ProjectId,
                UserId = pm.UserId,
                FullName = pm.User.FullName,
                Email = pm.User.Email,
                Department = pm.User.Department,
                RoleInProject = pm.RoleInProject,
                JoinedAt = pm.JoinedAt
            })
            .ToListAsync();

        if (project?.Manager != null && !members.Any(m => m.UserId == project.ManagerId))
        {
            members.Insert(0, new ProjectMemberDto
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                UserId = project.Manager.Id,
                FullName = project.Manager.FullName,
                Email = project.Manager.Email,
                Department = project.Manager.Department,
                RoleInProject = "Quản lý dự án (PM)",
                JoinedAt = project.CreatedAt
            });
        }

        return ApiResponse<List<ProjectMemberDto>>.Ok(members);
    }

    public async Task<ApiResponse<ProjectMemberDto>> AddProjectMemberAsync(Guid projectId, AddProjectMemberRequest request)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null)
        {
            return ApiResponse<ProjectMemberDto>.Fail("Không tìm thấy dự án.");
        }

        var existing = await _context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == request.UserId);

        if (existing != null)
        {
            existing.RoleInProject = request.RoleInProject;
            await _context.SaveChangesAsync();
            var user = await _context.Users.FindAsync(request.UserId);
            return ApiResponse<ProjectMemberDto>.Ok(new ProjectMemberDto
            {
                Id = existing.Id,
                ProjectId = projectId,
                UserId = existing.UserId,
                FullName = user?.FullName ?? "",
                Email = user?.Email ?? "",
                Department = user?.Department,
                RoleInProject = existing.RoleInProject,
                JoinedAt = existing.JoinedAt
            }, "Đã cập nhật vai trò thành viên.");
        }

        var member = new ProjectMember
        {
            ProjectId = projectId,
            UserId = request.UserId,
            RoleInProject = request.RoleInProject ?? "Thành viên",
            JoinedAt = DateTime.UtcNow
        };

        _context.ProjectMembers.Add(member);
        await _context.SaveChangesAsync();

        var memberUser = await _context.Users.FindAsync(request.UserId);
        return ApiResponse<ProjectMemberDto>.Ok(new ProjectMemberDto
        {
            Id = member.Id,
            ProjectId = projectId,
            UserId = member.UserId,
            FullName = memberUser?.FullName ?? "",
            Email = memberUser?.Email ?? "",
            Department = memberUser?.Department,
            RoleInProject = member.RoleInProject,
            JoinedAt = member.JoinedAt
        }, "Đã thêm thành viên vào dự án.");
    }

    public async Task<ApiResponse<bool>> RemoveProjectMemberAsync(Guid projectId, Guid userId)
    {
        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);

        if (member == null)
        {
            return ApiResponse<bool>.Fail("Không tìm thấy thành viên trong dự án.");
        }

        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Đã xóa thành viên khỏi dự án.");
    }

    public async Task RecalculateProjectProgressAsync(Guid projectId)
    {
        var project = await _context.Projects
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null || !project.Tasks.Any())
        {
            return;
        }

        // Calculate progress from top-level tasks (ParentId == null)
        var topLevelTasks = project.Tasks.Where(t => t.ParentId == null).ToList();
        if (!topLevelTasks.Any())
        {
            topLevelTasks = project.Tasks.ToList();
        }

        var totalWeight = topLevelTasks.Sum(t => t.Weight > 0 ? t.Weight : 1.0);
        var weightedProgress = topLevelTasks.Sum(t => t.Progress * (t.Weight > 0 ? t.Weight : 1.0));
        var overallProgress = totalWeight > 0 ? Math.Round(weightedProgress / totalWeight, 1) : 0;

        project.Progress = Math.Min(100.0, Math.Max(0.0, overallProgress));

        // Auto update project status based on progress and dates
        if (project.Progress >= 100.0)
        {
            project.Status = ProjectStatus.Completed;
            if (!project.ActualEndDate.HasValue) project.ActualEndDate = DateTime.UtcNow;
        }
        else if (project.Progress > 0)
        {
            if (DateTime.UtcNow.Date > project.PlannedEndDate.Date)
            {
                project.Status = ProjectStatus.Overdue;
            }
            else
            {
                project.Status = ProjectStatus.InProgress;
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task<ApiResponse<ProjectDto>> GetProjectDtoAsync(Guid id)
    {
        var p = await _context.Projects
            .Include(p => p.Manager)
            .Include(p => p.Tasks)
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (p == null) return ApiResponse<ProjectDto>.Fail("Không tìm thấy dự án.");

        var now = DateTime.UtcNow.Date;
        return ApiResponse<ProjectDto>.Ok(new ProjectDto
        {
            Id = p.Id,
            Code = p.Code,
            Name = p.Name,
            Description = p.Description,
            Location = p.Location,
            ManagerId = p.ManagerId,
            ManagerName = p.Manager?.FullName,
            StartDate = p.StartDate,
            PlannedEndDate = p.PlannedEndDate,
            ActualEndDate = p.ActualEndDate,
            Status = p.Status,
            Progress = p.Progress,
            Priority = p.Priority,
            TaskCount = p.Tasks.Count,
            CompletedTaskCount = p.Tasks.Count(t => t.Status == TaskItemStatus.Completed),
            OverdueTaskCount = p.Tasks.Count(t => t.Status != TaskItemStatus.Completed && t.PlannedEndDate.Date < now),
            MemberCount = p.Members.Count,
            CreatedAt = p.CreatedAt
        });
    }
}
