using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Application.Services;

public class TaskService : ITaskService
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogService _activityLogService;
    private readonly INotificationService _notificationService;
    private readonly IFileStorageService _fileStorageService;

    public TaskService(
        IAppDbContext context,
        IActivityLogService activityLogService,
        INotificationService notificationService,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _activityLogService = activityLogService;
        _notificationService = notificationService;
        _fileStorageService = fileStorageService;
    }

    public async Task<ApiResponse<PagedResult<TaskDto>>> GetAllTasksAsync(
        PaginationParams pagination,
        Guid? projectId = null,
        Guid? assigneeId = null,
        TaskItemStatus? status = null,
        PriorityLevel? priority = null)
    {
        var query = _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.Assignees).ThenInclude(a => a.User)
            .Include(t => t.Parent)
            .AsNoTracking();

        if (projectId.HasValue)
        {
            query = query.Where(t => t.ProjectId == projectId.Value);
        }

        if (assigneeId.HasValue)
        {
            query = query.Where(t => t.Assignees.Any(a => a.UserId == assigneeId.Value));
        }

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        if (priority.HasValue)
        {
            query = query.Where(t => t.Priority == priority.Value);
        }

        if (!string.IsNullOrWhiteSpace(pagination.Search))
        {
            var s = pagination.Search.ToLower().Trim();
            query = query.Where(t => t.Name.ToLower().Contains(s) || (t.Description != null && t.Description.ToLower().Contains(s)));
        }

        var totalCount = await query.CountAsync();

        // Dynamic Sorting
        query = pagination.SortBy?.ToLower() switch
        {
            "name" => pagination.IsDescending ? query.OrderByDescending(t => t.Name) : query.OrderBy(t => t.Name),
            "projectcode" => pagination.IsDescending ? query.OrderByDescending(t => t.Project.Code) : query.OrderBy(t => t.Project.Code),
            "startdate" => pagination.IsDescending ? query.OrderByDescending(t => t.StartDate) : query.OrderBy(t => t.StartDate),
            "plannedenddate" => pagination.IsDescending ? query.OrderByDescending(t => t.PlannedEndDate) : query.OrderBy(t => t.PlannedEndDate),
            "progress" => pagination.IsDescending ? query.OrderByDescending(t => t.Progress) : query.OrderBy(t => t.Progress),
            "status" => pagination.IsDescending ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
            "priority" => pagination.IsDescending ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
            _ => pagination.IsDescending ? query.OrderBy(t => t.StartDate) : query.OrderBy(t => t.ProjectId).ThenBy(t => t.SortOrder).ThenBy(t => t.StartDate)
        };

        var pagedTasks = await query
            .Skip((pagination.PageIndex - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        var taskIds = pagedTasks.Select(t => t.Id).ToList();
        var subtaskCounts = await _context.Tasks
            .Where(t => t.ParentId.HasValue && taskIds.Contains(t.ParentId.Value))
            .GroupBy(t => t.ParentId)
            .Select(g => new { ParentId = g.Key!.Value, Count = g.Count() })
            .ToDictionaryAsync(x => x.ParentId, x => x.Count);

        var commentCounts = await _context.TaskComments
            .Where(c => taskIds.Contains(c.TaskId))
            .GroupBy(c => c.TaskId)
            .Select(g => new { TaskId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.TaskId, x => x.Count);

        var dtos = pagedTasks.Select(t => new TaskDto
        {
            Id = t.Id,
            ProjectId = t.ProjectId,
            ProjectName = t.Project.Name,
            ProjectCode = t.Project.Code,
            ParentId = t.ParentId,
            ParentName = t.Parent?.Name,
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
                AvatarUrl = a.User.AvatarUrl,
                AssignedAt = a.AssignedAt
            }).ToList(),
            SubTaskCount = subtaskCounts.ContainsKey(t.Id) ? subtaskCounts[t.Id] : 0,
            CommentCount = commentCounts.ContainsKey(t.Id) ? commentCounts[t.Id] : 0,
            CreatedAt = t.CreatedAt
        }).ToList();

        var result = new PagedResult<TaskDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageIndex = pagination.PageIndex,
            PageSize = pagination.PageSize
        };

        return ApiResponse<PagedResult<TaskDto>>.Ok(result);
    }

    public async Task<ApiResponse<List<TaskTreeDto>>> GetTaskTreeByProjectAsync(Guid projectId)
    {
        var tasks = await _context.Tasks
            .Where(t => t.ProjectId == projectId)
            .Include(t => t.Project)
            .Include(t => t.Assignees).ThenInclude(a => a.User)
            .Include(t => t.Comments)
            .Include(t => t.Parent)
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.StartDate)
            .AsNoTracking()
            .ToListAsync();

        var subtaskCounts = tasks
            .GroupBy(t => t.ParentId)
            .Where(g => g.Key.HasValue)
            .ToDictionary(g => g.Key!.Value, g => g.Count());

        // Map to DTOs
        var dtoList = tasks.Select(t => new TaskTreeDto
        {
            Id = t.Id,
            ProjectId = t.ProjectId,
            ProjectName = t.Project.Name,
            ProjectCode = t.Project.Code,
            ParentId = t.ParentId,
            ParentName = t.Parent?.Name,
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
                AvatarUrl = a.User.AvatarUrl,
                AssignedAt = a.AssignedAt
            }).ToList(),
            SubTaskCount = subtaskCounts.ContainsKey(t.Id) ? subtaskCounts[t.Id] : 0,
            CommentCount = t.Comments.Count,
            CreatedAt = t.CreatedAt,
            Children = new List<TaskTreeDto>()
        }).ToList();

        // Build recursive tree
        var lookup = dtoList.ToDictionary(x => x.Id);
        var rootTasks = new List<TaskTreeDto>();

        foreach (var item in dtoList)
        {
            if (item.ParentId.HasValue && lookup.ContainsKey(item.ParentId.Value))
            {
                var parent = lookup[item.ParentId.Value];
                item.Level = parent.Level + 1;
                parent.Children.Add(item);
            }
            else
            {
                item.Level = 0;
                rootTasks.Add(item);
            }
        }

        return ApiResponse<List<TaskTreeDto>>.Ok(rootTasks);
    }

    public async Task<ApiResponse<TaskDto>> GetTaskByIdAsync(Guid id)
    {
        var t = await _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.Parent)
            .Include(t => t.Assignees).ThenInclude(a => a.User)
            .Include(t => t.Comments).ThenInclude(c => c.User)
            .Include(t => t.Predecessors).ThenInclude(p => p.PredecessorTask)
            .Include(t => t.Successors).ThenInclude(s => s.SuccessorTask)
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (t == null)
        {
            return ApiResponse<TaskDto>.Fail("Không tìm thấy công việc.");
        }

        var subtaskCount = await _context.Tasks.CountAsync(st => st.ParentId == t.Id);

        var dto = new TaskDto
        {
            Id = t.Id,
            ProjectId = t.ProjectId,
            ProjectName = t.Project.Name,
            ProjectCode = t.Project.Code,
            ParentId = t.ParentId,
            ParentName = t.Parent?.Name,
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
                AvatarUrl = a.User.AvatarUrl,
                AssignedAt = a.AssignedAt
            }).ToList(),
            Dependencies = t.Predecessors.Select(p => new TaskDependencyDto
            {
                Id = p.Id,
                PredecessorTaskId = p.PredecessorTaskId,
                PredecessorTaskName = p.PredecessorTask.Name,
                SuccessorTaskId = p.SuccessorTaskId,
                SuccessorTaskName = t.Name,
                DependencyType = p.DependencyType
            }).ToList(),
            SubTaskCount = subtaskCount,
            CommentCount = t.Comments.Count,
            CreatedAt = t.CreatedAt
        };

        return ApiResponse<TaskDto>.Ok(dto);
    }

    public async Task<ApiResponse<TaskDto>> CreateTaskAsync(CreateTaskRequest request, Guid currentUserId)
    {
        var project = await _context.Projects.FindAsync(request.ProjectId);
        if (project == null)
        {
            return ApiResponse<TaskDto>.Fail("Không tìm thấy dự án.");
        }

        var task = new TaskItem
        {
            ProjectId = request.ProjectId,
            ParentId = request.ParentId,
            Name = request.Name.Trim(),
            Description = request.Description,
            Status = request.Status,
            Priority = request.Priority,
            StartDate = request.StartDate,
            PlannedEndDate = request.PlannedEndDate,
            ActualEndDate = request.Status == TaskItemStatus.Completed ? (request.ActualEndDate ?? DateTime.UtcNow) : request.ActualEndDate,
            Progress = request.Status == TaskItemStatus.Completed ? 100.0 : request.Progress,
            Weight = request.Weight > 0 ? request.Weight : 1.0,
            SortOrder = request.SortOrder,
            CreatedById = currentUserId,
            CreatedAt = DateTime.UtcNow
        };

        var assigneesToAssign = request.AssigneeUserIds ?? request.AssigneeIds;
        if (assigneesToAssign != null && assigneesToAssign.Any())
        {
            foreach (var userId in assigneesToAssign.Distinct())
            {
                task.Assignees.Add(new TaskAssignee
                {
                    UserId = userId,
                    AssignedAt = DateTime.UtcNow
                });
            }
        }

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        // Notify assigned users
        if (assigneesToAssign != null)
        {
            foreach (var userId in assigneesToAssign.Distinct())
            {
                await _notificationService.CreateNotificationAsync(
                    userId,
                    "Bạn được giao công việc mới",
                    $"Bạn vừa được giao phụ trách công việc '{task.Name}' trong dự án {project.Code}.",
                    NotificationType.TaskAssigned,
                    "Task",
                    task.Id
                );
            }
        }

        await _activityLogService.LogAsync(
            currentUserId,
            ActivityAction.TaskCreated,
            $"Tạo công việc '{task.Name}'",
            projectId: project.Id,
            taskId: task.Id
        );

        // Update parent hierarchy and project progress
        if (task.ParentId.HasValue)
        {
            await RecalculateParentTaskProgressAsync(task.ParentId.Value);
        }
        else
        {
            await RecalculateProjectProgressInternalAsync(project.Id);
        }

        return await GetTaskByIdAsync(task.Id);
    }

    public async Task<ApiResponse<TaskDto>> UpdateTaskAsync(Guid id, UpdateTaskRequest request, Guid currentUserId)
    {
        var task = await _context.Tasks
            .Include(t => t.Assignees)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            return ApiResponse<TaskDto>.Fail("Không tìm thấy công việc.");
        }

        var oldStatus = task.Status;
        var oldProgress = task.Progress;
        var oldParentId = task.ParentId;

        task.Name = request.Name.Trim();
        task.Description = request.Description;
        task.Status = request.Status;
        task.Priority = request.Priority;
        task.StartDate = request.StartDate;
        task.PlannedEndDate = request.PlannedEndDate;
        task.ActualEndDate = request.ActualEndDate;
        task.Progress = request.Progress;
        task.Weight = request.Weight > 0 ? request.Weight : 1.0;
        task.SortOrder = request.SortOrder;
        task.ParentId = request.ParentId;
        task.UpdatedById = currentUserId;
        task.UpdatedAt = DateTime.UtcNow;

        if (request.Status == TaskItemStatus.Completed)
        {
            task.Progress = 100.0;
            task.ActualEndDate = request.ActualEndDate ?? (oldStatus == TaskItemStatus.Completed ? task.ActualEndDate : DateTime.UtcNow);
        }
        else if (request.Status == TaskItemStatus.NotStarted)
        {
            task.Progress = 0.0;
            task.ActualEndDate = null;
        }
        else if (request.Status == TaskItemStatus.InProgress)
        {
            task.ActualEndDate = null;
            if (task.Progress >= 100.0)
            {
                task.Progress = 50.0;
            }
            else if (task.Progress == 0.0)
            {
                task.Progress = 10.0;
            }
        }
        else if (request.Status == TaskItemStatus.OnHold)
        {
            task.ActualEndDate = null;
            if (task.Progress >= 100.0)
            {
                task.Progress = 50.0;
            }
        }

        // Update Assignees
        var assigneesToUpdate = request.AssigneeUserIds ?? request.AssigneeIds;
        var newlyAssignedUserIds = new List<Guid>();

        if (assigneesToUpdate != null)
        {
            var newAssigneeIds = assigneesToUpdate.Distinct().ToList();
            var existingAssignees = await _context.TaskAssignees
                .Where(a => a.TaskId == task.Id)
                .ToListAsync();

            var currentAssigneeUserIds = existingAssignees.Select(a => a.UserId).ToHashSet();

            // Remove unassigned
            var toRemove = existingAssignees.Where(a => !newAssigneeIds.Contains(a.UserId)).ToList();
            if (toRemove.Any())
            {
                _context.TaskAssignees.RemoveRange(toRemove);
            }

            // Add newly assigned
            var toAdd = newAssigneeIds.Where(uId => !currentAssigneeUserIds.Contains(uId)).ToList();
            foreach (var uId in toAdd)
            {
                _context.TaskAssignees.Add(new TaskAssignee
                {
                    Id = Guid.NewGuid(),
                    TaskId = task.Id,
                    UserId = uId,
                    AssignedAt = DateTime.UtcNow
                });
                newlyAssignedUserIds.Add(uId);
            }
        }

        await _context.SaveChangesAsync();

        // Send notifications after transaction is committed
        foreach (var uId in newlyAssignedUserIds)
        {
            try
            {
                await _notificationService.CreateNotificationAsync(
                    uId,
                    "Bạn được phân công công việc",
                    $"Bạn được gán vào công việc '{task.Name}'.",
                    NotificationType.TaskAssigned,
                    "Task",
                    task.Id
                );
            }
            catch
            {
                // Non-critical notification failure
            }
        }

        await _activityLogService.LogAsync(
            currentUserId,
            ActivityAction.TaskUpdated,
            $"Cập nhật công việc '{task.Name}'",
            projectId: task.ProjectId,
            taskId: task.Id,
            oldValue: $"{oldStatus} ({oldProgress}%)",
            newValue: $"{task.Status} ({task.Progress}%)"
        );

        if (task.ParentId.HasValue)
        {
            await RecalculateParentTaskProgressAsync(task.ParentId.Value);
        }
        if (oldParentId.HasValue && oldParentId != task.ParentId)
        {
            await RecalculateParentTaskProgressAsync(oldParentId.Value);
        }
        await RecalculateProjectProgressInternalAsync(task.ProjectId);

        return await GetTaskByIdAsync(task.Id);
    }

    public async Task<ApiResponse<bool>> DeleteTaskAsync(Guid id, Guid currentUserId)
    {
        var task = await _context.Tasks
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            return ApiResponse<bool>.Fail("Không tìm thấy công việc.");
        }

        var projectId = task.ProjectId;
        var parentId = task.ParentId;
        var taskName = task.Name;

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        await _activityLogService.LogAsync(
            currentUserId,
            ActivityAction.TaskUpdated,
            $"Xóa công việc '{taskName}'",
            projectId: projectId
        );

        if (parentId.HasValue)
        {
            await RecalculateParentTaskProgressAsync(parentId.Value);
        }
        await RecalculateProjectProgressInternalAsync(projectId);

        return ApiResponse<bool>.Ok(true, "Đã xóa công việc thành công.");
    }

    public async Task<ApiResponse<TaskDto>> UpdateStatusAsync(Guid id, UpdateTaskStatusRequest request, Guid currentUserId)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return ApiResponse<TaskDto>.Fail("Không tìm thấy công việc.");

        var oldStatus = task.Status;
        task.Status = request.Status;
        task.UpdatedById = currentUserId;
        task.UpdatedAt = DateTime.UtcNow;

        if (request.Status == TaskItemStatus.Completed)
        {
            task.Progress = 100.0;
            task.ActualEndDate = request.ActualEndDate ?? (oldStatus == TaskItemStatus.Completed ? task.ActualEndDate : DateTime.UtcNow);
        }
        else if (request.Status == TaskItemStatus.NotStarted)
        {
            task.Progress = 0.0;
            task.ActualEndDate = null;
        }
        else if (request.Status == TaskItemStatus.InProgress)
        {
            task.ActualEndDate = null;
            if (task.Progress >= 100.0)
            {
                task.Progress = 50.0;
            }
            else if (task.Progress == 0.0)
            {
                task.Progress = 10.0;
            }
        }
        else if (request.Status == TaskItemStatus.OnHold)
        {
            task.ActualEndDate = null;
            if (task.Progress >= 100.0)
            {
                task.Progress = 50.0;
            }
        }

        await _context.SaveChangesAsync();

        await _activityLogService.LogAsync(
            currentUserId,
            ActivityAction.StatusChanged,
            $"Đổi trạng thái '{task.Name}'",
            projectId: task.ProjectId,
            taskId: task.Id,
            oldValue: oldStatus.ToString(),
            newValue: task.Status.ToString()
        );

        if (task.ParentId.HasValue)
        {
            await RecalculateParentTaskProgressAsync(task.ParentId.Value);
        }
        await RecalculateProjectProgressInternalAsync(task.ProjectId);

        return await GetTaskByIdAsync(task.Id);
    }

    public async Task<ApiResponse<TaskDto>> UpdateProgressAsync(Guid id, UpdateTaskProgressRequest request, Guid currentUserId)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return ApiResponse<TaskDto>.Fail("Không tìm thấy công việc.");

        var oldProgress = task.Progress;
        task.Progress = Math.Min(100.0, Math.Max(0.0, request.Progress));
        task.UpdatedById = currentUserId;
        task.UpdatedAt = DateTime.UtcNow;

        if (task.Progress >= 100.0)
        {
            task.Status = TaskItemStatus.Completed;
            if (!task.ActualEndDate.HasValue) task.ActualEndDate = DateTime.UtcNow;
        }
        else if (task.Progress == 0.0)
        {
            task.Status = TaskItemStatus.NotStarted;
            task.ActualEndDate = null;
        }
        else
        {
            if (task.Status == TaskItemStatus.NotStarted || task.Status == TaskItemStatus.Completed)
            {
                task.Status = TaskItemStatus.InProgress;
            }
            task.ActualEndDate = null;
        }

        await _context.SaveChangesAsync();

        await _activityLogService.LogAsync(
            currentUserId,
            ActivityAction.ProgressChanged,
            $"Cập nhật tiến độ '{task.Name}': {oldProgress}% -> {task.Progress}%",
            projectId: task.ProjectId,
            taskId: task.Id,
            oldValue: $"{oldProgress}%",
            newValue: $"{task.Progress}%"
        );

        if (task.ParentId.HasValue)
        {
            await RecalculateParentTaskProgressAsync(task.ParentId.Value);
        }
        await RecalculateProjectProgressInternalAsync(task.ProjectId);

        return await GetTaskByIdAsync(task.Id);
    }

    public async Task<ApiResponse<TaskDto>> UpdateDatesAsync(Guid id, UpdateTaskDatesRequest request, Guid currentUserId)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return ApiResponse<TaskDto>.Fail("Không tìm thấy công việc.");

        var oldDates = $"{task.StartDate:dd/MM/yyyy} - {task.PlannedEndDate:dd/MM/yyyy}";
        task.StartDate = request.StartDate;
        task.PlannedEndDate = request.PlannedEndDate;
        task.UpdatedById = currentUserId;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _activityLogService.LogAsync(
            currentUserId,
            ActivityAction.DeadlineChanged,
            $"Thay đổi hạn công việc '{task.Name}': {oldDates} -> {task.StartDate:dd/MM/yyyy} - {task.PlannedEndDate:dd/MM/yyyy}",
            projectId: task.ProjectId,
            taskId: task.Id,
            oldValue: oldDates,
            newValue: $"{task.StartDate:dd/MM/yyyy} - {task.PlannedEndDate:dd/MM/yyyy}"
        );

        return await GetTaskByIdAsync(task.Id);
    }

    public async Task<ApiResponse<List<TaskCommentDto>>> GetTaskCommentsAsync(Guid taskId)
    {
        var comments = await _context.TaskComments
            .Where(c => c.TaskId == taskId)
            .Include(c => c.User)
            .Include(c => c.Attachments)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new TaskCommentDto
            {
                Id = c.Id,
                TaskId = c.TaskId,
                UserId = c.UserId,
                UserName = c.User.FullName,
                UserDepartment = c.User.Department,
                UserAvatarUrl = c.User.AvatarUrl,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                Attachments = c.Attachments.Select(a => new TaskCommentAttachmentDto
                {
                    Id = a.Id,
                    CommentId = a.CommentId,
                    FileName = a.FileName,
                    FilePath = a.FilePath,
                    FileSize = a.FileSize,
                    ContentType = a.ContentType,
                    UploadedAt = a.UploadedAt
                }).ToList()
            })
            .ToListAsync();

        return ApiResponse<List<TaskCommentDto>>.Ok(comments);
    }

    public async Task<ApiResponse<TaskCommentDto>> AddCommentAsync(Guid taskId, CreateCommentRequest request, Guid currentUserId)
    {
        return await AddCommentWithAttachmentsAsync(taskId, new CreateCommentWithFilesRequest
        {
            Content = request.Content
        }, currentUserId);
    }

    public async Task<ApiResponse<TaskCommentDto>> AddCommentWithAttachmentsAsync(Guid taskId, CreateCommentWithFilesRequest request, Guid currentUserId)
    {
        var task = await _context.Tasks.Include(t => t.Assignees).FirstOrDefaultAsync(t => t.Id == taskId);
        if (task == null) return ApiResponse<TaskCommentDto>.Fail("Không tìm thấy công việc.");

        if (string.IsNullOrWhiteSpace(request.Content) && (request.Files == null || !request.Files.Any()))
        {
            return ApiResponse<TaskCommentDto>.Fail("Nội dung trao đổi hoặc tệp đính kèm không được để trống.");
        }

        var comment = new TaskComment
        {
            TaskId = taskId,
            UserId = currentUserId,
            Content = (request.Content ?? "").Trim(),
            CreatedAt = DateTime.UtcNow
        };

        if (request.Files != null && request.Files.Any())
        {
            var savedFiles = await _fileStorageService.SaveMultipleFilesAsync(request.Files, "discussions");
            foreach (var f in savedFiles)
            {
                comment.Attachments.Add(new TaskCommentAttachment
                {
                    FileName = f.FileName,
                    FilePath = f.FilePath,
                    FileSize = f.FileSize,
                    ContentType = f.ContentType,
                    UploadedAt = DateTime.UtcNow
                });
            }
        }

        _context.TaskComments.Add(comment);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(currentUserId);

        // Notify other assignees
        foreach (var assignee in task.Assignees.Where(a => a.UserId != currentUserId))
        {
            await _notificationService.CreateNotificationAsync(
                assignee.UserId,
                "Bình luận mới trong công việc",
                $"{user?.FullName ?? "Một thành viên"} đã bình luận trong công việc '{task.Name}'.",
                NotificationType.CommentAdded,
                "Task",
                task.Id
            );
        }

        await _activityLogService.LogAsync(
            currentUserId,
            ActivityAction.CommentAdded,
            $"Thêm trao đổi trong '{task.Name}'",
            projectId: task.ProjectId,
            taskId: task.Id
        );

        return ApiResponse<TaskCommentDto>.Ok(new TaskCommentDto
        {
            Id = comment.Id,
            TaskId = comment.TaskId,
            UserId = comment.UserId,
            UserName = user?.FullName ?? "",
            UserDepartment = user?.Department,
            UserAvatarUrl = user?.AvatarUrl,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            Attachments = comment.Attachments.Select(a => new TaskCommentAttachmentDto
            {
                Id = a.Id,
                CommentId = a.CommentId,
                FileName = a.FileName,
                FilePath = a.FilePath,
                FileSize = a.FileSize,
                ContentType = a.ContentType,
                UploadedAt = a.UploadedAt
            }).ToList()
        }, "Đã đăng trao đổi thành công.");
    }

    public async Task<ApiResponse<bool>> DeleteCommentAsync(Guid commentId, Guid currentUserId)
    {
        var comment = await _context.TaskComments
            .Include(c => c.Attachments)
            .FirstOrDefaultAsync(c => c.Id == commentId);

        if (comment == null) return ApiResponse<bool>.Fail("Không tìm thấy bình luận.");

        if (comment.UserId != currentUserId)
        {
            return ApiResponse<bool>.Fail("Bạn chỉ có thể xóa bình luận của chính mình.");
        }

        // Xóa file vật lý của attachments
        foreach (var att in comment.Attachments)
        {
            _fileStorageService.DeleteFile(att.FilePath);
        }

        _context.TaskComments.Remove(comment);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Đã xóa bình luận.");
    }

    public async Task<ApiResponse<List<TaskDependencyDto>>> GetTaskDependenciesAsync(Guid taskId)
    {
        var deps = await _context.TaskDependencies
            .Where(d => d.PredecessorTaskId == taskId || d.SuccessorTaskId == taskId)
            .Include(d => d.PredecessorTask)
            .Include(d => d.SuccessorTask)
            .Select(d => new TaskDependencyDto
            {
                Id = d.Id,
                PredecessorTaskId = d.PredecessorTaskId,
                PredecessorTaskName = d.PredecessorTask.Name,
                SuccessorTaskId = d.SuccessorTaskId,
                SuccessorTaskName = d.SuccessorTask.Name,
                DependencyType = d.DependencyType
            })
            .ToListAsync();

        return ApiResponse<List<TaskDependencyDto>>.Ok(deps);
    }

    public async Task<ApiResponse<TaskDependencyDto>> AddDependencyAsync(CreateDependencyRequest request, Guid currentUserId)
    {
        if (request.PredecessorTaskId == request.SuccessorTaskId)
        {
            return ApiResponse<TaskDependencyDto>.Fail("Công việc không thể phụ thuộc vào chính nó.");
        }

        var existing = await _context.TaskDependencies
            .AnyAsync(d => d.PredecessorTaskId == request.PredecessorTaskId && d.SuccessorTaskId == request.SuccessorTaskId);

        if (existing)
        {
            return ApiResponse<TaskDependencyDto>.Fail("Mối liên kết giữa 2 công việc này đã tồn tại.");
        }

        var dep = new TaskDependency
        {
            PredecessorTaskId = request.PredecessorTaskId,
            SuccessorTaskId = request.SuccessorTaskId,
            DependencyType = request.DependencyType,
            CreatedAt = DateTime.UtcNow
        };

        _context.TaskDependencies.Add(dep);
        await _context.SaveChangesAsync();

        var pred = await _context.Tasks.FindAsync(request.PredecessorTaskId);
        var succ = await _context.Tasks.FindAsync(request.SuccessorTaskId);

        return ApiResponse<TaskDependencyDto>.Ok(new TaskDependencyDto
        {
            Id = dep.Id,
            PredecessorTaskId = dep.PredecessorTaskId,
            PredecessorTaskName = pred?.Name ?? "",
            SuccessorTaskId = dep.SuccessorTaskId,
            SuccessorTaskName = succ?.Name ?? "",
            DependencyType = dep.DependencyType
        }, "Đã tạo liên kết phụ thuộc giữa 2 công việc.");
    }

    public async Task<ApiResponse<bool>> DeleteDependencyAsync(Guid dependencyId, Guid currentUserId)
    {
        var dep = await _context.TaskDependencies.FindAsync(dependencyId);
        if (dep == null) return ApiResponse<bool>.Fail("Không tìm thấy liên kết phụ thuộc.");

        _context.TaskDependencies.Remove(dep);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Đã xóa liên kết phụ thuộc.");
    }

    public async Task<ApiResponse<GanttDataResponse>> GetGanttDataAsync(
        Guid? projectId = null,
        TaskItemStatus? status = null,
        bool? activeOnly = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var now = DateTime.UtcNow.Date;
        var hasFilters = projectId.HasValue || status.HasValue || (activeOnly == true) || fromDate.HasValue || toDate.HasValue;

        var tasksQuery = _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.Assignees).ThenInclude(a => a.User)
            .Include(t => t.Predecessors)
            .AsNoTracking();

        if (projectId.HasValue)
        {
            tasksQuery = tasksQuery.Where(t => t.ProjectId == projectId.Value);
        }

        if (status.HasValue)
        {
            tasksQuery = tasksQuery.Where(t => t.Status == status.Value);
        }
        else if (activeOnly == true)
        {
            tasksQuery = tasksQuery.Where(t => t.Status != TaskItemStatus.Completed);
        }

        if (fromDate.HasValue)
        {
            var from = fromDate.Value.Date;
            tasksQuery = tasksQuery.Where(t => t.PlannedEndDate >= from);
        }

        if (toDate.HasValue)
        {
            var to = toDate.Value.Date.AddDays(1).AddTicks(-1);
            tasksQuery = tasksQuery.Where(t => t.StartDate <= to);
        }

        var matchedTasks = await tasksQuery.ToListAsync();

        if (hasFilters && !matchedTasks.Any())
        {
            return ApiResponse<GanttDataResponse>.Ok(new GanttDataResponse
            {
                Tasks = new List<GanttTaskDto>(),
                Links = new List<GanttLinkDto>()
            });
        }

        // Retain ancestor parent hierarchy if child tasks matched filters
        var allTaskDict = matchedTasks.ToDictionary(t => t.Id);
        var missingParentIds = matchedTasks
            .Where(t => t.ParentId.HasValue && !allTaskDict.ContainsKey(t.ParentId.Value))
            .Select(t => t.ParentId!.Value)
            .Distinct()
            .ToList();

        while (missingParentIds.Any())
        {
            var parents = await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.Assignees).ThenInclude(a => a.User)
                .Include(t => t.Predecessors)
                .AsNoTracking()
                .Where(t => missingParentIds.Contains(t.Id))
                .ToListAsync();

            if (!parents.Any()) break;

            foreach (var p in parents)
            {
                allTaskDict[p.Id] = p;
            }

            missingParentIds = parents
                .Where(t => t.ParentId.HasValue && !allTaskDict.ContainsKey(t.ParentId.Value))
                .Select(t => t.ParentId!.Value)
                .Distinct()
                .ToList();
        }

        var allTasks = allTaskDict.Values.OrderBy(t => t.SortOrder).ThenBy(t => t.StartDate).ToList();

        // Projects to include
        var projectsQuery = _context.Projects.AsNoTracking();
        if (projectId.HasValue)
        {
            projectsQuery = projectsQuery.Where(p => p.Id == projectId.Value);
        }

        var allDbProjects = await projectsQuery.OrderBy(p => p.Code).ToListAsync();
        var relevantProjectIds = allTasks.Select(t => t.ProjectId).ToHashSet();
        var projects = hasFilters && !projectId.HasValue
            ? allDbProjects.Where(p => relevantProjectIds.Contains(p.Id)).ToList()
            : allDbProjects;

        var dependencies = await _context.TaskDependencies.AsNoTracking().ToListAsync();

        var ganttTasks = new List<GanttTaskDto>();
        var ganttLinks = new List<GanttLinkDto>();

        void AddTaskAndChildren(TaskItem currentTask, string? currentParentId, List<TaskItem> projectTasks)
        {
            var isSubtask = currentTask.ParentId.HasValue;
            var isPhase = projectTasks.Any(child => child.ParentId == currentTask.Id);

            ganttTasks.Add(new GanttTaskDto
            {
                Id = currentTask.Id.ToString(),
                Name = currentTask.Name,
                Start = currentTask.StartDate,
                End = currentTask.PlannedEndDate,
                Progress = currentTask.Progress,
                Type = isPhase ? "phase" : (isSubtask ? "subtask" : "task"),
                ParentId = currentParentId,
                Status = currentTask.Status,
                Priority = currentTask.Priority,
                Dependencies = currentTask.Predecessors.Select(p => p.PredecessorTaskId.ToString()).ToList(),
                AssigneeNames = currentTask.Assignees.Select(a => a.User.FullName).ToList(),
                IsOverdue = currentTask.Status != TaskItemStatus.Completed && now > currentTask.PlannedEndDate.Date,
                ProjectCode = currentTask.Project.Code,
                ProjectName = currentTask.Project.Name,
                RealTaskId = currentTask.Id,
                ProjectId = currentTask.ProjectId
            });

            // Find immediate children of current task
            var children = projectTasks
                .Where(t => t.ParentId == currentTask.Id)
                .OrderBy(t => t.SortOrder)
                .ThenBy(t => t.StartDate)
                .ToList();

            foreach (var child in children)
            {
                AddTaskAndChildren(child, currentTask.Id.ToString(), projectTasks);
            }
        }

        foreach (var p in projects)
        {
            var projectTasks = allTasks.Where(t => t.ProjectId == p.Id).ToList();

            if (!projectId.HasValue)
            {
                // Top-level project row
                ganttTasks.Add(new GanttTaskDto
                {
                    Id = $"prj_{p.Id}",
                    Name = $"[{p.Code}] {p.Name}",
                    Start = p.StartDate,
                    End = p.PlannedEndDate,
                    Progress = p.Progress,
                    Type = "project",
                    ParentId = null,
                    Status = (TaskItemStatus)(int)p.Status,
                    Priority = p.Priority,
                    ProjectCode = p.Code,
                    ProjectName = p.Name,
                    IsOverdue = p.Status != ProjectStatus.Completed && now > p.PlannedEndDate.Date,
                    RealTaskId = p.Id,
                    ProjectId = p.Id
                });

                // Top-level root tasks for this project
                var rootTasks = projectTasks
                    .Where(t => !t.ParentId.HasValue || !allTaskDict.ContainsKey(t.ParentId.Value))
                    .OrderBy(t => t.SortOrder)
                    .ThenBy(t => t.StartDate)
                    .ToList();

                foreach (var rootTask in rootTasks)
                {
                    AddTaskAndChildren(rootTask, $"prj_{p.Id}", projectTasks);
                }
            }
            else
            {
                // Single project view: Top-level root tasks directly
                var rootTasks = projectTasks
                    .Where(t => !t.ParentId.HasValue || !allTaskDict.ContainsKey(t.ParentId.Value))
                    .OrderBy(t => t.SortOrder)
                    .ThenBy(t => t.StartDate)
                    .ToList();

                foreach (var rootTask in rootTasks)
                {
                    AddTaskAndChildren(rootTask, null, projectTasks);
                }
            }
        }

        var includedTaskIds = allTasks.Select(t => t.Id).ToHashSet();
        foreach (var d in dependencies)
        {
            if (includedTaskIds.Contains(d.PredecessorTaskId) && includedTaskIds.Contains(d.SuccessorTaskId))
            {
                ganttLinks.Add(new GanttLinkDto
                {
                    Id = d.Id.ToString(),
                    Source = d.PredecessorTaskId.ToString(),
                    Target = d.SuccessorTaskId.ToString(),
                    Type = ((int)d.DependencyType).ToString()
                });
            }
        }

        return ApiResponse<GanttDataResponse>.Ok(new GanttDataResponse
        {
            Tasks = ganttTasks,
            Links = ganttLinks
        });
    }

    public async Task RecalculateParentTaskProgressAsync(Guid? parentTaskId)
    {
        if (!parentTaskId.HasValue) return;

        var currentParentId = parentTaskId;
        Guid? rootProjectId = null;

        while (currentParentId.HasValue)
        {
            var parent = await _context.Tasks
                .Include(t => t.SubTasks)
                .FirstOrDefaultAsync(t => t.Id == currentParentId.Value);

            if (parent == null || !parent.SubTasks.Any()) break;

            rootProjectId = parent.ProjectId;

            var totalWeight = parent.SubTasks.Sum(st => st.Weight > 0 ? st.Weight : 1.0);
            var weighted = parent.SubTasks.Sum(st => st.Progress * (st.Weight > 0 ? st.Weight : 1.0));
            var progress = totalWeight > 0 ? Math.Round(weighted / totalWeight, 1) : 0;

            parent.Progress = Math.Min(100.0, Math.Max(0.0, progress));

            if (parent.Progress >= 100.0)
            {
                parent.Status = TaskItemStatus.Completed;
                if (!parent.ActualEndDate.HasValue) parent.ActualEndDate = DateTime.UtcNow;
            }
            else if (parent.Progress > 0 && parent.Status == TaskItemStatus.NotStarted)
            {
                parent.Status = TaskItemStatus.InProgress;
            }

            currentParentId = parent.ParentId;
        }

        if (rootProjectId.HasValue)
        {
            var project = await _context.Projects
                .Include(p => p.Tasks)
                .FirstOrDefaultAsync(p => p.Id == rootProjectId.Value);

            if (project != null && project.Tasks.Any())
            {
                var topLevelTasks = project.Tasks.Where(t => t.ParentId == null).ToList();
                if (!topLevelTasks.Any()) topLevelTasks = project.Tasks.ToList();

                var totalWeight = topLevelTasks.Sum(t => t.Weight > 0 ? t.Weight : 1.0);
                var weighted = topLevelTasks.Sum(t => t.Progress * (t.Weight > 0 ? t.Weight : 1.0));
                var progress = totalWeight > 0 ? Math.Round(weighted / totalWeight, 1) : 0;

                project.Progress = Math.Min(100.0, Math.Max(0.0, progress));

                if (project.Progress >= 100.0)
                {
                    project.Status = ProjectStatus.Completed;
                    if (!project.ActualEndDate.HasValue) project.ActualEndDate = DateTime.UtcNow;
                }
                else if (project.Progress > 0)
                {
                    project.Status = DateTime.UtcNow.Date > project.PlannedEndDate.Date ? ProjectStatus.Overdue : ProjectStatus.InProgress;
                }
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task RecalculateProjectProgressInternalAsync(Guid projectId)
    {
        var project = await _context.Projects
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null || !project.Tasks.Any()) return;

        var topLevelTasks = project.Tasks.Where(t => t.ParentId == null).ToList();
        if (!topLevelTasks.Any()) topLevelTasks = project.Tasks.ToList();

        var totalWeight = topLevelTasks.Sum(t => t.Weight > 0 ? t.Weight : 1.0);
        var weighted = topLevelTasks.Sum(t => t.Progress * (t.Weight > 0 ? t.Weight : 1.0));
        var progress = totalWeight > 0 ? Math.Round(weighted / totalWeight, 1) : 0;

        project.Progress = Math.Min(100.0, Math.Max(0.0, progress));

        if (project.Progress >= 100.0)
        {
            project.Status = ProjectStatus.Completed;
            if (!project.ActualEndDate.HasValue) project.ActualEndDate = DateTime.UtcNow;
        }
        else if (project.Progress > 0)
        {
            project.Status = DateTime.UtcNow.Date > project.PlannedEndDate.Date ? ProjectStatus.Overdue : ProjectStatus.InProgress;
        }

        await _context.SaveChangesAsync();
    }
}
