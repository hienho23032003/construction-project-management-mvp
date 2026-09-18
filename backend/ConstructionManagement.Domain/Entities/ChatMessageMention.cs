using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

public class ChatMessageMention
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MessageId { get; set; }
    public ChatMentionType MentionType { get; set; }
    public Guid TargetId { get; set; }
    public string DisplayName { get; set; } = string.Empty;

    // Navigation properties
    public ChatMessage Message { get; set; } = null!;
}
