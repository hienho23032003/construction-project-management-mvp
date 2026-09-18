using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Application.Services;

public class ChatService : IChatService
{
    private readonly IAppDbContext _context;
    private readonly IPresenceService _presenceService;

    public ChatService(IAppDbContext context, IPresenceService presenceService)
    {
        _context = context;
        _presenceService = presenceService;
    }

    public async Task<List<ConversationDto>> GetUserConversationsAsync(Guid currentUserId)
    {
        var userMemberships = await _context.ConversationMembers
            .AsNoTracking()
            .Where(cm => cm.UserId == currentUserId)
            .ToListAsync();

        if (userMemberships.Count == 0)
        {
            return new List<ConversationDto>();
        }

        var membershipDict = userMemberships.ToDictionary(m => m.ConversationId);
        var conversationIds = userMemberships.Select(m => m.ConversationId).ToList();

        var conversations = await _context.Conversations
            .AsNoTracking()
            .Where(c => conversationIds.Contains(c.Id))
            .Include(c => c.Project)
            .Include(c => c.Members)
                .ThenInclude(m => m.User)
            .Include(c => c.LastMessage)
                .ThenInclude(m => m!.Sender)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync();

        var result = new List<ConversationDto>();

        foreach (var conv in conversations)
        {
            membershipDict.TryGetValue(conv.Id, out var cm);
            var lastReadAt = cm?.LastReadAt ?? cm?.JoinedAt ?? DateTime.MinValue;

            // Calculate unread count
            var unreadCount = await _context.ChatMessages
                .AsNoTracking()
                .CountAsync(m => m.ConversationId == conv.Id && m.SenderId != currentUserId && m.CreatedAt > lastReadAt);

            var membersDto = conv.Members.Select(m => new ConversationMemberDto
            {
                UserId = m.UserId,
                FullName = m.User?.FullName ?? "Unknown",
                Email = m.User?.Email ?? string.Empty,
                AvatarUrl = m.User?.AvatarUrl,
                RoleName = m.User?.Role.ToString(),
                Role = m.Role,
                IsOnline = _presenceService.IsUserOnline(m.UserId),
                LastReadAt = m.LastReadAt,
                LastReadMessageId = m.LastReadMessageId,
                JoinedAt = m.JoinedAt
            }).ToList();

            // Set Title & Avatar for Direct Chat
            var title = conv.Title;
            var avatarUrl = conv.AvatarUrl;

            if (conv.Type == ConversationType.Direct)
            {
                var otherMember = conv.Members.FirstOrDefault(m => m.UserId != currentUserId)?.User;
                if (otherMember != null)
                {
                    title = otherMember.FullName;
                    avatarUrl = otherMember.AvatarUrl;
                }
            }
            else if (conv.Type == ConversationType.ProjectBound && conv.Project != null)
            {
                title ??= $"[Dự án] {conv.Project.Name}";
            }

            result.Add(new ConversationDto
            {
                Id = conv.Id,
                Title = title,
                Type = conv.Type,
                AvatarUrl = avatarUrl,
                ProjectId = conv.ProjectId,
                ProjectName = conv.Project?.Name,
                ProjectCode = conv.Project?.Code,
                CreatedById = conv.CreatedById,
                CreatedAt = conv.CreatedAt,
                LastMessageAt = conv.LastMessageAt,
                UnreadCount = unreadCount,
                IsMuted = cm?.IsMuted ?? false,
                Members = membersDto,
                LastMessage = conv.LastMessage != null ? new ChatMessageDto
                {
                    Id = conv.LastMessage.Id,
                    ConversationId = conv.Id,
                    SenderId = conv.LastMessage.SenderId,
                    SenderName = conv.LastMessage.Sender?.FullName ?? "Unknown",
                    Content = conv.LastMessage.Content,
                    Type = conv.LastMessage.Type,
                    CreatedAt = conv.LastMessage.CreatedAt
                } : null
            });
        }

        return result;
    }

