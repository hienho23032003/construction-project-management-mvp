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
import { Users, Edit3, Eye } from 'lucide-react';
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
            <Box sx={{ p: 0.5, minWidth: 180 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#ffffff', lineHeight: 1.3 }}>
                  {u.userName}
                </Typography>
                {isMe && (
                  <Chip
                    label="Bạn"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      bgcolor: '#0284c7',
                      color: '#ffffff',
                      px: 0.25,
                    }}
                  />
                )}
              </Box>

              {(u.userDepartment || u.userRole) && (
                <Typography sx={{ display: 'block', color: '#cbd5e1', fontSize: '0.72rem', lineHeight: 1.3, mb: 0.75 }}>
                  {u.userDepartment} {u.userRole && u.userDepartment ? `• ${u.userRole}` : (u.userRole || '')}
                </Typography>
              )}

              {isEditing ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(245, 158, 11, 0.18)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#fbbf24',
                  }}
                >
                  <Edit3 size={13} style={{ flexShrink: 0 }} />
                  <Typography sx={{ fontWeight: 600, fontSize: '0.72rem', color: '#fbbf24' }}>
                    Đang sửa: <strong>{u.editingTaskName || 'công việc'}</strong>
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.25 }}>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: '#10b981',
                      boxShadow: '0 0 6px #10b981',
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.72rem' }}>
                    Đang xem dự án
                  </Typography>
                </Box>
              )}
            </Box>
          );

          return (
            <Tooltip
              key={u.userId}
              title={tooltipTitle}
              arrow
              placement="top"
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: '#0f172a',
                    color: '#f8fafc',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    p: 1.25,
                    borderRadius: 2,
                    maxWidth: 280,
                  },
                },
                arrow: {
                  sx: {
                    color: '#0f172a',
                    '&::before': {
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    },
                  },
                },
              }}
            >
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
