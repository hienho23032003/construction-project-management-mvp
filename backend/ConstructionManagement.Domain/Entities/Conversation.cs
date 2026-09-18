using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

public class Conversation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? Title { get; set; }
    public ConversationType Type { get; set; } = ConversationType.Direct;
    public string? AvatarUrl { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid CreatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastMessageAt { get; set; }
    public Guid? LastMessageId { get; set; }

    // Navigation properties
    public Project? Project { get; set; }
    public User CreatedBy { get; set; } = null!;
    public ChatMessage? LastMessage { get; set; }
    public ICollection<ConversationMember> Members { get; set; } = new List<ConversationMember>();
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
