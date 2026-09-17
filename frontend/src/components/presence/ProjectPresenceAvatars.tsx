import React from 'react';
import {
  Box,
  Avatar,
  AvatarGroup,
  Tooltip,
  Typography,
  Chip,
  Badge,
} from '@mui/material';
import { Users, Edit3 } from 'lucide-react';
import { useProjectPresenceQuery } from '../../hooks/usePresence';
import { useAuth } from '../../contexts/AuthContext';
import { getMediaUrl } from '../../utils/fileUtils';

interface ProjectPresenceAvatarsProps {
  projectId?: string;
  max?: number;
  size?: number;
}

export const ProjectPresenceAvatars: React.FC<ProjectPresenceAvatarsProps> = ({
  projectId,
  max = 4,
  size = 30,
}) => {
  const { user: currentUser } = useAuth();
  const { data: presence } = useProjectPresenceQuery(projectId);

  if (!projectId || !presence || !presence.activeUsers || presence.activeUsers.length === 0) {
    return null;
  }

  const activeUsers = presence.activeUsers;
  // Put other users first
  const sortedUsers = [...activeUsers].sort((a, b) => {
    if (a.userId === currentUser?.id) return 1;
    if (b.userId === currentUser?.id) return -1;
    return 0;
  });

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1.25,
        py: 0.5,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#141414' : '#f8fafc',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '20px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
        <Users size={14} />
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>
          Đang xem ({activeUsers.length})
        </Typography>
      </Box>

      <AvatarGroup
        max={max}
        sx={{
          '& .MuiAvatar-root': {
            width: size,
            height: size,
            fontSize: '0.75rem',
            border: '2px solid',
            borderColor: 'background.paper',
            fontWeight: 600,
          },
        }}
      >
        {sortedUsers.map((u) => {
          const isMe = u.userId === currentUser?.id;
          const isEditing = u.isEditing && u.editingTaskId;

          const tooltipTitle = (
            <Box sx={{ p: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                {u.userName} {isMe && '(Bạn)'}
              </Typography>
              {u.userDepartment && (
                <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled' }}>
                  {u.userDepartment} {u.userRole && `• ${u.userRole}`}
                </Typography>
              )}
              {isEditing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, color: '#fbbf24' }}>
                  <Edit3 size={12} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Đang sửa: {u.editingTaskName || 'công việc'}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic', display: 'block', mt: 0.25 }}>
                  Đang xem dự án
                </Typography>
              )}
            </Box>
          );

          return (
            <Tooltip key={u.userId} title={tooltipTitle} arrow placement="top">
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: isEditing ? '#f59e0b' : '#10b981',
                    color: isEditing ? '#f59e0b' : '#10b981',
                    boxShadow: '0 0 0 1.5px rgba(0,0,0,0.5)',
                    width: 7,
                    height: 7,
                    minWidth: 7,
                    borderRadius: '50%',
                  },
                }}
              >
                <Avatar
                  src={getMediaUrl((isMe && currentUser?.avatarUrl) ? currentUser.avatarUrl : u.userAvatarUrl)}
                  sx={{
                    bgcolor: isMe ? '#0284c7' : '#6366f1',
                    color: '#ffffff',
                  }}
                >
                  {u.userName ? u.userName.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </Badge>
            </Tooltip>
          );
        })}
      </AvatarGroup>
    </Box>
  );
};

interface CoEditingWarningBannerProps {
  projectId?: string;
  taskId?: string;
}

export const CoEditingWarningBanner: React.FC<CoEditingWarningBannerProps> = ({
  projectId,
  taskId,
}) => {
  const { user: currentUser } = useAuth();
  const { data: presence } = useProjectPresenceQuery(projectId);

  if (!projectId || !taskId || !presence || !presence.activeEditors) {
    return null;
  }

  // Find other users editing the same task
  const otherEditors = presence.activeEditors.filter(
    (e) => e.taskId === taskId && e.userId !== currentUser?.id
  );

  if (otherEditors.length === 0) {
    return null;
  }

  const editorNames = otherEditors.map((e) => e.userName).join(', ');

  return (
    <Box
      sx={{
        mb: 2,
        p: 1.5,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
        border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid #fde68a',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          p: 0.75,
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.25)' : '#fef3c7',
          color: '#d97706',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Edit3 size={16} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: (theme) => theme.palette.mode === 'dark' ? '#fcd34d' : '#92400e', fontSize: '0.85rem' }}>
          Cảnh báo: Có người đang chỉnh sửa công việc này!
        </Typography>
        <Typography variant="caption" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#fbbf24' : '#b45309' }}>
          Đồng nghiệp <strong>{editorNames}</strong> cũng đang mở form sửa công việc này. Vui lòng kiểm tra hoặc lưu ý để tránh ghi đè dữ liệu của nhau.
        </Typography>
      </Box>
      <Chip
        size="small"
        label="Đang sửa"
        color="warning"
        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
      />
    </Box>
  );
};
