import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Tooltip,
  useTheme,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  NotificationsOff as MuteIcon,
  Notifications as UnmuteIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Link as LinkIcon,
  Lock as LockIcon,
  Download as DownloadIcon,
  Business as ProjectIcon,
  Group as GroupIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { Conversation, ChatMediaItem, ChatMessageAttachment } from '../../types';
import { chatApi } from '../../services/api/endpoints';

interface ChatMediaDrawerProps {
  open: boolean;
  onClose?: () => void;
  conversation: Conversation | null;
  onImageClick?: (attachment: ChatMessageAttachment) => void;
  onSearchClick?: () => void;
  currentUserId?: string;
  isInline?: boolean;
}

export const ChatMediaDrawer: React.FC<ChatMediaDrawerProps> = ({
  open,
  onClose,
  conversation,
  onImageClick,
  onSearchClick,
  currentUserId,
  isInline = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { showSuccess, showInfo } = useToast();

  const [images, setImages] = useState<ChatMediaItem[]>([]);
  const [documents, setDocuments] = useState<ChatMediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (!conversation) return false;
    const stored = localStorage.getItem(`chat_muted_${conversation.id}`);
    if (stored !== null) return stored === 'true';
    return Boolean(conversation.isMuted);
  });

  useEffect(() => {
    if (conversation) {
      const stored = localStorage.getItem(`chat_muted_${conversation.id}`);
      if (stored !== null) {
        setIsMuted(stored === 'true');
      } else {
        setIsMuted(Boolean(conversation.isMuted));
      }
    }
  }, [conversation?.id, conversation?.isMuted]);

  const handleToggleMute = () => {
    if (!conversation) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem(`chat_muted_${conversation.id}`, String(nextMuted));
    if (nextMuted) {
      showInfo('Đã tắt thông báo cho cuộc trò chuyện này.');
    } else {
      showSuccess('Đã bật lại thông báo cho cuộc trò chuyện này.');
    }
  };

  const handleProfileClick = () => {
    if (!conversation) return;
    if (conversation.type === 'Direct') {
      const otherMember =
        conversation.members?.find((m) => m.userId !== currentUserId) ||
        conversation.members?.[0];
      if (otherMember?.userId) {
        navigate(`/employees/${otherMember.userId}`);
        return;
      }
    } else if (conversation.projectId) {
      navigate(`/projects/${conversation.projectId}`);
      return;
    }
    navigate('/employees');
  };

  useEffect(() => {
    if (open && conversation) {
      setLoading(true);
      Promise.all([
        chatApi.getMedia(conversation.id, 'image'),
        chatApi.getMedia(conversation.id, 'document'),
      ])
        .then(([imgRes, docRes]) => {
          if (imgRes.data.success && imgRes.data.data) setImages(imgRes.data.data);
          if (docRes.data.success && docRes.data.data) setDocuments(docRes.data.data);
        })
        .catch((err) => console.error('Failed to load media:', err))
        .finally(() => setLoading(false));
    }
  }, [open, conversation]);

  if (!open || !conversation) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const content = (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        backgroundColor: isDark ? '#18191a' : '#FFFFFF',
        color: isDark ? '#E4E6EB' : '#050505',
        p: 2,
        userSelect: 'none',
      }}
    >
      {/* Mobile close button */}
      {!isInline && onClose && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      {/* 1. Centered Profile Card */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
        <Avatar
          src={conversation.avatarUrl}
          sx={{
            width: 80,
            height: 80,
            bgcolor: conversation.type === 'ProjectBound' ? '#10b981' : conversation.type === 'Group' ? '#f59e0b' : '#a855f7',
            fontSize: '1.8rem',
            fontWeight: 700,
            mb: 1.5,
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}
        >
          {conversation.type === 'ProjectBound' ? (
            <ProjectIcon sx={{ fontSize: 40 }} />
          ) : conversation.type === 'Group' ? (
            <GroupIcon sx={{ fontSize: 40 }} />
          ) : conversation.title ? (
            conversation.title.charAt(0).toUpperCase()
          ) : (
            <PersonIcon sx={{ fontSize: 40 }} />
          )}
        </Avatar>

        <Typography variant="h6" fontWeight={700} align="center" sx={{ fontSize: '1.15rem' }}>
          {conversation.title || 'Hội thoại'}
        </Typography>

        {/* Encrypted badge / active status */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            px: 1.25,
            py: 0.35,
            borderRadius: '12px',
            mt: 0.75,
          }}
        >
          <LockIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 500 }}>
            Được mã hóa đầu cuối
          </Typography>
        </Box>
      </Box>

      {/* 2. Three Circular Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, my: 2.5 }}>
        {/* Profile Button */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={conversation.type === 'Direct' ? 'Xem hồ sơ nhân sự' : conversation.projectId ? 'Xem chi tiết dự án' : 'Xem danh sách nhân sự'}>
            <IconButton
              onClick={handleProfileClick}
              sx={{
                width: 40,
                height: 40,
                bgcolor: isDark ? '#3a3b3c' : '#f0f2f5',
                color: isDark ? '#e4e6eb' : '#050505',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isDark ? '#4e4f50' : '#e4e6eb',
                  transform: 'scale(1.06)',
                },
              }}
            >
              <PersonIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
            Trang cá nhân
          </Typography>
        </Box>

        {/* Mute Notifications Button */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={isMuted ? 'Bật thông báo' : 'Tắt thông báo'}>
            <IconButton
              onClick={handleToggleMute}
              sx={{
                width: 40,
                height: 40,
                bgcolor: isMuted
                  ? isDark
                    ? 'rgba(239, 68, 68, 0.2)'
                    : '#fee2e2'
                  : isDark
                  ? '#3a3b3c'
                  : '#f0f2f5',
                color: isMuted ? 'error.main' : isDark ? '#e4e6eb' : '#050505',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isMuted
                    ? isDark
                      ? 'rgba(239, 68, 68, 0.3)'
                      : '#fecaca'
                    : isDark
                    ? '#4e4f50'
                    : '#e4e6eb',
                  transform: 'scale(1.06)',
                },
              }}
            >
              {isMuted ? <MuteIcon sx={{ fontSize: 20 }} /> : <UnmuteIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.72rem',
              color: isMuted ? 'error.main' : 'text.secondary',
              fontWeight: isMuted ? 600 : 400,
            }}
          >
            {isMuted ? 'Bật thông báo' : 'Tắt thông báo'}
          </Typography>
        </Box>

        {/* Search In Chat Button */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Tìm kiếm tin nhắn trong đoạn chat">
            <IconButton
              onClick={onSearchClick}
              sx={{
                width: 40,
                height: 40,
                bgcolor: isDark ? '#3a3b3c' : '#f0f2f5',
                color: isDark ? '#e4e6eb' : '#050505',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isDark ? '#4e4f50' : '#e4e6eb',
                  transform: 'scale(1.06)',
                },
              }}
            >
              <SearchIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
            Tìm kiếm
          </Typography>
        </Box>
      </Box>

      {/* 3. Messenger Accordion Menus */}
      <Box sx={{ mt: 1 }}>
        {/* Accordion 1: Thông tin về đoạn chat (mặc định đóng) */}
        <Accordion
          disableGutters
          elevation={0}
          sx={{
            bgcolor: 'transparent',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />} sx={{ px: 1 }}>
            <Typography variant="body2" fontWeight={700}>
              Thông tin về đoạn chat
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 1, pt: 0 }}>
            <List dense disablePadding>
              {conversation.projectName && (
                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <ProjectIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={conversation.projectName}
                    secondary={`Mã: ${conversation.projectCode}`}
                    primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                  />
                </ListItem>
              )}

              {conversation.members?.map((m) => (
                <ListItem disableGutters key={m.userId} sx={{ py: 0.5 }}>
                  <ListItemAvatar sx={{ minWidth: 36 }}>
                    <Avatar src={m.avatarUrl} sx={{ width: 26, height: 26, fontSize: '0.75rem', bgcolor: '#a855f7' }}>
                      {m.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={m.fullName}
                    secondary={m.role === 'Admin' ? 'Quản trị viên' : 'Thành viên'}
                    primaryTypographyProps={{ fontSize: '0.85rem' }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Accordion 2: File phương tiện và file */}
        <Accordion
          disableGutters
          elevation={0}
          defaultExpanded
          sx={{
            bgcolor: 'transparent',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />} sx={{ px: 1 }}>
            <Typography variant="body2" fontWeight={700}>
              File phương tiện và file
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 1, pt: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            ) : (
              <>
                {/* Images grid */}
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  File phương tiện ({images.length})
                </Typography>
                {images.length === 0 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Chưa có ảnh hoặc video
                  </Typography>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75, mb: 2 }}>
                    {images.slice(0, 9).map((img) => (
                      <Box
                        key={img.id}
                        component="img"
                        src={img.filePath}
                        alt={img.fileName}
                        onClick={() => onImageClick?.(img as any)}
                        sx={{
                          width: '100%',
                          height: 70,
                          objectFit: 'cover',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.85 },
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* Documents list */}
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  File & Tài liệu ({documents.length})
                </Typography>
                {documents.length === 0 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Chưa có tài liệu đính kèm
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {documents.slice(0, 5).map((doc) => (
                      <ListItem
                        key={doc.id}
                        disableGutters
                        secondaryAction={
                          <IconButton size="small" component="a" href={doc.filePath} download={doc.fileName} target="_blank">
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        }
                        sx={{ py: 0.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <FileIcon sx={{ fontSize: 18, color: '#a855f7' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.fileName}
                          secondary={formatFileSize(doc.fileSize)}
                          primaryTypographyProps={{ fontSize: '0.8rem', noWrap: true, maxWidth: 160 }}
                          secondaryTypographyProps={{ fontSize: '0.7rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        width: 340,
        height: '100%',
        flexShrink: 0,
        borderLeft: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {content}
    </Box>
  );
};
