import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Zoom,
  useTheme,
} from '@mui/material';
import {
  KeyboardArrowDown as ArrowDownIcon,
  ChatBubbleOutline as EmptyChatIcon,
} from '@mui/icons-material';
import { ChatMessage, ChatMessageAttachment, TypingNotification, Conversation } from '../../types';
import { ChatMessageItem } from './ChatMessageItem';
import { CHAT_COLORS } from '../../constants/chat.constants';

interface ChatMessageListProps {
  scrollContainerRef: React.RefObject<any>;
  messagesEndRef: React.RefObject<any>;
  messages: ChatMessage[];
  loadingMessages: boolean;
  typingUsers: TypingNotification[];
  currentUserId?: string;
  activeConversation: Conversation;
  showScrollBottom: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onScrollToBottom: () => void;
  onReply: (msg: ChatMessage) => void;
  onImageClick: (att: ChatMessageAttachment) => void;
  onTaskClick: (taskId: string) => void;
  onProjectClick: (projectId: string) => void;
}

const ChatMessageListComponent: React.FC<ChatMessageListProps> = ({
  scrollContainerRef,
  messagesEndRef,
  messages,
  loadingMessages,
  typingUsers,
  currentUserId,
  activeConversation,
  showScrollBottom,
  onScroll,
  onScrollToBottom,
  onReply,
  onImageClick,
  onTaskClick,
  onProjectClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const formatDateHeader = (d: Date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dayName = days[d.getDay()];
    return `${time} ${dayName}`;
  };

  // Auto-scroll when someone is typing so the indicator is revealed
  React.useEffect(() => {
    if (typingUsers.length > 0) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [typingUsers, messagesEndRef]);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        ref={scrollContainerRef}
        onScroll={onScroll}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowAnchor: 'none',
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 2 },
        }}
      >
        {loadingMessages ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, py: 6 }}>
            <CircularProgress size={32} sx={{ color: CHAT_COLORS.primary }} />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              py: 6,
              color: 'text.secondary',
            }}
          >
            <EmptyChatIcon sx={{ fontSize: 64, mb: 1.5, opacity: 0.3 }} />
            <Typography variant="h6" fontWeight={700}>
              Chưa có tin nhắn nào
            </Typography>
            <Typography variant="body2">Hãy gửi lời chào để bắt đầu cuộc trò chuyện!</Typography>
          </Box>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.senderId === currentUserId;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

            // Date divider: > 45 mins or different day
            const msgDate = new Date(msg.createdAt);
            const prevDate = prevMsg ? new Date(prevMsg.createdAt) : null;
            const showDateDivider =
              !prevDate ||
              msgDate.toDateString() !== prevDate.toDateString() ||
              msgDate.getTime() - prevDate.getTime() > 45 * 60 * 1000;

            // Consecutive clustering (within 2 mins from same sender)
            const isSameSenderAsPrev = Boolean(
              prevMsg &&
              prevMsg.senderId === msg.senderId &&
              !showDateDivider &&
              msgDate.getTime() - new Date(prevMsg.createdAt).getTime() < 2 * 60 * 1000
            );

            const isSameSenderAsNext = Boolean(
              nextMsg &&
              nextMsg.senderId === msg.senderId &&
              new Date(nextMsg.createdAt).getTime() - msgDate.getTime() < 2 * 60 * 1000
            );

            const isFirstInGroup = !isSameSenderAsPrev;
            const isLastInGroup = !isSameSenderAsNext;
            const isMiddleInGroup = Boolean(isSameSenderAsPrev && isSameSenderAsNext);

            return (
              <React.Fragment key={msg.id}>
                {/* Centered Date Header */}
                {showDateDivider && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'text.secondary',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {formatDateHeader(msgDate)}
                    </Typography>
                  </Box>
                )}

                <ChatMessageItem
                  message={msg}
                  isOwn={isOwn}
                  isFirstInGroup={isFirstInGroup}
                  isMiddleInGroup={isMiddleInGroup}
                  isLastInGroup={isLastInGroup}
                  showAvatar={!isOwn && isLastInGroup}
                  showSenderName={!isOwn && isFirstInGroup && activeConversation.type !== 'Direct'}
                  onReply={onReply}
                  onImageClick={onImageClick}
                  onTaskClick={onTaskClick}
                  onProjectClick={onProjectClick}
                />
              </React.Fragment>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              py: 0.75,
              px: 2.5,
              animation: 'typingFadeIn 0.25s ease-out',
              '@keyframes typingFadeIn': {
                from: { opacity: 0, transform: 'translateY(6px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {/* Animated 3-dots Messenger bubble */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: isDark ? '#3a3b3c' : '#e4e6eb',
                px: 1.5,
                py: 0.75,
                borderRadius: '16px',
                height: 26,
              }}
            >
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#b0b3b8' : '#65676b',
                    animation: 'typingDotBounce 1.2s infinite ease-in-out',
                    animationDelay: `${i * 0.18}s`,
                    '@keyframes typingDotBounce': {
                      '0%, 60%, 100%': { transform: 'translateY(0)' },
                      '30%': { transform: 'translateY(-4px)' },
                    },
                  }}
                />
              ))}
            </Box>

            <Typography
              variant="caption"
              sx={{
                fontStyle: 'italic',
                color: 'text.secondary',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              {typingUsers.map((u) => u.fullName).join(', ')} đang soạn tin nhắn...
            </Typography>
          </Box>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </Box>

      {/* Floating Jump to Bottom Button with Hardware-Accelerated CSS Transition (eliminates scroll jitter) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 12, sm: 20 },
          right: { xs: 14, sm: 24 },
          zIndex: 20,
          opacity: showScrollBottom ? 1 : 0,
          transform: showScrollBottom ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.85)',
          pointerEvents: showScrollBottom ? 'auto' : 'none',
          transition: 'opacity 0.22s ease, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
          willChange: 'opacity, transform',
        }}
      >
        <Button
          variant="contained"
          size="small"
          startIcon={<ArrowDownIcon />}
          onClick={onScrollToBottom}
          tabIndex={showScrollBottom ? 0 : -1}
          sx={{
            borderRadius: '20px',
            bgcolor: CHAT_COLORS.primary,
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            py: { xs: 0.5, sm: 0.65 },
            px: { xs: 1.4, sm: 1.8 },
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(147, 51, 234, 0.35)',
            transition: 'background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
            '&:hover': {
              bgcolor: CHAT_COLORS.primaryHover,
              transform: 'translateY(-2px) scale(1.03)',
              boxShadow: '0 6px 20px rgba(147, 51, 234, 0.45)',
            },
            '&:active': {
              transform: 'scale(0.97)',
            },
          }}
        >
          Tin nhắn mới
        </Button>
      </Box>
    </Box>
  );
};

export const ChatMessageList = React.memo(ChatMessageListComponent);
