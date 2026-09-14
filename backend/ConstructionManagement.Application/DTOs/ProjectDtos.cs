using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

public class ProjectDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public Guid? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public ProjectStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public double Progress { get; set; }
    public PriorityLevel Priority { get; set; }
    public string PriorityName => Priority.ToString();
    public int TaskCount { get; set; }
    public int CompletedTaskCount { get; set; }
    public int OverdueTaskCount { get; set; }
    public int MemberCount { get; set; }
    public bool IsOverdue => Status != ProjectStatus.Completed && DateTime.UtcNow.Date > PlannedEndDate.Date;
    public DateTime CreatedAt { get; set; }
}

public class ProjectDetailDto : ProjectDto
{
    public List<ProjectMemberDto> Members { get; set; } = new List<ProjectMemberDto>();
    public List<TaskDto> Tasks { get; set; } = new List<TaskDto>();
    public List<ActivityLogDto> RecentActivities { get; set; } = new List<ActivityLogDto>();
}

public class CreateProjectRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public Guid? ManagerId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public PriorityLevel Priority { get; set; } = PriorityLevel.Medium;
    public List<Guid>? MemberUserIds { get; set; }
}

public class UpdateProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public Guid? ManagerId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public ProjectStatus Status { get; set; }
    public PriorityLevel Priority { get; set; }
}

public class ProjectMemberDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? RoleInProject { get; set; }
    public DateTime JoinedAt { get; set; }
}

public class AddProjectMemberRequest
{
    public Guid UserId { get; set; }
    public string? RoleInProject { get; set; }
}
