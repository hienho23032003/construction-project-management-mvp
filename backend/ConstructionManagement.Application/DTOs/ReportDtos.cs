using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

public class ReportFilterRequest
{
    public Guid? ProjectId { get; set; }
    public Guid? UserId { get; set; }
    public TaskItemStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

public class ReportAssigneeDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Email { get; set; }
}

public class ProjectProgressReportDto
{
    public Guid ProjectId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ManagerName { get; set; }
    public List<string> ManagerNames { get; set; } = new();
    public List<ProjectManagerUserDto> Managers { get; set; } = new();
    public DateTime StartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public double Progress { get; set; }
    public ProjectStatus Status { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int OverdueTasks { get; set; }
    public bool IsOverdue { get; set; }
}

public class TaskReportDto
{
    public Guid TaskId { get; set; }
    public string TaskName { get; set; } = string.Empty;
    public string ProjectCode { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public string? AssigneeNames { get; set; }
    public List<ReportAssigneeDto> Assignees { get; set; } = new();
    public TaskItemStatus Status { get; set; }
    public double Progress { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public bool IsOverdue { get; set; }
}

public class OverdueReportDto
{
    public Guid TaskId { get; set; }
    public string TaskName { get; set; } = string.Empty;
    public string ProjectCode { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public string? AssigneeNames { get; set; }
    public List<ReportAssigneeDto> Assignees { get; set; } = new();
    public DateTime PlannedEndDate { get; set; }
    public int OverdueDays { get; set; }
    public double Progress { get; set; }
    public TaskItemStatus Status { get; set; }
}

public class EmployeeWorkloadReportDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Department { get; set; }
    public string Email { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int ActiveTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OverdueTasks { get; set; }
    public double AverageProgress { get; set; }
}
