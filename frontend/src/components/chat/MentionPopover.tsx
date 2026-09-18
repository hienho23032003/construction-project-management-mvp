import React, { useEffect, useRef } from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { User, TaskItem, Project } from '../../types';

interface MentionPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  mentionMode: 'user' | 'task' | 'project' | null;
  filteredUsers: User[];
  filteredTasks: TaskItem[];
  filteredProjects: Project[];
  selectedIndex: number;
  onHoverIndex: (index: number) => void;
  onSelectUser: (user: User) => void;
  onSelectTask: (task: TaskItem) => void;
  onSelectProject: (project: Project) => void;
}

export const MentionPopover: React.FC<MentionPopoverProps> = ({
  open,
  anchorEl,
  onClose,
  mentionMode,
  filteredUsers,
  filteredTasks,
  filteredProjects,
  selectedIndex,
  onHoverIndex,
  onSelectUser,
  onSelectTask,
  onSelectProject,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const selectedItemRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll the selected item into view when navigating with Arrow Up/Down
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  if (!open || !mentionMode) return null;

  const hasItems =
    (mentionMode === 'user' && filteredUsers.length > 0) ||
    (mentionMode === 'task' && filteredTasks.length > 0) ||
    (mentionMode === 'project' && filteredProjects.length > 0);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            width: 320,
            maxHeight: 280,
            borderRadius: '14px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            pointerEvents: 'auto',
          },
        },
      }}
      sx={{
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 0.8,
          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption" fontWeight={700} color="text.secondary">
          {mentionMode === 'user'
            ? 'Nhắc tên thành viên (@)'
            : mentionMode === 'task'
            ? 'Gắn thẻ công việc (#)'
            : 'Gắn thẻ dự án (!)'}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
          ↑↓ di chuyển • Enter chọn
        </Typography>
      </Box>

      <List dense sx={{ py: 0.5, maxHeight: 230, overflowY: 'auto' }}>
        {!hasItems ? (
          <Box sx={{ py: 2.5, px: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="caption">Không tìm thấy kết quả phù hợp</Typography>
          </Box>
        ) : null}

        {mentionMode === 'user' &&
          filteredUsers.map((u, index) => {
            const isSelected = index === selectedIndex;
            return (
              <ListItemButton
                key={u.id}
                ref={isSelected ? selectedItemRef : undefined}
                selected={isSelected}
                onClick={() => onSelectUser(u)}
                onMouseEnter={() => onHoverIndex(index)}
                sx={{
                  mx: 0.5,
                  my: 0.25,
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(168, 85, 247, 0.25)' : 'rgba(168, 85, 247, 0.12)',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(168, 85, 247, 0.35)' : 'rgba(168, 85, 247, 0.2)',
                    },
                  },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 36 }}>
                  <Avatar
                    src={u.avatarUrl}
                    sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#8b5cf6' }}
                  >
                    {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={u.fullName}
                  secondary={u.department || u.email}
                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItemButton>
            );
          })}

        {mentionMode === 'task' &&
          filteredTasks.map((t, index) => {
            const isSelected = index === selectedIndex;
            return (
              <ListItemButton
                key={t.id}
                ref={isSelected ? selectedItemRef : undefined}
                selected={isSelected}
                onClick={() => onSelectTask(t)}
                onMouseEnter={() => onHoverIndex(index)}
                sx={{
                  mx: 0.5,
                  my: 0.25,
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.2)',
                    },
                  },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 36 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#10b981' }}>
                    <TaskIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={t.name}
                  secondary={t.projectName || 'Công việc'}
                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItemButton>
            );
          })}

        {mentionMode === 'project' &&
          filteredProjects.map((p, index) => {
            const isSelected = index === selectedIndex;
            return (
              <ListItemButton
                key={p.id}
                ref={isSelected ? selectedItemRef : undefined}
                selected={isSelected}
                onClick={() => onSelectProject(p)}
                onMouseEnter={() => onHoverIndex(index)}
                sx={{
                  mx: 0.5,
                  my: 0.25,
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.12)',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.2)',
                    },
                  },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 36 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#f59e0b' }}>
                    <BusinessIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${p.code} - ${p.name}`}
                  secondary={p.statusName || 'Dự án'}
                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItemButton>
            );
          })}
      </List>
    </Popover>
  );
};
