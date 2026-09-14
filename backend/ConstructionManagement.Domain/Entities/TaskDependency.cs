using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

public class TaskDependency
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PredecessorTaskId { get; set; }
    public TaskItem PredecessorTask { get; set; } = null!;

    public Guid SuccessorTaskId { get; set; }
    public TaskItem SuccessorTask { get; set; } = null!;

    public DependencyType DependencyType { get; set; } = DependencyType.FinishToStart;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
