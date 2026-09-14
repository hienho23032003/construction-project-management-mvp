using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty; // e.g. CV5, CV3, PRJ-2026
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    
    public Guid? ManagerId { get; set; }
    public User? Manager { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public DateTime? ActualEndDate { get; set; }

    public ProjectStatus Status { get; set; } = ProjectStatus.NotStarted;
    public double Progress { get; set; } = 0.0; // 0 - 100%
    public PriorityLevel Priority { get; set; } = PriorityLevel.Medium;

    public Guid? CreatedById { get; set; }
    public User? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    public ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
}
