import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Popover,
  Typography,
  List,
  ListItem,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { NotificationItem } from '../types';
import { useNotifications } from '../contexts/NotificationContext';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatShortDateTime } from '../utils/dateUtils';

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  anchorEl,
  onClose,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, hasMore, loadMore, loadingMore } =
    useNotifications();

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
    onClose();

    const isComment =
      n.type === 'CommentAdded' ||
      (n.title && (n.title.toLowerCase().includes('bình luận') || n.title.toLowerCase().includes('trao đổi')));

    if (n.referenceType === 'Project') {
      if (n.referenceId) {
        navigate(`/projects/${n.referenceId}`);
      } else {
        navigate('/projects');
      }
    } else if (n.referenceType === 'Task' || n.type !== 'ProjectAssigned') {
      if (n.referenceId) {
        navigate(`/tasks?taskId=${n.referenceId}${isComment ? '&tab=comments' : ''}`);
      } else {
        navigate('/tasks');
      }
    } else if (n.referenceId) {
      navigate(`/projects/${n.referenceId}`);
    } else {
      navigate('/tasks');
    }
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: 460,
          borderRadius: '8px',
          boxShadow: isDark
            ? '0 10px 25px rgba(0,0,0,0.6)'
            : '0 10px 25px rgba(0,0,0,0.1)',
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Thông Báo Hệ Thống
        </Typography>
        {unreadCount > 0 && (
          <Typography
            variant="caption"
            onClick={markAllAsRead}
            sx={{ color: isDark ? '#2d88ff' : '#0284c7', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            Đọc tất cả
          </Typography>
        )}
      </Box>
      <List sx={{ p: 0, maxHeight: 380, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">Không có thông báo mới.</Typography>
          </Box>
        ) : (
          <>
            {notifications.map((n: NotificationItem) => (
              <ListItem
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: n.isRead
                    ? 'transparent'
                    : isDark
                    ? 'rgba(45, 136, 255, 0.1)'
                    : '#f0f9ff',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: isDark ? '#3a3b3c' : '#f1f5f9',
                  },
                  transition: 'background-color 0.15s ease',
                  position: 'relative',
                }}
              >
                {!n.isRead && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: isDark ? '#2d88ff' : '#0284c7',
                    }}
                  />
                )}
                <Box sx={{ width: '100%', pl: n.isRead ? 0 : 0.75 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.8rem', color: 'text.primary' }}>
                      {n.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                      {formatShortDateTime(n.createdAt)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    {n.message}
                  </Typography>
                </Box>
              </ListItem>
            ))}
            {hasMore && (
              <Box sx={{ p: 1.5, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button
                  size="small"
                  disabled={loadingMore}
                  onClick={loadMore}
                  sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: isDark ? '#2d88ff' : '#0284c7' }}
                >
                  {loadingMore ? <CircularProgress size={16} /> : 'Tải thêm thông báo...'}
                </Button>
              </Box>
            )}
          </>
        )}
      </List>
    </Popover>
  );
};
