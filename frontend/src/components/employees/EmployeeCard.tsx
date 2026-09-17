import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Box, Typography, Avatar, Chip, IconButton, Tooltip, Divider, Button } from '@mui/material';
import { Mail, Phone, Briefcase, Edit2, Lock, Unlock, Trash2, TrendingUp, ChevronRight, KeyRound } from 'lucide-react';
import { User } from '../../types';
import { roleLabels } from '../../pages/EmployeesPage';
import { getMediaUrl } from '../../utils/fileUtils';
import { getRoleChipStyle } from '../../utils/roleColors';

interface EmployeeCardProps {
  user: User;
  workload: {
    activeTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
  canEdit?: boolean;
  canDelete?: boolean;
  canResetPassword?: boolean;
  isAdmin?: boolean;
  onEdit?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = memo(({
  user: u,
  workload,
  canEdit = false,
  canDelete = false,
  canResetPassword = false,
  isAdmin = false,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}) => {
  const allowEdit = canEdit || isAdmin;
  const allowDelete = canDelete || isAdmin;
  const allowReset = canResetPassword || isAdmin;
  const navigate = useNavigate();
  const isUserActive = u.isActive ?? true;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        bgcolor: 'background.paper',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
              : '0 10px 25px -5px rgba(2, 132, 199, 0.08), 0 8px 10px -6px rgba(2, 132, 199, 0.04)',
          transform: 'translateY(-2px)',
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top decorative stripe */}
      <Box
        sx={{
          height: 4,
          bgcolor: isUserActive ? '#0284c7' : '#94a3b8',
          width: '100%',
        }}
      />

      <CardContent sx={{ p: 1.5, pb: 1.25, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* User Info Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1.25 }}>
          <Avatar
            src={getMediaUrl(u.avatarUrl)}
            onClick={() => navigate(`/employees/${u.id}`)}
            sx={{
              width: 38,
              height: 38,
              bgcolor: isUserActive ? '#0284c7' : '#94a3b8',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.3)' : '#e0f2fe'),
              '&:hover': { opacity: 0.9 },
            }}
          >
            {u.fullName?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography
              variant="subtitle2"
              onClick={() => navigate(`/employees/${u.id}`)}
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '0.85rem',
                lineHeight: 1.25,
                '&:hover': { color: 'primary.main' },
                transition: 'color 0.15s ease',
                cursor: 'pointer',
              }}
              noWrap
              title={u.fullName}
            >
              {u.fullName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.35, flexWrap: 'wrap' }}>
              {(() => {
                const displayRole = (u.roles && u.roles.length > 0 ? u.roles[0] : null) || u.roleName || roleLabels[u.role] || u.role;
                return (
                  <Chip
                    label={displayRole}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      px: 0.25,
                      ...getRoleChipStyle(u.roleColor, displayRole),
                    }}
                  />
                );
              })()}
              <Chip
                label={isUserActive ? 'Hoạt động' : 'Đã khóa'}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  px: 0.25,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? isUserActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'
                      : isUserActive ? '#dcfce7' : '#fee2e2',
                  color: isUserActive ? '#22c55e' : '#f87171',
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Contact details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45, mb: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Mail size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }} noWrap title={u.email}>
              {u.email}
            </Typography>
          </Box>
          {u.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
              <Phone size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }} noWrap>
                {u.phone}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Briefcase size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }} noWrap>
              {u.department || 'Chưa phân ban'}
            </Typography>
          </Box>
        </Box>

        {/* Workload Stats Box */}
        <Box sx={{ p: 1, bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#141414' : '#f8fafc'), borderRadius: '6px', border: '1px solid', borderColor: 'divider', mt: 'auto' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5, fontSize: '0.675rem' }}>
            Khối Lượng Phụ Trách
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0284c7', fontSize: '0.95rem', lineHeight: 1.2 }}>
                {workload.activeTasks}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                Đang làm
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem', lineHeight: 1.2 }}>
                {workload.completedTasks}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                Đã xong
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#ef4444', fontSize: '0.95rem', lineHeight: 1.2 }}>
                {workload.overdueTasks}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                Trễ hạn
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* View Progress Action Button */}
        <Button
          size="small"
          variant="outlined"
          fullWidth
          onClick={() => navigate(`/employees/${u.id}`)}
          startIcon={<TrendingUp size={13} />}
          endIcon={<ChevronRight size={13} />}
          sx={{
            mt: 1.25,
            py: 0.35,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.75rem',
            borderRadius: '6px',
            borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.3)' : '#bae6fd'),
            color: (theme) => (theme.palette.mode === 'dark' ? '#38bdf8' : '#0284c7'),
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.08)' : '#f0f9ff'),
            '&:hover': {
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe'),
              borderColor: 'primary.main',
            },
          }}
        >
          Xem Tiến Độ
        </Button>
      </CardContent>

      {(allowReset || allowEdit || allowDelete) && (
        <Box sx={{ px: 1.5, pb: 1, pt: 0 }}>
          <Divider sx={{ mb: 0.75, borderColor: 'divider' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
            {allowReset && onResetPassword && (
              <Tooltip title="Đặt lại mật khẩu">
                <IconButton
                  size="small"
                  onClick={() => onResetPassword(u)}
                  sx={{ p: 0.4, color: '#d97706', '&:hover': { bgcolor: 'rgba(217, 119, 6, 0.1)' } }}
                >
                  <KeyRound size={14} />
                </IconButton>
              </Tooltip>
            )}

            {allowEdit && (
              <Tooltip title="Chỉnh sửa thông tin">
                <IconButton
                  size="small"
                  onClick={() => onEdit && onEdit(u)}
                  sx={{ p: 0.4, color: '#0284c7', '&:hover': { bgcolor: 'rgba(2, 132, 199, 0.1)' } }}
                >
                  <Edit2 size={14} />
                </IconButton>
              </Tooltip>
            )}

            {allowDelete && (
              <>
                <Tooltip title={isUserActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                  <IconButton
                    size="small"
                    onClick={() => onToggleStatus && onToggleStatus(u)}
                    sx={{
                      p: 0.4,
                      color: isUserActive ? '#f59e0b' : '#10b981',
                      '&:hover': { bgcolor: isUserActive ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)' },
                    }}
                  >
                    {isUserActive ? <Lock size={14} /> : <Unlock size={14} />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Xóa tài khoản">
                  <IconButton
                    size="small"
                    onClick={() => onDelete && onDelete(u)}
                    sx={{ p: 0.4, color: '#ef4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>
      )}
    </Card>
  );
});
