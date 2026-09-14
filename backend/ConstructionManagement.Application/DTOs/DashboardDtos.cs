using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

public class DashboardSummaryDto
{
    // KPI Cards
    public int TotalProjects { get; set; }
    public int InProgressProjects { get; set; }
    public int CompletedProjects { get; set; }
    public int OverdueProjects { get; set; }

    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int OverdueTasks { get; set; }

    // Widgets
    public List<ProjectProgressSummaryDto> ProjectProgressList { get; set; } = new List<ProjectProgressSummaryDto>();
    public List<TaskStatusDistributionDto> TaskStatusDistribution { get; set; } = new List<TaskStatusDistributionDto>();
    public List<OverdueTaskDto> CriticalOverdueTasks { get; set; } = new List<OverdueTaskDto>();
    public List<UpcomingDeadlineDto> UpcomingDeadlines { get; set; } = new List<UpcomingDeadlineDto>();
    public List<EmployeeWorkloadSummaryDto> EmployeeWorkloadList { get; set; } = new List<EmployeeWorkloadSummaryDto>();
    public List<ActivityLogDto> RecentActivities { get; set; } = new List<ActivityLogDto>();
}

public class ProjectProgressSummaryDto
{
    public Guid ProjectId { get; set; }
    public string ProjectCode { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public double Progress { get; set; }
    public ProjectStatus Status { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
}

public class TaskStatusDistributionDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class OverdueTaskDto
{
    public Guid TaskId { get; set; }
    public string TaskName { get; set; } = string.Empty;
    public Guid ProjectId { get; set; }
    public string ProjectCode { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public DateTime PlannedEndDate { get; set; }
    public int OverdueDays { get; set; }
    public double Progress { get; set; }
    public List<string> AssigneeNames { get; set; } = new List<string>();
}

public class UpcomingDeadlineDto
{
    public Guid TaskId { get; set; }
    public string TaskName { get; set; } = string.Empty;
    public string ProjectCode { get; set; } = string.Empty;
    public DateTime PlannedEndDate { get; set; }
    public int DaysRemaining { get; set; }
    public double Progress { get; set; }
    public List<string> AssigneeNames { get; set; } = new List<string>();
}

public class EmployeeWorkloadSummaryDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Department { get; set; }
    public int ActiveTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int TotalTasks => ActiveTasks + CompletedTasks + OverdueTasks;
}
