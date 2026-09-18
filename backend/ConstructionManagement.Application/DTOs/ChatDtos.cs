using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

public class ConversationDto
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public ConversationType Type { get; set; }
    public string? AvatarUrl { get; set; }
    public Guid? ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public string? ProjectCode { get; set; }
    public Guid CreatedById { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public ChatMessageDto? LastMessage { get; set; }
    public int UnreadCount { get; set; }
    public bool IsMuted { get; set; }
    public List<ConversationMemberDto> Members { get; set; } = new();
}

public class ConversationMemberDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? RoleName { get; set; }
    public MemberRole Role { get; set; }
    public bool IsOnline { get; set; }
    public DateTime? LastReadAt { get; set; }
    public Guid? LastReadMessageId { get; set; }
    public DateTime JoinedAt { get; set; }
}

public class ChatMessageDto
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string? SenderAvatarUrl { get; set; }
    public string? SenderEmail { get; set; }
    public string Content { get; set; } = string.Empty;
    public ChatMessageType Type { get; set; }
    public Guid? ReplyToMessageId { get; set; }
    public ChatMessageDto? ReplyToMessage { get; set; }
    public bool IsEdited { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ChatMessageAttachmentDto> Attachments { get; set; } = new();
    public List<ChatMessageMentionDto> Mentions { get; set; } = new();
}

public class ChatMessageAttachmentDto
{
    public Guid Id { get; set; }
    public Guid MessageId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? FileType { get; set; }
    public long FileSize { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ChatMessageMentionDto
{
    public Guid Id { get; set; }
    public ChatMentionType MentionType { get; set; }
    public Guid TargetId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    // Optional enriched fields
    public string? TargetCode { get; set; }
    public string? TargetStatus { get; set; }
    public string? TargetPriority { get; set; }
}

public class CreateDirectChatRequest
{
    public Guid TargetUserId { get; set; }
}

public class CreateGroupChatRequest
{
    public string Title { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public Guid? ProjectId { get; set; }
    public List<Guid> MemberIds { get; set; } = new();
}

public class SendMessageRequest
{
    public Guid ConversationId { get; set; }
    public string? Content { get; set; }
    public ChatMessageType Type { get; set; } = ChatMessageType.Text;
    public Guid? ReplyToMessageId { get; set; }
    public List<SendMessageAttachmentInput>? Attachments { get; set; }
    public List<SendMessageMentionInput>? Mentions { get; set; }
}

public class SendMessageAttachmentInput
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? FileType { get; set; }
    public long FileSize { get; set; }
    public string? ThumbnailUrl { get; set; }
}

public class SendMessageMentionInput
{
    public ChatMentionType MentionType { get; set; }
    public Guid TargetId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
}

public class CursorPagedMessagesDto
{
    public List<ChatMessageDto> Items { get; set; } = new();
    public bool HasMore { get; set; }
    public Guid? NextCursorId { get; set; }
    public int TotalCount { get; set; }
}

public class ChatMediaItemDto
{
    public Guid Id { get; set; }
    public Guid MessageId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? FileType { get; set; }
    public long FileSize { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
}

public class TypingNotificationDto
{
    public Guid ConversationId { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public bool IsTyping { get; set; }
}

public class ReadReceiptDto
{
    public Guid ConversationId { get; set; }
    public Guid UserId { get; set; }
    public Guid LastReadMessageId { get; set; }
    public DateTime LastReadAt { get; set; }
}
