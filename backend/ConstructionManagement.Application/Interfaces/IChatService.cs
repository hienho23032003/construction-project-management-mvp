using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IChatService
{
    Task<List<ConversationDto>> GetUserConversationsAsync(Guid currentUserId);
    Task<ConversationDto?> GetConversationByIdAsync(Guid conversationId, Guid currentUserId);
    Task<ConversationDto> GetOrCreateDirectConversationAsync(Guid currentUserId, Guid targetUserId);
    Task<ConversationDto> CreateGroupConversationAsync(Guid currentUserId, CreateGroupChatRequest request);
    Task<ConversationDto> CreateProjectConversationAsync(Guid currentUserId, Guid projectId);
    Task<CursorPagedMessagesDto> GetMessagesPagedAsync(Guid conversationId, Guid currentUserId, Guid? beforeId, int limit = 30);
    Task<ChatMessageDto> SendMessageAsync(Guid currentUserId, SendMessageRequest request);
    Task<bool> MarkAsReadAsync(Guid conversationId, Guid currentUserId, Guid lastMessageId);
    Task<List<ChatMediaItemDto>> GetConversationMediaAsync(Guid conversationId, Guid currentUserId, string? type = null);
    Task<bool> AddMembersToGroupAsync(Guid conversationId, Guid currentUserId, List<Guid> newMemberIds);
    Task<bool> RemoveMemberFromGroupAsync(Guid conversationId, Guid currentUserId, Guid memberId);
    Task<bool> LeaveGroupAsync(Guid conversationId, Guid currentUserId);
}
