namespace ConstructionManagement.Domain.Entities;

public class TaskChecklistItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; } = false;
    public int SortOrder { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
