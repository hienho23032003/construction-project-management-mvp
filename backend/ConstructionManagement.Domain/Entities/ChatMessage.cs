using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

public class ChatMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
    public ChatMessageType Type { get; set; } = ChatMessageType.Text;
    public Guid? ReplyToMessageId { get; set; }
    public bool IsEdited { get; set; } = false;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Conversation Conversation { get; set; } = null!;
    public User Sender { get; set; } = null!;
    public ChatMessage? ReplyToMessage { get; set; }
    public ICollection<ChatMessageAttachment> Attachments { get; set; } = new List<ChatMessageAttachment>();
    public ICollection<ChatMessageMention> Mentions { get; set; } = new List<ChatMessageMention>();
}
