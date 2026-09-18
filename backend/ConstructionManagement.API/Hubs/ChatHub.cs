using System.Security.Claims;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ConstructionManagement.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatService _chatService;
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(IChatService chatService, ILogger<ChatHub> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }

    private Guid GetCurrentUserId()
    {
        var claim = Context.User?.FindFirst(ClaimTypes.NameIdentifier) ?? Context.User?.FindFirst("sub") ?? Context.User?.FindFirst("id");
        if (claim != null && Guid.TryParse(claim.Value, out var userId))
        {
            return userId;
        }
        throw new HubException("Không xác định được danh tính người dùng.");
    }

    public async Task JoinConversation(string conversationId)
    {
        if (string.IsNullOrWhiteSpace(conversationId)) return;
        await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
    }

    public async Task LeaveConversation(string conversationId)
    {
        if (string.IsNullOrWhiteSpace(conversationId)) return;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
    }

    public async Task<ChatMessageDto> SendMessage(SendMessageRequest request)
    {
        var currentUserId = GetCurrentUserId();
        var messageDto = await _chatService.SendMessageAsync(currentUserId, request);

        // Ensure sender connection is in conversation group
        await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation_{request.ConversationId}");

        // Broadcast to everyone in the conversation group (all tabs in the conversation)
        await Clients.Group($"conversation_{request.ConversationId}").SendAsync("ReceiveMessage", messageDto);

        // Also broadcast a ConversationUpdated event and direct ReceiveMessage to each member
        var convDto = await _chatService.GetConversationByIdAsync(request.ConversationId, currentUserId);
        if (convDto != null)
        {
            foreach (var member in convDto.Members)
            {
                // Send directly to user's personal connection so they get real-time update even if not in group yet
                await Clients.User(member.UserId.ToString()).SendAsync("ReceiveMessage", messageDto);
                await Clients.User(member.UserId.ToString()).SendAsync("ConversationUpdated", convDto);
            }
        }

        return messageDto;
    }

    public async Task SendTyping(Guid conversationId, bool isTyping)
    {
        var currentUserId = GetCurrentUserId();
        var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Người dùng";

        var payload = new TypingNotificationDto
        {
            ConversationId = conversationId,
            UserId = currentUserId,
            FullName = userName,
            IsTyping = isTyping
        };

        await Clients.OthersInGroup($"conversation_{conversationId}").SendAsync("UserTyping", payload);
    }

    public async Task MarkAsRead(Guid conversationId, Guid lastMessageId)
    {
        var currentUserId = GetCurrentUserId();
        var success = await _chatService.MarkAsReadAsync(conversationId, currentUserId, lastMessageId);
        if (success)
        {
            var payload = new ReadReceiptDto
            {
                ConversationId = conversationId,
                UserId = currentUserId,
                LastReadMessageId = lastMessageId,
                LastReadAt = DateTime.UtcNow
            };
            await Clients.OthersInGroup($"conversation_{conversationId}").SendAsync("MessageRead", payload);
        }
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetCurrentUserId();
        // Add connection to a personal group for user-specific broadcasts
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
