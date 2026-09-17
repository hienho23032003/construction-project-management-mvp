using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

public class TaskDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectCode { get; set; } = string.Empty;

    public Guid? ParentId { get; set; }
    public string? ParentName { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public TaskItemStatus Status { get; set; }
    public string StatusName => Status.ToString();

    public PriorityLevel Priority { get; set; }
    public string PriorityName => Priority.ToString();

    public DateTime StartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public DateTime? ActualEndDate { get; set; }

    public double Progress { get; set; }
    public double Weight { get; set; }
    public int SortOrder { get; set; }
    public int Level { get; set; } // Hierarchy depth (0 for root task/phase, 1 for subtask, etc.)

    public bool IsOverdue => Status != TaskItemStatus.Completed && DateTime.UtcNow.Date > PlannedEndDate.Date;
    public int OverdueDays => IsOverdue ? (int)(DateTime.UtcNow.Date - PlannedEndDate.Date).TotalDays : 0;
    public bool IsCompletedLate => Status == TaskItemStatus.Completed && ActualEndDate.HasValue && ActualEndDate.Value.Date > PlannedEndDate.Date;
    public int CompletedLateDays => IsCompletedLate && ActualEndDate.HasValue ? (int)(ActualEndDate.Value.Date - PlannedEndDate.Date).TotalDays : 0;

    public List<TaskAssigneeDto> Assignees { get; set; } = new List<TaskAssigneeDto>();
    public List<TaskDependencyDto> Dependencies { get; set; } = new List<TaskDependencyDto>();
    public List<TaskChecklistItemDto> ChecklistItems { get; set; } = new List<TaskChecklistItemDto>();
    public int ChecklistTotalCount { get; set; }
    public int ChecklistCompletedCount { get; set; }
    public int SubTaskCount { get; set; }
    public int CommentCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TaskTreeDto : TaskDto
{
    public List<TaskTreeDto> Children { get; set; } = new List<TaskTreeDto>();
}

public class CreateTaskRequest
{
    public Guid ProjectId { get; set; }
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskItemStatus Status { get; set; } = TaskItemStatus.NotStarted;
    public PriorityLevel Priority { get; set; } = PriorityLevel.Medium;
    public DateTime StartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public double Progress { get; set; } = 0.0;
    public double Weight { get; set; } = 1.0;
    public int SortOrder { get; set; } = 0;
    public List<Guid>? AssigneeUserIds { get; set; }
    public List<Guid>? AssigneeIds { get; set; }
}

public class UpdateTaskRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public TaskItemStatus? Status { get; set; }
    public PriorityLevel? Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? PlannedEndDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public double? Progress { get; set; }
    public double? Weight { get; set; }
    public int? SortOrder { get; set; }
    public Guid? ParentId { get; set; }
    public List<Guid>? AssigneeUserIds { get; set; }
    public List<Guid>? AssigneeIds { get; set; }
}

public class UpdateTaskStatusRequest
{
    public TaskItemStatus Status { get; set; }
    public DateTime? ActualEndDate { get; set; }
}

public class UpdateTaskProgressRequest
{
    public double Progress { get; set; } // 0 - 100
}

public class UpdateTaskDatesRequest
{
    public DateTime StartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
}

public class UpdateTaskPriorityRequest
{
    public PriorityLevel Priority { get; set; }
}

public class TaskAssigneeDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime AssignedAt { get; set; }
}

public class TaskCommentAttachmentDto
{
    public Guid Id { get; set; }
    public Guid CommentId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? ContentType { get; set; }
    public DateTime UploadedAt { get; set; }
}

public class TaskCommentDto
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserDepartment { get; set; }
    public string? UserAvatarUrl { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<TaskCommentAttachmentDto> Attachments { get; set; } = new();
}

public class CreateCommentRequest
{
    public string? Content { get; set; } = string.Empty;
}

public class CreateCommentWithFilesRequest
{
    public string? Content { get; set; }
    public List<Microsoft.AspNetCore.Http.IFormFile>? Files { get; set; }
}

public class TaskDependencyDto
{
    public Guid Id { get; set; }
    public Guid PredecessorTaskId { get; set; }
    public string PredecessorTaskName { get; set; } = string.Empty;
    public Guid SuccessorTaskId { get; set; }
    public string SuccessorTaskName { get; set; } = string.Empty;
    public DependencyType DependencyType { get; set; }
}

public class CreateDependencyRequest
{
    public Guid PredecessorTaskId { get; set; }
    public Guid SuccessorTaskId { get; set; }
    public DependencyType DependencyType { get; set; } = DependencyType.FinishToStart;
}

public class TaskChecklistItemDto
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class CreateChecklistItemRequest
{
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; } = false;
    public int SortOrder { get; set; } = 0;
}

public class UpdateChecklistItemRequest
{
    public string? Title { get; set; }
    public bool? IsCompleted { get; set; }
    public int? SortOrder { get; set; }
}

public class BatchChecklistRequest
{
    public List<CreateChecklistItemRequest> Items { get; set; } = new();
}

