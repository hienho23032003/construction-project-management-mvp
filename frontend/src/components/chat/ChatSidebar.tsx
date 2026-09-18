import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  InputBase,
  IconButton,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Chip,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreHoriz as MoreIcon,
  DriveFileRenameOutline as NewChatIcon,
  Group as GroupIcon,
  Business as ProjectIcon,
  Person as PersonIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import { Conversation, User } from '../../types';
import { userApi } from '../../services/api/endpoints';
import { useAuth } from '../../contexts/AuthContext';
import { useOnlineUsersQuery } from '../../hooks/usePresence';
import { CHAT_COLORS } from '../../constants/chat.constants';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateGroupClick: () => void;
  onNewDirectChatClick: () => void;
  onSelectDirectUser: (userId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateGroupClick,
  onNewDirectChatClick,
  onSelectDirectUser,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user: currentUser } = useAuth();
  const { data: onlineUsers } = useOnlineUsersQuery();

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'group' | 'project'>('all');
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);

  const onlineUserIds = useMemo(
    () => new Set(onlineUsers?.map((u) => u.userId) || []),
    [onlineUsers]
  );

  useEffect(() => {
    userApi.getAllList().then((res) => {
      if (res.data.success && res.data.data) {
        setCompanyUsers(res.data.data.filter((u) => u.id !== currentUser?.id));
      }
    }).catch(() => {});
  }, [currentUser?.id]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Tab filter
      if (filterTab === 'unread' && !c.unreadCount) return false;
      if (filterTab === 'group' && c.type !== 'Group') return false;
      if (filterTab === 'project' && c.type !== 'ProjectBound') return false;

      // Text search
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchProject = c.projectName?.toLowerCase().includes(q) || c.projectCode?.toLowerCase().includes(q);
      const matchLastMsg = c.lastMessage?.content?.toLowerCase().includes(q);
      return matchTitle || matchProject || matchLastMsg;
    });
  }, [conversations, filterTab, search]);

  const matchedUsers = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return companyUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q))
    );
  }, [companyUsers, search]);

  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) {
        const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
        return `${mins} phút`;
      }
      if (diffHours < 24) {
        return `${diffHours} giờ`;
      }
      if (diffDays < 7) {
        return `${diffDays} ngày`;
      }
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? '#18191a' : '#FFFFFF',
        borderRight: '1px solid',
        borderColor: 'divider',
        userSelect: 'none',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Sticky Header Section: Header + Search + Filter Pills */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          flexShrink: 0,
          backgroundColor: isDark ? '#18191a' : '#FFFFFF',
        }}
      >
        {/* 1. Header: "Đoạn chat" + Action Icons */}
        <Box
          sx={{
            px: 2,
            pt: 2,
            pb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              fontSize: '1.45rem',
              color: isDark ? '#E4E6EB' : '#050505',
              letterSpacing: '-0.02em',
            }}
          >
            Đoạn chat
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Tùy chọn">
              <IconButton
                size="small"
                sx={{
                  bgcolor: isDark ? '#3a3b3c' : '#f0f2f5',
                  color: isDark ? '#e4e6eb' : '#050505',
                  p: 0.8,
                  '&:hover': { bgcolor: isDark ? '#4e4f50' : '#e4e6eb' },
                }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Tạo tin nhắn mới / Nhóm">
              <IconButton
                size="small"
                onClick={onNewDirectChatClick}
                sx={{
                  bgcolor: isDark ? '#3a3b3c' : '#f0f2f5',
                  color: isDark ? '#e4e6eb' : '#050505',
                  p: 0.8,
                  '&:hover': { bgcolor: isDark ? '#4e4f50' : '#e4e6eb' },
                }}
              >
                <NewChatIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* 2. Facebook Messenger Search Pill */}
        <Box sx={{ px: 2, pb: 1.25 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: isDark ? '#3a3b3c' : '#f0f2f5',
              borderRadius: '20px',
              px: 1.75,
              py: 0.6,
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Tìm kiếm trên Messenger"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              sx={{
                fontSize: '0.9375rem',
                color: isDark ? '#e4e6eb' : '#050505',
                '& ::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.8,
                },
              }}
            />
          </Box>
        </Box>

        {/* 3. Filter Pills: "Tất cả", "Chưa đọc", "Nhóm", "Cộng đồng" */}
        <Box
          sx={{
            px: 2,
            pb: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            overflowX: 'auto',
            '::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'unread', label: 'Chưa đọc' },
            { key: 'group', label: 'Nhóm' },
            { key: 'project', label: 'Dự án' },
          ].map((tab) => {
            const isActive = filterTab === tab.key;
            return (
              <Chip
                key={tab.key}
                label={tab.label}
                onClick={() => setFilterTab(tab.key as any)}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  borderRadius: '16px',
                  height: 32,
                  cursor: 'pointer',
                  bgcolor: isActive
                    ? isDark
                      ? 'rgba(168, 85, 247, 0.2)'
                      : '#f3e8ff'
                    : isDark
                    ? '#242526'
                    : '#f0f2f5',
                  color: isActive
                    ? '#a855f7'
                    : isDark
                    ? '#e4e6eb'
                    : '#050505',
                  '&:hover': {
                    bgcolor: isActive
                      ? isDark
                        ? 'rgba(168, 85, 247, 0.3)'
                        : '#ebd5ff'
                      : isDark
                      ? '#3a3b3c'
                      : '#e4e6eb',
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* 4. Conversation List */}
      <List
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: 1,
          py: 0,
        }}
      >
        {/* Search Results for Personnel */}
        {search.trim() && matchedUsers.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ px: 1.5, color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
              Nhân sự công ty
            </Typography>
            {matchedUsers.map((u) => (
              <ListItemButton
                key={u.id}
                onClick={() => onSelectDirectUser(u.id)}
                sx={{
                  borderRadius: '12px',
                  py: 1,
                  px: 1.5,
                  my: 0.25,
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                }}
              >
                <ListItemAvatar>
                  <Avatar src={u.avatarUrl} sx={{ width: 44, height: 44, bgcolor: '#a855f7', fontWeight: 600 }}>
                    {u.fullName.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={u.fullName}
                  secondary={u.email || u.department || 'Nhân viên'}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9375rem', color: isDark ? '#fff' : '#000' }}
                  secondaryTypographyProps={{ fontSize: '0.8rem' }}
                />
              </ListItemButton>
            ))}
          </Box>
        )}

        {/* Existing Conversations */}
        {filteredConversations.length === 0 && (!search || matchedUsers.length === 0) ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">Không tìm thấy đoạn chat nào</Typography>
          </Box>
        ) : (
          filteredConversations.map((c) => {
            const isSelected = c.id === activeConversationId;
            const hasUnread = Boolean(c.unreadCount && c.unreadCount > 0);
            const otherMember = c.members?.find((m) => m.userId !== currentUser?.id);
            const isOnline =
              c.type === 'Direct' && otherMember
                ? onlineUserIds.has(otherMember.userId) || otherMember.isOnline
                : false;

            return (
              <ListItemButton
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                sx={{
                  borderRadius: '12px',
                  py: 1.25,
                  px: 1.5,
                  my: 0.35,
                  backgroundColor: isSelected
                    ? isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : '#eaf3ff'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: isSelected
                      ? isDark
                        ? 'rgba(255, 255, 255, 0.12)'
                        : '#e2edfd'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {/* Avatar with Online indicator */}
                <ListItemAvatar sx={{ minWidth: 62 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    invisible={!isOnline}
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#31a24c', // Facebook Messenger online green
                        color: '#31a24c',
                        boxShadow: `0 0 0 2px ${isDark ? '#18191a' : '#fff'}`,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                      },
                    }}
                  >
                    <Avatar
                      src={c.avatarUrl}
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: c.type === 'ProjectBound' ? '#10b981' : c.type === 'Group' ? '#f59e0b' : '#a855f7',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                      }}
                    >
                      {c.type === 'ProjectBound' ? (
                        <ProjectIcon fontSize="small" />
                      ) : c.type === 'Group' ? (
                        <GroupIcon fontSize="small" />
                      ) : c.title ? (
                        c.title.charAt(0).toUpperCase()
                      ) : (
                        <PersonIcon fontSize="small" />
                      )}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>

                {/* Conversation Title & Last Message */}
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography
                        variant="body1"
                        noWrap
                        sx={{
                          fontWeight: hasUnread ? 700 : 500,
                          fontSize: '0.9375rem',
                          color: isDark ? '#E4E6EB' : '#050505',
                          maxWidth: 180,
                        }}
                      >
                        {c.title || 'Hội thoại'}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          maxWidth: 170,
                          fontWeight: hasUnread ? 700 : 400,
                          color: hasUnread ? (isDark ? '#fff' : '#000') : 'text.secondary',
                          fontSize: '0.8125rem',
                        }}
                      >
                        {c.lastMessage
                          ? `${c.lastMessage.senderId === currentUser?.id ? 'Bạn: ' : ''}${c.lastMessage.content || '[Tệp đính kèm]'}`
                          : 'Chưa có tin nhắn'}
                      </Typography>
                      {c.lastMessage && (
                        <>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>·</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', flexShrink: 0 }}>
                            {formatMessageTime(c.lastMessage.createdAt)}
                          </Typography>
                        </>
                      )}
                    </Box>
                  }
                />

                {/* Unread blue dot indicator */}
                {hasUnread && (
                  <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                    <DotIcon sx={{ fontSize: 14, color: '#a855f7' }} />
                  </Box>
                )}
              </ListItemButton>
            );
          })
        )}
      </List>
    </Box>
  );
};