    public async Task<ConversationDto?> GetConversationByIdAsync(Guid conversationId, Guid currentUserId)
    {
        var member = await _context.ConversationMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(cm => cm.ConversationId == conversationId && cm.UserId == currentUserId);

        if (member == null) return null;

        var conv = await _context.Conversations
            .AsNoTracking()
            .Include(c => c.Project)
            .Include(c => c.Members)
                .ThenInclude(m => m.User)
            .Include(c => c.LastMessage)
                .ThenInclude(m => m!.Sender)
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conv == null) return null;

        var unreadCount = await _context.ChatMessages
            .AsNoTracking()
            .CountAsync(m => m.ConversationId == conv.Id && m.SenderId != currentUserId && m.CreatedAt > (member.LastReadAt ?? member.JoinedAt));

        var title = conv.Title;
        var avatarUrl = conv.AvatarUrl;

        if (conv.Type == ConversationType.Direct)
        {
            var otherMember = conv.Members.FirstOrDefault(m => m.UserId != currentUserId)?.User;
            if (otherMember != null)
            {
                title = otherMember.FullName;
                avatarUrl = otherMember.AvatarUrl;
            }
        }
        else if (conv.Type == ConversationType.ProjectBound && conv.Project != null)
        {
            title ??= $"[Dự án] {conv.Project.Name}";
        }

