using ConstructionManagement.API.Hubs;
using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ConstructionManagement.API.Controllers;

[Authorize]
public class ChatController : BaseApiController
{
    private readonly IChatService _chatService;
    private readonly IFileStorageService _fileStorageService;
    private readonly IHubContext<ChatHub> _hubContext;

    public ChatController(
        IChatService chatService,
        IFileStorageService fileStorageService,
        IHubContext<ChatHub> hubContext)
    {
        _chatService = chatService;
        _fileStorageService = fileStorageService;
        _hubContext = hubContext;
    }

    /// <summary>
    /// Lấy danh sách các cuộc trò chuyện của người dùng hiện tại
    /// </summary>
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var conversations = await _chatService.GetUserConversationsAsync(CurrentUserId);
        return Ok(ApiResponse<List<ConversationDto>>.Ok(conversations));
    }

    /// <summary>
    /// Lấy chi tiết cuộc trò chuyện theo ID
    /// </summary>
    [HttpGet("conversations/{id:guid}")]
    public async Task<IActionResult> GetConversationById(Guid id)
    {
        var conversation = await _chatService.GetConversationByIdAsync(id, CurrentUserId);
        if (conversation == null)
        {
            return NotFound(ApiResponse<string>.Fail("Không tìm thấy cuộc trò chuyện hoặc bạn không có quyền truy cập."));
        }
        return Ok(ApiResponse<ConversationDto>.Ok(conversation));
    }

    /// <summary>
    /// Tạo hoặc lấy cuộc trò chuyện trực tiếp 1-1
    /// </summary>
    [HttpPost("conversations/direct")]
    public async Task<IActionResult> GetOrCreateDirectConversation([FromBody] CreateDirectChatRequest request)
    {
        try
        {
            var conversation = await _chatService.GetOrCreateDirectConversationAsync(CurrentUserId, request.TargetUserId);
            return Ok(ApiResponse<ConversationDto>.Ok(conversation));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Tạo nhóm trò chuyện mới
    /// </summary>
    [HttpPost("conversations/group")]
    public async Task<IActionResult> CreateGroupConversation([FromBody] CreateGroupChatRequest request)
    {
        try
        {
            var conversation = await _chatService.CreateGroupConversationAsync(CurrentUserId, request);
            return Ok(ApiResponse<ConversationDto>.Ok(conversation));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Tạo hoặc lấy nhóm trò chuyện gắn liền với Dự án
    /// </summary>
    [HttpPost("conversations/project/{projectId:guid}")]
    public async Task<IActionResult> CreateProjectConversation(Guid projectId)
    {
        try
        {
            var conversation = await _chatService.CreateProjectConversationAsync(CurrentUserId, projectId);
            return Ok(ApiResponse<ConversationDto>.Ok(conversation));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Lấy danh sách tin nhắn cũ hơn dạng cursor pagination (phục vụ scroll ngược)
    /// </summary>
    [HttpGet("conversations/{id:guid}/messages")]
    public async Task<IActionResult> GetMessages(Guid id, [FromQuery] Guid? beforeId = null, [FromQuery] int limit = 30)
    {
        try
        {
            var result = await _chatService.GetMessagesPagedAsync(id, CurrentUserId, beforeId, limit);
            return Ok(ApiResponse<CursorPagedMessagesDto>.Ok(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Gửi tin nhắn qua REST API
    /// </summary>
    [HttpPost("conversations/{id:guid}/messages")]
    public async Task<IActionResult> SendMessage(Guid id, [FromBody] SendMessageRequest request)
    {
        try
        {
            request.ConversationId = id;
            var message = await _chatService.SendMessageAsync(CurrentUserId, request);

            // Broadcast via SignalR to group
            await _hubContext.Clients.Group($"conversation_{id}").SendAsync("ReceiveMessage", message);

            // Also broadcast directly to all members
            var convDto = await _chatService.GetConversationByIdAsync(id, CurrentUserId);
            if (convDto != null)
            {
                foreach (var member in convDto.Members)
                {
                    await _hubContext.Clients.User(member.UserId.ToString()).SendAsync("ReceiveMessage", message);
                    await _hubContext.Clients.User(member.UserId.ToString()).SendAsync("ConversationUpdated", convDto);
                }
            }

            return Ok(ApiResponse<ChatMessageDto>.Ok(message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Đánh dấu đã đọc tin nhắn
    /// </summary>
    [HttpPost("conversations/{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, [FromBody] Guid lastMessageId)
    {
        var success = await _chatService.MarkAsReadAsync(id, CurrentUserId, lastMessageId);
        return Ok(ApiResponse<bool>.Ok(success));
    }

    /// <summary>
    /// Lấy toàn bộ ảnh / video / tài liệu của cuộc trò chuyện (Media Hub)
    /// </summary>
    [HttpGet("conversations/{id:guid}/media")]
    public async Task<IActionResult> GetConversationMedia(Guid id, [FromQuery] string? type = null)
    {
        try
        {
            var media = await _chatService.GetConversationMediaAsync(id, CurrentUserId, type);
            return Ok(ApiResponse<List<ChatMediaItemDto>>.Ok(media));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Upload file / ảnh đính kèm cho tin nhắn
    /// </summary>
    [HttpPost("conversations/{id:guid}/attachments")]
    public async Task<IActionResult> UploadAttachments(Guid id, [FromForm] List<IFormFile> files)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(ApiResponse<string>.Fail("Vui lòng chọn ít nhất 1 file để tải lên."));
        }

        var uploadedFiles = new List<SendMessageAttachmentInput>();

        foreach (var file in files)
        {
            if (file.Length > 0)
            {
                var stored = await _fileStorageService.SaveFileAsync(file, "chat_attachments");
                var isImage = file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);

                uploadedFiles.Add(new SendMessageAttachmentInput
                {
                    FileName = stored.FileName,
                    FilePath = stored.FilePath,
                    FileType = stored.ContentType ?? file.ContentType,
                    FileSize = stored.FileSize,
                    ThumbnailUrl = isImage ? stored.FilePath : null
                });
            }
        }

        return Ok(ApiResponse<List<SendMessageAttachmentInput>>.Ok(uploadedFiles));
    }
}
