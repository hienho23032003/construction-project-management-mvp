import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, Avatar, Chip, Button } from '@mui/material';
import { Mail, Phone, Building2, TrendingUp, ListTodo, KeyRound } from 'lucide-react';
import { User } from '../../../types';
import { getRoleChipStyle } from '../../../utils/roleColors';
import { roleLabels } from '../../../pages/EmployeesPage';
import { getMediaUrl } from '../../../utils/fileUtils';

interface EmployeeHeaderProps {
  user: User & { roleColor?: string; roleName?: string };
  canResetPassword: boolean;
  onOpenResetPassword: () => void;
}

export const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
  user,
  canResetPassword,
  onOpenResetPassword,
}) => {
  const displayRole =
    (user.roles && user.roles.length > 0 ? user.roles[0] : null) ||
    user.roleName ||
    roleLabels[user.role] ||
    user.role;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 2.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <Avatar
          src={getMediaUrl(user.avatarUrl)}
          sx={{
            width: { xs: 60, sm: 72 },
            height: { xs: 60, sm: 72 },
            bgcolor: '#0284c7',
            fontSize: { xs: '1.5rem', sm: '1.8rem' },
            fontWeight: 800,
            border: '3px solid',
            borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.3)' : '#e0f2fe'),
          }}
        >
          {user.fullName.charAt(0)}
        </Avatar>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.25rem', sm: '1.5rem' }, color: 'text.primary' }}>
              {user.fullName}
            </Typography>
            <Chip
              label={displayRole}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                ...getRoleChipStyle(user.roleColor, displayRole),
              }}
            />
            <Chip
              label={user.isActive ? 'Đang hoạt động' : 'Đã khóa'}
              size="small"
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? user.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'
                    : user.isActive ? '#ecfdf5' : '#fef2f2',
                color: user.isActive ? '#22c55e' : '#ef4444',
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 3 }, flexWrap: 'wrap', color: 'text.secondary', fontSize: '0.8125rem' }}>
            {user.department && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Building2 size={15} color="#0284c7" />
                <span>{user.department}</span>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Mail size={15} color="#0284c7" />
              <span>{user.email}</span>
            </Box>
            {user.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Phone size={15} color="#0284c7" />
                <span>{user.phone}</span>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
        {canResetPassword && (
          <Button
            variant="outlined"
            size="small"
            color="warning"
            onClick={onOpenResetPassword}
            startIcon={<KeyRound size={16} />}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              color: '#d97706',
              borderColor: '#fcd34d',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(217, 119, 6, 0.15)' : '#fffbeb'),
              '&:hover': {
                borderColor: '#d97706',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(217, 119, 6, 0.25)' : '#fef3c7'),
              },
            }}
          >
            Đặt Lại Mật Khẩu
          </Button>
        )}
        <Button
          variant="outlined"
          size="small"
          component={RouterLink}
          to="/gantt"
          startIcon={<TrendingUp size={16} />}
          sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
        >
          Xem trên Gantt
        </Button>
        <Button
          variant="contained"
          size="small"
          component={RouterLink}
          to="/tasks"
          startIcon={<ListTodo size={16} />}
          sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
        >
          Tất Cả Công Việc
        </Button>
      </Box>
    </Paper>
  );
};
