import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Reply as ReplyIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileIcon,
  Assignment as TaskIcon,
  Business as ProjectIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { ChatMessage, ChatMessageAttachment } from '../../types';
import { CHAT_COLORS, BUBBLE_RADIUS } from '../../constants/chat.constants';

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
  isFirstInGroup?: boolean;
  isMiddleInGroup?: boolean;
  isLastInGroup?: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
  onReply?: (msg: ChatMessage) => void;
  onImageClick?: (attachment: ChatMessageAttachment) => void;
  onTaskClick?: (taskId: string) => void;
  onProjectClick?: (projectId: string) => void;
}

const ChatMessageItemComponent: React.FC<ChatMessageItemProps> = ({
  message,
  isOwn,
  isFirstInGroup = true,
  isMiddleInGroup = false,
  isLastInGroup = true,
  showAvatar = true,
  showSenderName = true,
  onReply,
  onImageClick,
  onTaskClick,
  onProjectClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
    }
  };

  const images = message.attachments?.filter(
    (a) => a.fileType?.startsWith('image/') || a.fileName.match(/\.(jpeg|jpg|png|gif|webp)$/i)
  ) || [];

  const files = message.attachments?.filter(
    (a) => !a.fileType?.startsWith('image/') && !a.fileName.match(/\.(jpeg|jpg|png|gif|webp)$/i)
  ) || [];

  const taskMentions = message.mentions?.filter(
    (m) => m.mentionType === 'Task' || (m.mentionType as any) === 1
  ) || [];
  const projectMentions = message.mentions?.filter(
    (m) => m.mentionType === 'Project' || (m.mentionType as any) === 2
  ) || [];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Messenger Consecutive Stacking Border Radius
  const getBorderRadius = () => {
    if (isFirstInGroup && isLastInGroup) return BUBBLE_RADIUS.SINGLE;
    if (isOwn) {
      if (isFirstInGroup) return BUBBLE_RADIUS.OWN_FIRST;
      if (isMiddleInGroup) return BUBBLE_RADIUS.OWN_MIDDLE;
      if (isLastInGroup) return BUBBLE_RADIUS.OWN_LAST;
      return BUBBLE_RADIUS.SINGLE;
    } else {
      if (isFirstInGroup) return BUBBLE_RADIUS.INCOMING_FIRST;
      if (isMiddleInGroup) return BUBBLE_RADIUS.INCOMING_MIDDLE;
      if (isLastInGroup) return BUBBLE_RADIUS.INCOMING_LAST;
      return BUBBLE_RADIUS.SINGLE;
    }
  };

  // Render mentions highlighting with full Unicode support (including Vietnamese characters)
  const renderMessageContent = (content: string) => {
    if (!content) return null;

    // Extract known user mention names to match multi-word names accurately
    const userNames = (message.mentions || [])
      .filter((m) => m.mentionType === 'User' || (m.mentionType as any) === 0)
      .map((m) => m.displayName)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const userPatterns = userNames.length > 0 ? userNames.map(escapeRegex).join('|') : null;

    // Regex supports Unicode letters (\p{L}), numbers (\p{N}), marks (\p{M}), _, and -
    const mentionRegex = userPatterns
      ? new RegExp(`(@(?:${userPatterns})|@[\\p{L}\\p{N}\\p{M}_-]+|#[\\p{L}\\p{N}\\p{M}_-]+|![\\p{L}\\p{N}\\p{M}_-]+)`, 'gu')
      : /(@[\p{L}\p{N}\p{M}_-]+|#[\p{L}\p{N}\p{M}_-]+|![\p{L}\p{N}\p{M}_-]+)/gu;

    const parts = content.split(mentionRegex);
    return (
      <Typography
        variant="body1"
        sx={{
          fontSize: '0.9375rem',
          lineHeight: 1.45,
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          color: isOwn ? '#FFFFFF' : isDark ? '#E4E6EB' : '#050505',
        }}
      >
        {parts.map((part, i) => {
          if (part.startsWith('@')) {
            return (
              <Box
                key={i}
                component="span"
                sx={{
                  fontWeight: 600,
                  bgcolor: isOwn ? 'rgba(255,255,255,0.25)' : isDark ? 'rgba(46,137,255,0.25)' : '#e0f2fe',
                  color: isOwn ? '#FFFFFF' : '#2e89ff',
                  px: 0.5,
                  py: 0.1,
                  borderRadius: '4px',
                  mr: 0.25,
                }}
              >
                {part}
              </Box>
            );
          }
          if (part.startsWith('#')) {
            const rawTag = part.slice(1);
            const cleanTag = rawTag.replace(/_/g, ' ').toLowerCase();
            const matchedTask = taskMentions.find(
              (t) =>
                t.targetId === rawTag ||
                t.displayName.toLowerCase() === cleanTag ||
                t.displayName.replace(/\s+/g, '_').toLowerCase() === rawTag.toLowerCase()
            );

            return (
              <Box
                key={i}
                component="span"
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskClick?.(matchedTask ? matchedTask.targetId : rawTag);
                }}
                sx={{
                  fontWeight: 600,
                  bgcolor: isOwn ? 'rgba(255,255,255,0.25)' : isDark ? 'rgba(16,185,129,0.25)' : '#d1fae5',
                  color: isOwn ? '#FFFFFF' : '#10b981',
                  px: 0.5,
                  py: 0.1,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  mr: 0.25,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {part}
              </Box>
            );
          }
          if (part.startsWith('!')) {
            const rawTag = part.slice(1);
            const cleanTag = rawTag.replace(/_/g, ' ').toLowerCase();
            const matchedProject = projectMentions.find(
              (p) =>
                p.targetId === rawTag ||
                p.targetCode?.toLowerCase() === rawTag.toLowerCase() ||
                p.displayName.toLowerCase() === cleanTag ||
                p.displayName.replace(/\s+/g, '_').toLowerCase() === rawTag.toLowerCase()
            );

            return (
              <Box
                key={i}
                component="span"
                onClick={(e) => {
                  e.stopPropagation();
                  onProjectClick?.(matchedProject ? matchedProject.targetId : rawTag);
                }}
                sx={{
                  fontWeight: 600,
                  bgcolor: isOwn ? 'rgba(255,255,255,0.25)' : isDark ? 'rgba(245,158,11,0.25)' : '#fef3c7',
                  color: isOwn ? '#FFFFFF' : '#f59e0b',
                  px: 0.5,
                  py: 0.1,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  mr: 0.25,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {part}
              </Box>
            );
          }
          return part;
        })}
      </Typography>
    );
  };

  return (
    <Box
      id={`chat-msg-${message.id}`}
      data-message-id={message.id}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        width: '100%',
        mb: isLastInGroup ? 1.5 : 0.25,
        px: { xs: 1, sm: 2 },
        position: 'relative',
        '&:hover .chat-hover-actions': {
          opacity: 1,
          pointerEvents: 'auto',
        },
      }}
    >
      {/* Sender name above first message in cluster (for groups) */}
      {!isOwn && showSenderName && isFirstInGroup && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'text.secondary',
            mb: 0.35,
            ml: 4.5,
          }}
        >
          {message.senderName}
        </Typography>
      )}

      {/* Main message row with avatar + bubble + action bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isOwn ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          maxWidth: { xs: '85%', sm: '75%', md: '68%' },
          position: 'relative',
          gap: 1,
        }}
      >
        {/* Incoming sender avatar on the left (only on last message of group) */}
        {!isOwn && (
          <Box sx={{ width: 28, minWidth: 28, height: 28, flexShrink: 0, mb: 0.25 }}>
            {showAvatar && isLastInGroup ? (
              <Avatar
                src={message.senderAvatarUrl}
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: '#a855f7',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {message.senderName ? message.senderName.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            ) : null}
          </Box>
        )}

        {/* Message Bubble Box */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isOwn ? 'flex-end' : 'flex-start',
            position: 'relative',
            maxWidth: '100%',
            minWidth: 0,
          }}
        >
          {/* Reply Context Bubble */}
          {message.replyToMessage && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.5,
                mb: 0.25,
                borderRadius: '14px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                borderLeft: '3px solid #a855f7',
                maxWidth: '100%',
                fontSize: '0.75rem',
                color: 'text.secondary',
              }}
            >
              <Typography variant="caption" fontWeight={700} color="#a855f7">
                {message.replyToMessage.senderName}:
              </Typography>
              <Typography variant="caption" noWrap sx={{ maxWidth: 200 }}>
                {message.replyToMessage.content || '[Tệp đính kèm]'}
              </Typography>
            </Box>
          )}

          {/* Facebook Messenger Bubble */}
          <Box
            sx={{
              position: 'relative',
              width: 'fit-content',
              maxWidth: '100%',
              px: 1.75,
              py: 1,
              borderRadius: getBorderRadius(),
              backgroundColor: isOwn
                ? CHAT_COLORS.primaryHover
                : isDark
                ? CHAT_COLORS.dark.bubbleIncoming
                : CHAT_COLORS.light.bubbleIncoming,
              backgroundImage: isOwn ? CHAT_COLORS.primaryGradient : 'none',
              boxShadow: isOwn
                ? '0 2px 8px rgba(124, 58, 237, 0.25)'
                : '0 1px 2px rgba(0,0,0,0.08)',
              transition: 'background-color 0.15s ease',
            }}
          >
            {/* Text message */}
            {message.content && renderMessageContent(message.content)}

            {/* Embedded Task Mention Card */}
            {taskMentions.map((tm) => (
              <Card
                key={tm.id}
                elevation={0}
                onClick={() => onTaskClick?.(tm.targetId)}
                sx={{
                  mt: 1,
                  p: 1,
                  borderRadius: '12px',
                  bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.9)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TaskIcon sx={{ color: '#10b981', fontSize: 20 }} />
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: isDark ? '#fff' : '#000' }} noWrap>
                      {tm.displayName}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Công việc dự án
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}

            {/* Embedded Project Mention Card */}
            {projectMentions.map((pm) => (
              <Card
                key={pm.id}
                elevation={0}
                onClick={() => onProjectClick?.(pm.targetId)}
                sx={{
                  mt: 1,
                  p: 1,
                  borderRadius: '12px',
                  bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.9)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ProjectIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: isDark ? '#fff' : '#000' }} noWrap>
                      {pm.displayName}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Dự án liên kết
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}

            {/* Images Grid */}
            {images.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: message.content ? 1 : 0 }}>
                {images.map((img) => (
                  <Box
                    key={img.id}
                    component="img"
                    src={img.filePath}
                    alt={img.fileName}
                    onClick={() => onImageClick?.(img)}
                    sx={{
                      width: images.length === 1 ? '100%' : images.length === 2 ? 'calc(50% - 4px)' : 'calc(33.33% - 4px)',
                      maxHeight: 220,
                      objectFit: 'cover',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'opacity 0.15s ease',
                      '&:hover': { opacity: 0.9 },
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Document Attachments */}
            {files.map((file) => (
              <Box
                key={file.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: 0.75,
                  p: 1,
                  borderRadius: '12px',
                  bgcolor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.85)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                }}
              >
                <FileIcon sx={{ color: isOwn ? '#fff' : '#a855f7' }} />
                <Box sx={{ overflow: 'hidden', flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ color: isDark ? '#fff' : '#000' }}>
                    {file.fileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.fileSize)}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  component="a"
                  href={file.filePath}
                  download={file.fileName}
                  target="_blank"
                  sx={{ color: isOwn ? '#fff' : '#a855f7' }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Facebook Floating Quick Action Buttons on Hover (Reply & Copy) */}
        <Box
          className="chat-hover-actions"
          sx={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            [isOwn ? 'left' : 'right']: -46,
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.15s ease',
            zIndex: 10,
          }}
        >
          {/* Reply */}
          <Tooltip title="Trả lời">
            <IconButton
              size="small"
              onClick={() => onReply?.(message)}
              sx={{
                p: 0.5,
                bgcolor: isDark ? '#242526' : '#FFFFFF',
                color: isDark ? '#e4e6eb' : '#050505',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: isDark ? '#3a3b3c' : '#f0f2f5' },
              }}
            >
              <ReplyIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          {/* Copy */}
          {message.content && (
            <Tooltip title="Sao chép">
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{
                  p: 0.5,
                  bgcolor: isDark ? '#242526' : '#FFFFFF',
                  color: isDark ? '#e4e6eb' : '#050505',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  '&:hover': { bgcolor: isDark ? '#3a3b3c' : '#f0f2f5' },
                }}
              >
                <CopyIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Timestamp & Seen status (below last message in group) */}
      {isLastInGroup && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.35,
            mr: isOwn ? 0.5 : 0,
            ml: !isOwn ? 4.5 : 0,
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            {formatTime(message.createdAt)}
          </Typography>
          {isOwn && (
            <Tooltip title="Đã gửi">
              <CheckIcon sx={{ fontSize: 12, color: 'text.secondary', opacity: 0.7 }} />
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};

export const ChatMessageItem = React.memo(ChatMessageItemComponent);
