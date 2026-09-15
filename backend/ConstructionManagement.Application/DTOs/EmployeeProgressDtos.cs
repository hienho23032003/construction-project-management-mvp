using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

public class EmployeeProgressDetailDto
{
    public UserDto User { get; set; } = null!;
    public EmployeeKpiStatsDto Stats { get; set; } = new();
    public List<EmployeeProjectParticipationDto> Projects { get; set; } = new();
    public List<EmployeeTaskItemDto> Tasks { get; set; } = new();
    public List<EmployeeActivityLogDto> RecentActivities { get; set; } = new();
}

public class EmployeeKpiStatsDto
{
    public int TotalProjects { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int NotStartedTasks { get; set; }
    public int OverdueTasks { get; set; }
    public double AverageTaskProgress { get; set; }
    public double OnTimeCompletionRate { get; set; }
}

public class EmployeeProjectParticipationDto
{
    public Guid ProjectId { get; set; }
    public string ProjectCode { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public string? ProjectLocation { get; set; }
    public ProjectStatus ProjectStatus { get; set; }
    public double ProjectProgress { get; set; }
    public string? RoleInProject { get; set; }
    public DateTime? JoinedAt { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int OverdueTasks { get; set; }
    public double AverageProgress { get; set; }
}

public class EmployeeTaskItemDto
{
    public Guid TaskId { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectCode { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public TaskItemStatus Status { get; set; }
    public PriorityLevel Priority { get; set; }
    public double Progress { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public bool IsOverdue { get; set; }
    public int DaysRemaining { get; set; }
    public DateTime AssignedAt { get; set; }
}

public class EmployeeActivityLogDto
{
    public Guid Id { get; set; }
    public ActivityAction Action { get; set; }
    public string? Details { get; set; }
    public string? ProjectName { get; set; }
    public string? TaskName { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime CreatedAt { get; set; }
}
