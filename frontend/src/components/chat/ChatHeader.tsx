import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  Paper,
  Badge,
  useTheme,
} from '@mui/material';
import {
  Info as InfoIcon,
  Group as GroupIcon,
  Business as ProjectIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { Conversation } from '../../types';
import { CHAT_COLORS } from '../../constants/chat.constants';

interface ChatHeaderProps {
  conversation: Conversation;
  isMediaDrawerOpen: boolean;
  onToggleMediaDrawer: () => void;
  onBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  isMediaDrawerOpen,
  onToggleMediaDrawer,
  onBack,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      square
      elevation={0}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexShrink: 0,
        px: { xs: 1, sm: 2 },
        py: { xs: 0.85, sm: 1.25 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: isDark ? CHAT_COLORS.dark.bg : CHAT_COLORS.light.bg,
      }}
    >
      {/* Conversation Avatar & Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
        {/* Mobile Back Button */}
        {onBack && (
          <Tooltip title="Quay lại danh sách chat">
            <IconButton
              onClick={onBack}
              size="small"
              sx={{
                color: 'text.secondary',
                p: { xs: 0.5, sm: 1 },
                display: { xs: 'inline-flex', md: 'none' },
                mr: -0.5,
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: CHAT_COLORS.onlineGreen,
              color: CHAT_COLORS.onlineGreen,
              boxShadow: `0 0 0 2px ${isDark ? CHAT_COLORS.dark.bg : '#fff'}`,
              width: 10,
              height: 10,
              borderRadius: '50%',
            },
          }}
        >
          <Avatar
            src={conversation.avatarUrl}
            sx={{
              width: { xs: 36, sm: 42 },
              height: { xs: 36, sm: 42 },
              bgcolor:
                conversation.type === 'ProjectBound'
                  ? CHAT_COLORS.projectGreen
                  : conversation.type === 'Group'
                  ? CHAT_COLORS.groupAmber
                  : CHAT_COLORS.primary,
              fontWeight: 600,
            }}
          >
            {conversation.type === 'ProjectBound' ? (
              <ProjectIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            ) : conversation.type === 'Group' ? (
              <GroupIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            ) : conversation.title ? (
              conversation.title.charAt(0).toUpperCase()
            ) : (
              'U'
            )}
          </Avatar>
        </Badge>

        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{
                color: isDark ? CHAT_COLORS.dark.textPrimary : CHAT_COLORS.light.textPrimary,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                maxWidth: { xs: 130, sm: 220, md: 320, lg: 'none' },
              }}
              noWrap
            >
              {conversation.title || 'Hội thoại'}
            </Typography>
            {conversation.projectName && (
              <Chip
                label={conversation.projectCode || 'Dự án'}
                size="small"
                color="success"
                variant="outlined"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              />
            )}
          </Box>

          <Typography
            variant="caption"
            noWrap
            sx={{
              color: 'text.secondary',
              display: 'block',
              fontSize: { xs: '0.68rem', sm: '0.75rem' },
            }}
          >
            {conversation.type === 'Direct'
              ? 'Đang hoạt động'
              : `${conversation.members?.length || 0} thành viên`}
          </Typography>
        </Box>
      </Box>

      {/* Messenger Right Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <Tooltip title="Thông tin về đoạn chat">
          <IconButton
            onClick={onToggleMediaDrawer}
            sx={{
              color: isMediaDrawerOpen ? CHAT_COLORS.primary : 'text.secondary',
              bgcolor: isMediaDrawerOpen
                ? isDark
                  ? 'rgba(168, 85, 247, 0.15)'
                  : '#f3e8ff'
                : 'transparent',
              p: 1,
            }}
          >
            <InfoIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};
