namespace ConstructionManagement.Domain.Entities;

public class TaskCommentAttachment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CommentId { get; set; }
    public TaskComment Comment { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? ContentType { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
