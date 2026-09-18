import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Drawer,
  InputBase,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChatBubbleOutline as EmptyChatIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage, ChatMessageAttachment } from '../types';
import { useChatScroll } from '../hooks/useChatScroll';
import { useChatMessages } from '../hooks/useChatMessages';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatMessageList } from '../components/chat/ChatMessageList';
import { SmartMentionInput } from '../components/chat/SmartMentionInput';
import { ChatMediaDrawer } from '../components/chat/ChatMediaDrawer';
import { MediaViewerModal } from '../components/chat/MediaViewerModal';
import { CreateGroupModal } from '../components/chat/CreateGroupModal';
import { NewDirectChatModal } from '../components/chat/NewDirectChatModal';
import { CHAT_COLORS } from '../constants/chat.constants';

export const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const { user } = useAuth();
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    openDirectChatWithUser,
  } = useChat();

  // Modals & Drawers - Info panel closed by default
  const [isMediaDrawerOpen, setIsMediaDrawerOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isDirectChatModalOpen, setIsDirectChatModalOpen] = useState(false);
  const [viewerAttachment, setViewerAttachment] = useState<ChatMessageAttachment | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  // In-Conversation Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const scrollToBottomRef = useRef<(behavior?: ScrollBehavior) => void>(() => {});

  // Messages Management & Real-time Hook
  const {
    messages,
    loadingMessages,
    loadingOlder,
    hasOlderMessages,
    typingUsers,
    loadOlderMessages,
    sendMessage,
  } = useChatMessages({
    conversationId: activeConversationId,
    currentUserId: user?.id,
    onNewMessageSent: () => {
      setTimeout(() => scrollToBottomRef.current('smooth'), 60);
    },
    onMessageReceived: (msg) => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 180;
        if (isNearBottom || msg.senderId === user?.id) {
          setTimeout(() => scrollToBottomRef.current('smooth'), 50);
        }
      }
    },
  });

  // Scroll Management Hook
  const {
    scrollContainerRef,
    messagesEndRef,
    showScrollBottom,
    isInitialScrollDone,
    scrollToBottom,
    handleScroll,
    resetInitialScroll,
    markInitialScrollDone,
  } = useChatScroll({
    messages,
    hasOlderMessages,
    isLoadingOlder: loadingOlder,
    onLoadOlder: loadOlderMessages,
  });

  useEffect(() => {
    scrollToBottomRef.current = scrollToBottom;
  }, [scrollToBottom]);

  // Reset scroll state when changing conversation
  useEffect(() => {
    resetInitialScroll();
  }, [activeConversationId, resetInitialScroll]);

  // Auto-scroll on initial load of messages
  useEffect(() => {
    if (messages.length > 0 && !isInitialScrollDone.current) {
      scrollToBottom('auto');
      markInitialScrollDone();
    }
  }, [messages, isInitialScrollDone, markInitialScrollDone, scrollToBottom]);

  // Auto-scroll to show typing indicator when other user is typing
  useEffect(() => {
    if (typingUsers.length > 0) {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 350;
        if (isNearBottom) {
          setTimeout(() => scrollToBottom('smooth'), 50);
        }
      }
    }
  }, [typingUsers, scrollToBottom, scrollContainerRef]);

  // Handle typing broadcast via SignalR
  const handleTypingNotification = (isTyping: boolean) => {
    if (activeConversationId) {
      import('../services/chatSignalR').then(({ chatSignalR }) => {
        chatSignalR.sendTyping(activeConversationId, isTyping);
      });
    }
  };

  // Filter messages when in-conversation search is active
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase().trim();
    return messages.filter((m) => m.content.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  // Memoized handlers for ChatMessageList to prevent scroll jank
  const handleReply = useCallback((msg: ChatMessage) => {
    setReplyTo(msg);
  }, []);

  const handleImageClick = useCallback((att: ChatMessageAttachment) => {
    setViewerAttachment(att);
  }, []);

  const handleTaskClick = useCallback((taskId: string) => {
    navigate(`/tasks?taskId=${taskId}`);
  }, [navigate]);

  const handleProjectClick = useCallback((projectId: string) => {
    navigate(`/projects/${projectId}`);
  }, [navigate]);

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom('smooth');
  }, [scrollToBottom]);

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        maxHeight: '100%',
        width: '100%',
        overflow: 'hidden',
        bgcolor: isDark ? CHAT_COLORS.dark.bg : CHAT_COLORS.light.surface,
      }}
    >
      {/* Column 1: Messenger Sidebar (Full width on mobile when no chat is open) */}
      <Box
        sx={{
          width: { xs: '100%', md: 320, lg: 360 },
          height: '100%',
          flexShrink: 0,
          display: {
            xs: activeConversationId ? 'none' : 'flex',
            md: 'flex',
          },
          flexDirection: 'column',
        }}
      >
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => {
            setActiveConversationId(id);
            resetInitialScroll();
          }}
          onCreateGroupClick={() => setIsCreateGroupOpen(true)}
          onNewDirectChatClick={() => setIsDirectChatModalOpen(true)}
          onSelectDirectUser={async (targetUserId) => {
            const newId = await openDirectChatWithUser(targetUserId);
            if (newId) {
              setActiveConversationId(newId);
              resetInitialScroll();
            }
          }}
        />
      </Box>

      {/* Column 2: Messenger Main Chat Workspace */}
      {activeConversation ? (
        <Box
          sx={{
            flex: 1,
            display: {
              xs: activeConversationId ? 'flex' : 'none',
              md: 'flex',
            },
            flexDirection: 'column',
            height: '100%',
            maxHeight: '100%',
            minHeight: 0,
            overflow: 'hidden',
            backgroundColor: isDark ? CHAT_COLORS.dark.bg : CHAT_COLORS.light.bg,
            position: 'relative',
          }}
        >
          {/* Top Sticky Header */}
          <ChatHeader
            conversation={activeConversation}
            isMediaDrawerOpen={isMediaDrawerOpen}
            onToggleMediaDrawer={() => setIsMediaDrawerOpen((prev) => !prev)}
            onBack={() => setActiveConversationId(null)}
          />

          {/* In-Conversation Search Bar */}
          <Collapse in={isSearchOpen}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.75,
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: isDark ? CHAT_COLORS.dark.surface : '#f0f2f5',
                zIndex: 9,
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              <InputBase
                fullWidth
                autoFocus
                placeholder="Tìm kiếm tin nhắn trong cuộc trò chuyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ fontSize: '0.85rem' }}
              />
              {searchQuery && (
                <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', px: 1 }}>
                  {filteredMessages.length} kết quả
                </Typography>
              )}
              <IconButton
                size="small"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Collapse>

          {/* Message Stream Body */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: isDark ? CHAT_COLORS.dark.bg : CHAT_COLORS.light.bg,
              overflow: 'hidden',
            }}
          >
            {/* Scrollable Message List */}
            <ChatMessageList
              scrollContainerRef={scrollContainerRef}
              messagesEndRef={messagesEndRef}
              messages={filteredMessages}
              loadingMessages={loadingMessages}
              typingUsers={typingUsers}
              currentUserId={user?.id}
              activeConversation={activeConversation}
              showScrollBottom={showScrollBottom}
              onScroll={handleScroll}
              onScrollToBottom={handleScrollToBottom}
              onReply={handleReply}
              onImageClick={handleImageClick}
              onTaskClick={handleTaskClick}
              onProjectClick={handleProjectClick}
            />

            {/* Bottom Sticky Composer */}
            <Box
              sx={{
                position: 'sticky',
                bottom: 0,
                zIndex: 15,
                flexShrink: 0,
                width: '100%',
                backgroundColor: isDark ? CHAT_COLORS.dark.surface : CHAT_COLORS.light.bg,
              }}
            >
              <SmartMentionInput
                conversationId={activeConversation.id}
                projectId={activeConversation.projectId}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
                onSendMessage={async (content, files, mentions) => {
                  const ok = await sendMessage(content, files, mentions, replyTo?.id);
                  if (ok) setReplyTo(null);
                  return ok;
                }}
                onTyping={handleTypingNotification}
              />
            </Box>
          </Box>
        </Box>
      ) : (
        /* Empty State when no conversation is selected (Desktop only) */
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            height: '100%',
            color: 'text.secondary',
            p: 4,
            backgroundColor: isDark ? CHAT_COLORS.dark.bg : CHAT_COLORS.light.bg,
          }}
        >
          <Box
            sx={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              bgcolor: isDark ? CHAT_COLORS.dark.surface : CHAT_COLORS.light.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <EmptyChatIcon sx={{ fontSize: 48, color: CHAT_COLORS.primary }} />
          </Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: isDark ? CHAT_COLORS.dark.textPrimary : CHAT_COLORS.light.textPrimary, mb: 0.5 }}
          >
            Đoạn chat Messenger
          </Typography>
          <Typography variant="body2" sx={{ maxWidth: 360, textAlign: 'center' }}>
            Chọn một đoạn chat hoặc bắt đầu cuộc trò chuyện mới với nhân sự hoặc đội ngũ dự án.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setIsDirectChatModalOpen(true)}
            sx={{
              mt: 2.5,
              borderRadius: '20px',
              bgcolor: CHAT_COLORS.primary,
              '&:hover': { bgcolor: CHAT_COLORS.primaryHover },
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Tin nhắn mới
          </Button>
        </Box>
      )}

      {/* Column 3: Messenger Right Info Panel (Desktop >= 1200px) */}
      {activeConversation && isLargeScreen && isMediaDrawerOpen && (
        <ChatMediaDrawer
          open={true}
          conversation={activeConversation}
          onImageClick={(att) => setViewerAttachment(att)}
          onSearchClick={() => setIsSearchOpen((prev) => !prev)}
          currentUserId={user?.id}
          isInline={true}
        />
      )}

      {/* Mobile & Tablet Overlay Drawer for Info Panel (< 1200px) */}
      {activeConversation && !isLargeScreen && (
        <Drawer
          anchor="right"
          open={isMediaDrawerOpen}
          onClose={() => setIsMediaDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '100vw', sm: 340 },
              maxWidth: '100vw',
              backgroundColor: isDark ? '#18191a' : '#ffffff',
            },
          }}
        >
          <Box sx={{ width: { xs: '100vw', sm: 340 }, maxWidth: '100vw', height: '100%' }}>
            <ChatMediaDrawer
              open={isMediaDrawerOpen}
              onClose={() => setIsMediaDrawerOpen(false)}
              conversation={activeConversation}
              onImageClick={(att) => setViewerAttachment(att)}
              onSearchClick={() => {
                setIsMediaDrawerOpen(false);
                setIsSearchOpen(true);
              }}
              currentUserId={user?.id}
              isInline={false}
            />
          </Box>
        </Drawer>
      )}

      {/* Modals */}
      <CreateGroupModal
        open={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onSuccess={(newId: string) => setActiveConversationId(newId)}
      />

      <NewDirectChatModal
        open={isDirectChatModalOpen}
        onClose={() => setIsDirectChatModalOpen(false)}
        onSelectUser={async (targetUserId) => {
          const newId = await openDirectChatWithUser(targetUserId);
          if (newId) setActiveConversationId(newId);
        }}
      />

      <MediaViewerModal
        open={Boolean(viewerAttachment)}
        imageUrl={viewerAttachment?.filePath}
        fileName={viewerAttachment?.fileName}
        onClose={() => setViewerAttachment(null)}
      />
    </Box>
  );
};
