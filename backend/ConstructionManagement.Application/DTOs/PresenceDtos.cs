namespace ConstructionManagement.Application.DTOs;

public class PresenceHeartbeatRequest
{
    public Guid? ProjectId { get; set; }
    public Guid? TaskId { get; set; }
    public string? TaskName { get; set; }
    public bool IsEditing { get; set; }
    public string? AvatarUrl { get; set; }
}

public class UserPresenceDto
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserAvatarUrl { get; set; }
    public string? UserRole { get; set; }
    public string? UserDepartment { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? EditingTaskId { get; set; }
    public string? EditingTaskName { get; set; }
    public bool IsEditing { get; set; }
    public DateTime LastHeartbeat { get; set; }
}

public class ProjectPresenceDto
{
    public Guid ProjectId { get; set; }
    public List<UserPresenceDto> ActiveUsers { get; set; } = new();
    public List<TaskActiveEditorDto> ActiveEditors { get; set; } = new();
}

public class TaskActiveEditorDto
{
    public Guid TaskId { get; set; }
    public string? TaskName { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserAvatarUrl { get; set; }
    public DateTime EditingSince { get; set; }
}
