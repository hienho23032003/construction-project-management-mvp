using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

public class GanttTaskDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public double Progress { get; set; }
    public string Type { get; set; } = "task"; // "project", "phase", "task", "milestone"
    public string? ParentId { get; set; }
    public TaskItemStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public PriorityLevel Priority { get; set; }
    public string PriorityName => Priority.ToString();
    public List<string> Dependencies { get; set; } = new List<string>();
    public List<string> AssigneeNames { get; set; } = new List<string>();
    public bool IsOverdue { get; set; }
    public bool HideChildren { get; set; } = false;
    public string? ProjectCode { get; set; }
    public string? ProjectName { get; set; }
    public Guid RealTaskId { get; set; }
    public Guid ProjectId { get; set; }
}

public class GanttLinkDto
{
    public string Id { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty; // Predecessor
    public string Target { get; set; } = string.Empty; // Successor
    public string Type { get; set; } = "0"; // FinishToStart
}

public class GanttDataResponse
{
    public List<GanttTaskDto> Tasks { get; set; } = new List<GanttTaskDto>();
    public List<GanttLinkDto> Links { get; set; } = new List<GanttLinkDto>();
}