        return new ConversationDto
        {
            Id = conv.Id,
            Title = title,
            Type = conv.Type,
            AvatarUrl = avatarUrl,
            ProjectId = conv.ProjectId,
            ProjectName = conv.Project?.Name,
            ProjectCode = conv.Project?.Code,
            CreatedById = conv.CreatedById,
            CreatedAt = conv.CreatedAt,
            LastMessageAt = conv.LastMessageAt,
            UnreadCount = unreadCount,
            IsMuted = member.IsMuted,
            Members = conv.Members.Select(m => new ConversationMemberDto
            {
                UserId = m.UserId,
                FullName = m.User?.FullName ?? "Unknown",
                Email = m.User?.Email ?? string.Empty,
                AvatarUrl = m.User?.AvatarUrl,
                RoleName = m.User?.Role.ToString(),
                Role = m.Role,
                IsOnline = _presenceService.IsUserOnline(m.UserId),
                LastReadAt = m.LastReadAt,
                LastReadMessageId = m.LastReadMessageId,
                JoinedAt = m.JoinedAt
            }).ToList(),
            LastMessage = conv.LastMessage != null ? new ChatMessageDto
            {
                Id = conv.LastMessage.Id,
                ConversationId = conv.Id,
                SenderId = conv.LastMessage.SenderId,
                SenderName = conv.LastMessage.Sender?.FullName ?? "Unknown",
                Content = conv.LastMessage.Content,
                Type = conv.LastMessage.Type,
                CreatedAt = conv.LastMessage.CreatedAt
            } : null
        };
    }

    public async Task<ConversationDto> GetOrCreateDirectConversationAsync(Guid currentUserId, Guid targetUserId)
    {
        if (currentUserId == targetUserId)
        {
            throw new InvalidOperationException("Không thể tạo cuộc trò chuyện với chính mình.");
        }

        // Check if direct conversation already exists between both users
        var existingConvId = await _context.ConversationMembers
            .AsNoTracking()
            .Where(cm => cm.UserId == currentUserId && cm.Conversation.Type == ConversationType.Direct)
            .Select(cm => cm.ConversationId)
            .Intersect(
                _context.ConversationMembers
                    .AsNoTracking()
                    .Where(cm => cm.UserId == targetUserId && cm.Conversation.Type == ConversationType.Direct)
                    .Select(cm => cm.ConversationId)
            )
            .FirstOrDefaultAsync();

        if (existingConvId != Guid.Empty)
        {
            var existing = await GetConversationByIdAsync(existingConvId, currentUserId);
            if (existing != null) return existing;
        }

        // Create new direct conversation
        var targetUser = await _context.Users.FindAsync(targetUserId)
            ?? throw new KeyNotFoundException("Không tìm thấy người dùng này.");

        var conv = new Conversation
        {
            Id = Guid.NewGuid(),
            Type = ConversationType.Direct,
            CreatedById = currentUserId,
            CreatedAt = DateTime.UtcNow,
            Members = new List<ConversationMember>
            {
                new ConversationMember { UserId = currentUserId, Role = MemberRole.Admin, JoinedAt = DateTime.UtcNow },
                new ConversationMember { UserId = targetUserId, Role = MemberRole.Member, JoinedAt = DateTime.UtcNow }
            }
        };

        _context.Conversations.Add(conv);
        await _context.SaveChangesAsync();

        return (await GetConversationByIdAsync(conv.Id, currentUserId))!;
    }

    public async Task<ConversationDto> CreateGroupConversationAsync(Guid currentUserId, CreateGroupChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ArgumentException("Tên nhóm trò chuyện không được để trống.");
        }

        var memberIds = request.MemberIds.Distinct().ToList();
        if (!memberIds.Contains(currentUserId))
        {
            memberIds.Add(currentUserId);
        }

        var conv = new Conversation
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            AvatarUrl = request.AvatarUrl,
            Type = ConversationType.Group,
            ProjectId = request.ProjectId,
            CreatedById = currentUserId,
            CreatedAt = DateTime.UtcNow,
            Members = memberIds.Select(userId => new ConversationMember
            {
                UserId = userId,
                Role = userId == currentUserId ? MemberRole.Admin : MemberRole.Member,
                JoinedAt = DateTime.UtcNow
            }).ToList()
        };

        _context.Conversations.Add(conv);
        await _context.SaveChangesAsync();

        return (await GetConversationByIdAsync(conv.Id, currentUserId))!;
    }

    public async Task<ConversationDto> CreateProjectConversationAsync(Guid currentUserId, Guid projectId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new KeyNotFoundException("Không tìm thấy dự án.");

        // Check if already exists
        var existingConv = await _context.Conversations
            .FirstOrDefaultAsync(c => c.ProjectId == projectId && c.Type == ConversationType.ProjectBound);

        if (existingConv != null)
        {
            // Ensure current user is member
            var isMember = await _context.ConversationMembers
                .AnyAsync(cm => cm.ConversationId == existingConv.Id && cm.UserId == currentUserId);
            if (!isMember)
            {
                _context.ConversationMembers.Add(new ConversationMember
                {
                    ConversationId = existingConv.Id,
                    UserId = currentUserId,
                    Role = MemberRole.Member,
                    JoinedAt = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();
            }

            return (await GetConversationByIdAsync(existingConv.Id, currentUserId))!;
        }

        // Create new project conversation
        var memberIds = project.Members.Select(m => m.UserId).Distinct().ToList();
        if (!memberIds.Contains(currentUserId)) memberIds.Add(currentUserId);
        if (project.ManagerId.HasValue && !memberIds.Contains(project.ManagerId.Value)) memberIds.Add(project.ManagerId.Value);

        var conv = new Conversation
        {
            Id = Guid.NewGuid(),
            Title = $"[Dự án] {project.Name}",
            Type = ConversationType.ProjectBound,
            ProjectId = projectId,
            CreatedById = currentUserId,
            CreatedAt = DateTime.UtcNow,
            Members = memberIds.Select(userId => new ConversationMember
            {
                UserId = userId,
                Role = userId == currentUserId ? MemberRole.Admin : MemberRole.Member,
                JoinedAt = DateTime.UtcNow
            }).ToList()
        };

        _context.Conversations.Add(conv);
        await _context.SaveChangesAsync();

        return (await GetConversationByIdAsync(conv.Id, currentUserId))!;
    }

    public async Task<CursorPagedMessagesDto> GetMessagesPagedAsync(Guid conversationId, Guid currentUserId, Guid? beforeId, int limit = 30)
    {
        var isMember = await _context.ConversationMembers
            .AnyAsync(cm => cm.ConversationId == conversationId && cm.UserId == currentUserId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException("Bạn không phải thành viên của cuộc trò chuyện này.");
        }

        var totalCount = await _context.ChatMessages
            .CountAsync(m => m.ConversationId == conversationId && !m.IsDeleted);

        var query = _context.ChatMessages
            .AsNoTracking()
            .Where(m => m.ConversationId == conversationId && !m.IsDeleted);

        if (beforeId.HasValue)
        {
            var targetMessage = await _context.ChatMessages
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == beforeId.Value);

            if (targetMessage != null)
            {
                query = query.Where(m => m.CreatedAt < targetMessage.CreatedAt || (m.CreatedAt == targetMessage.CreatedAt && m.Id != targetMessage.Id));
            }
        }

        // Fetch limit + 1 to know if there are more
        var messages = await query
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit + 1)
            .Include(m => m.Sender)
            .Include(m => m.ReplyToMessage)
                .ThenInclude(r => r!.Sender)
            .Include(m => m.Attachments)
            .Include(m => m.Mentions)
            .ToListAsync();

        var hasMore = messages.Count > limit;
        if (hasMore)
        {
            messages = messages.Take(limit).ToList();
        }

        Guid? nextCursorId = hasMore && messages.Count > 0 ? messages.Last().Id : null;

        // Collect mention tasks and projects to enrich metadata
        var taskIds = messages.SelectMany(m => m.Mentions)
            .Where(m => m.MentionType == ChatMentionType.Task)
            .Select(m => m.TargetId)
            .Distinct()
            .ToList();

        var projectIds = messages.SelectMany(m => m.Mentions)
            .Where(m => m.MentionType == ChatMentionType.Project)
            .Select(m => m.TargetId)
            .Distinct()
            .ToList();

        var taskDict = taskIds.Count > 0
            ? await _context.Tasks.AsNoTracking()
                .Where(t => taskIds.Contains(t.Id))
                .ToDictionaryAsync(t => t.Id, t => new { t.Name, t.Status, t.Priority })
            : new();

        var projectDict = projectIds.Count > 0
            ? await _context.Projects.AsNoTracking()
                .Where(p => projectIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, p => new { p.Name, p.Code, p.Status })
            : new();

        // Convert and chronological order (reverse from newest-first to oldest-first)
        var messageDtos = messages.Select(m => new ChatMessageDto
        {
            Id = m.Id,
            ConversationId = m.ConversationId,
            SenderId = m.SenderId,
            SenderName = m.Sender?.FullName ?? "Unknown",
            SenderAvatarUrl = m.Sender?.AvatarUrl,
            SenderEmail = m.Sender?.Email,
            Content = m.Content ?? string.Empty,
            Type = m.Type,
            ReplyToMessageId = m.ReplyToMessageId,
            ReplyToMessage = m.ReplyToMessage != null ? new ChatMessageDto
            {
                Id = m.ReplyToMessage.Id,
                ConversationId = m.ConversationId,
                SenderId = m.ReplyToMessage.SenderId,
                SenderName = m.ReplyToMessage.Sender?.FullName ?? "Unknown",
                Content = m.ReplyToMessage.Content,
                Type = m.ReplyToMessage.Type,
                CreatedAt = m.ReplyToMessage.CreatedAt
            } : null,
            IsEdited = m.IsEdited,
            IsDeleted = m.IsDeleted,
            CreatedAt = m.CreatedAt,
            Attachments = m.Attachments.Select(a => new ChatMessageAttachmentDto
            {
                Id = a.Id,
                MessageId = a.MessageId,
                FileName = a.FileName,
                FilePath = a.FilePath,
                FileType = a.FileType,
                FileSize = a.FileSize,
                ThumbnailUrl = a.ThumbnailUrl,
                CreatedAt = a.CreatedAt
            }).ToList(),
            Mentions = m.Mentions.Select(men =>
            {
                var dto = new ChatMessageMentionDto
                {
                    Id = men.Id,
                    MentionType = men.MentionType,
                    TargetId = men.TargetId,
                    DisplayName = men.DisplayName
                };
                if (men.MentionType == ChatMentionType.Task && taskDict.TryGetValue(men.TargetId, out var tInfo))
                {
                    dto.DisplayName = tInfo.Name;
                    dto.TargetStatus = tInfo.Status.ToString();
                    dto.TargetPriority = tInfo.Priority.ToString();
                }
                else if (men.MentionType == ChatMentionType.Project && projectDict.TryGetValue(men.TargetId, out var pInfo))
                {
                    dto.DisplayName = pInfo.Name;
                    dto.TargetCode = pInfo.Code;
                    dto.TargetStatus = pInfo.Status.ToString();
                }
                return dto;
            }).ToList()
        })
        .OrderBy(m => m.CreatedAt) // Oldest first for UI rendering stream
        .ToList();

        return new CursorPagedMessagesDto
        {
            Items = messageDtos,
            HasMore = hasMore,
            NextCursorId = nextCursorId,
            TotalCount = totalCount
        };
    }

    public async Task<ChatMessageDto> SendMessageAsync(Guid currentUserId, SendMessageRequest request)
    {
        var member = await _context.ConversationMembers
            .FirstOrDefaultAsync(cm => cm.ConversationId == request.ConversationId && cm.UserId == currentUserId);

        if (member == null)
        {
            throw new UnauthorizedAccessException("Bạn không phải thành viên của cuộc trò chuyện này.");
        }

        var sender = await _context.Users.FindAsync(currentUserId)
            ?? throw new KeyNotFoundException("Không tìm thấy người dùng gửi tin.");

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = request.ConversationId,
            SenderId = currentUserId,
            Content = request.Content ?? string.Empty,
            Type = request.Type,
            ReplyToMessageId = request.ReplyToMessageId,
            CreatedAt = DateTime.UtcNow
        };

        if (request.Attachments != null && request.Attachments.Count > 0)
        {
            foreach (var att in request.Attachments)
            {
                message.Attachments.Add(new ChatMessageAttachment
                {
                    Id = Guid.NewGuid(),
                    MessageId = message.Id,
                    FileName = att.FileName,
                    FilePath = att.FilePath,
                    FileType = att.FileType,
                    FileSize = att.FileSize,
                    ThumbnailUrl = att.ThumbnailUrl,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        if (request.Mentions != null && request.Mentions.Count > 0)
        {
            foreach (var men in request.Mentions)
            {
                message.Mentions.Add(new ChatMessageMention
                {
                    Id = Guid.NewGuid(),
                    MessageId = message.Id,
                    MentionType = men.MentionType,
                    TargetId = men.TargetId,
                    DisplayName = men.DisplayName
                });
            }
        }

        _context.ChatMessages.Add(message);

        // Update conversation last message & member last read
        var conversation = await _context.Conversations.FindAsync(request.ConversationId);
        if (conversation != null)
        {
            conversation.LastMessageId = message.Id;
            conversation.LastMessageAt = message.CreatedAt;
        }

        member.LastReadMessageId = message.Id;
        member.LastReadAt = message.CreatedAt;

        await _context.SaveChangesAsync();

        // Enrich reply-to message if any
        ChatMessageDto? replyDto = null;
        if (message.ReplyToMessageId.HasValue)
        {
            var replyMsg = await _context.ChatMessages
                .Include(m => m.Sender)
                .FirstOrDefaultAsync(m => m.Id == message.ReplyToMessageId.Value);

            if (replyMsg != null)
            {
                replyDto = new ChatMessageDto
                {
                    Id = replyMsg.Id,
                    ConversationId = replyMsg.ConversationId,
                    SenderId = replyMsg.SenderId,
                    SenderName = replyMsg.Sender?.FullName ?? "Unknown",
                    Content = replyMsg.Content,
                    Type = replyMsg.Type,
                    CreatedAt = replyMsg.CreatedAt
                };
            }
        }

        return new ChatMessageDto
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            SenderName = sender.FullName,
            SenderAvatarUrl = sender.AvatarUrl,
            SenderEmail = sender.Email,
            Content = message.Content,
            Type = message.Type,
            ReplyToMessageId = message.ReplyToMessageId,
            ReplyToMessage = replyDto,
            IsEdited = message.IsEdited,
            IsDeleted = message.IsDeleted,
            CreatedAt = message.CreatedAt,
            Attachments = message.Attachments.Select(a => new ChatMessageAttachmentDto
            {
                Id = a.Id,
                MessageId = a.MessageId,
                FileName = a.FileName,
                FilePath = a.FilePath,
                FileType = a.FileType,
                FileSize = a.FileSize,
                ThumbnailUrl = a.ThumbnailUrl,
                CreatedAt = a.CreatedAt
            }).ToList(),
            Mentions = message.Mentions.Select(men => new ChatMessageMentionDto
            {
                Id = men.Id,
                MentionType = men.MentionType,
                TargetId = men.TargetId,
                DisplayName = men.DisplayName
            }).ToList()
        };
    }

    public async Task<bool> MarkAsReadAsync(Guid conversationId, Guid currentUserId, Guid lastMessageId)
    {
        var member = await _context.ConversationMembers
            .FirstOrDefaultAsync(cm => cm.ConversationId == conversationId && cm.UserId == currentUserId);

        if (member == null) return false;

        member.LastReadMessageId = lastMessageId;
        member.LastReadAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<ChatMediaItemDto>> GetConversationMediaAsync(Guid conversationId, Guid currentUserId, string? type = null)
    {
        var isMember = await _context.ConversationMembers
            .AnyAsync(cm => cm.ConversationId == conversationId && cm.UserId == currentUserId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException("Bạn không phải thành viên của cuộc trò chuyện này.");
        }

        var query = _context.ChatMessageAttachments
            .AsNoTracking()
            .Include(a => a.Message)
                .ThenInclude(m => m.Sender)
            .Where(a => a.Message.ConversationId == conversationId && !a.Message.IsDeleted);

        if (!string.IsNullOrWhiteSpace(type))
        {
            if (type.Equals("image", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(a => a.FileType != null && (a.FileType.StartsWith("image/") || a.FileName.EndsWith(".png") || a.FileName.EndsWith(".jpg") || a.FileName.EndsWith(".jpeg") || a.FileName.EndsWith(".webp") || a.FileName.EndsWith(".gif")));
            }
            else if (type.Equals("document", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(a => a.FileType == null || !a.FileType.StartsWith("image/"));
            }
        }

        var list = await query
            .OrderByDescending(a => a.CreatedAt)
            .Take(100)
            .Select(a => new ChatMediaItemDto
            {
                Id = a.Id,
                MessageId = a.MessageId,
                FileName = a.FileName,
                FilePath = a.FilePath,
                FileType = a.FileType,
                FileSize = a.FileSize,
                ThumbnailUrl = a.ThumbnailUrl,
                CreatedAt = a.CreatedAt,
                SenderId = a.Message.SenderId,
                SenderName = a.Message.Sender != null ? a.Message.Sender.FullName : "Unknown"
            })
            .ToListAsync();

        return list;
    }

    public async Task<bool> AddMembersToGroupAsync(Guid conversationId, Guid currentUserId, List<Guid> newMemberIds)
    {
        var conv = await _context.Conversations
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conv == null || conv.Type == ConversationType.Direct) return false;

        var currentMember = conv.Members.FirstOrDefault(m => m.UserId == currentUserId);
        if (currentMember == null) return false;

        var existingUserIds = conv.Members.Select(m => m.UserId).ToHashSet();
        foreach (var userId in newMemberIds)
        {
            if (!existingUserIds.Contains(userId))
            {
                conv.Members.Add(new ConversationMember
                {
                    ConversationId = conv.Id,
                    UserId = userId,
                    Role = MemberRole.Member,
                    JoinedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveMemberFromGroupAsync(Guid conversationId, Guid currentUserId, Guid memberId)
    {
        var member = await _context.ConversationMembers
            .FirstOrDefaultAsync(cm => cm.ConversationId == conversationId && cm.UserId == memberId);

        if (member == null) return false;

        _context.ConversationMembers.Remove(member);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> LeaveGroupAsync(Guid conversationId, Guid currentUserId)
    {
        return await RemoveMemberFromGroupAsync(conversationId, currentUserId, currentUserId);
    }
}
