using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

public class TaskItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid? ParentId { get; set; }
    public TaskItem? Parent { get; set; }
    public ICollection<TaskItem> SubTasks { get; set; } = new List<TaskItem>();

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public TaskItemStatus Status { get; set; } = TaskItemStatus.NotStarted;
    public PriorityLevel Priority { get; set; } = PriorityLevel.Medium;

    public DateTime StartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public DateTime? ActualEndDate { get; set; }

    public double Progress { get; set; } = 0.0; // 0 - 100%
    public double Weight { get; set; } = 1.0;   // Weight for weighted progress calculation
    public int SortOrder { get; set; } = 0;

    public Guid? CreatedById { get; set; }
    public User? CreatedBy { get; set; }

    public Guid? UpdatedById { get; set; }
    public User? UpdatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<TaskAssignee> Assignees { get; set; } = new List<TaskAssignee>();
    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
    public ICollection<TaskDependency> Predecessors { get; set; } = new List<TaskDependency>(); // Tasks that this task depends on
    public ICollection<TaskDependency> Successors { get; set; } = new List<TaskDependency>();   // Tasks that depend on this task
    public ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
}
