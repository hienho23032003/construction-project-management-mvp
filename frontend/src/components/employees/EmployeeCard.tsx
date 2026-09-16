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
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: '#ffffff',
        '&:hover': {
          borderColor: '#bae6fd',
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.08), 0 8px 10px -6px rgba(2, 132, 199, 0.04)',
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

      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* User Info Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar
            src={getMediaUrl(u.avatarUrl)}
            onClick={() => navigate(`/employees/${u.id}`)}
            sx={{
              width: 48,
              height: 48,
              bgcolor: isUserActive ? '#0284c7' : '#94a3b8',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '2px solid #e0f2fe',
              '&:hover': { opacity: 0.9 },
            }}
          >
            {u.fullName?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography
                variant="subtitle1"
                onClick={() => navigate(`/employees/${u.id}`)}
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  '&:hover': { color: '#0284c7' },
                  transition: 'color 0.15s ease',
                  cursor: 'pointer',
                }}
                noWrap
              >
                {u.fullName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25, flexWrap: 'wrap' }}>
                {(() => {
                  const displayRole = (u.roles && u.roles.length > 0 ? u.roles[0] : null) || u.roleName || roleLabels[u.role] || u.role;
                  return (
                    <Chip
                      label={displayRole}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        ...getRoleChipStyle(u.roleColor, displayRole),
                      }}
                    />
                  );
                })()}
                <Chip
                  label={isUserActive ? 'Hoạt động' : 'Đã khóa'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor: isUserActive ? '#dcfce7' : '#fee2e2',
                    color: isUserActive ? '#15803d' : '#b91c1c',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Contact details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Mail size={15} color="#94a3b8" />
            <Typography variant="caption" sx={{ color: '#475569' }} noWrap>
              {u.email}
            </Typography>
          </Box>
          {u.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone size={15} color="#94a3b8" />
              <Typography variant="caption" sx={{ color: '#475569' }}>
                {u.phone}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Briefcase size={15} color="#94a3b8" />
            <Typography variant="caption" sx={{ color: '#475569' }}>
              {u.department || 'Chưa phân ban'}
            </Typography>
          </Box>
        </Box>

        {/* Workload Stats Box */}
        <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
            Khối Lượng Phụ Trách
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284c7', fontSize: '1.1rem' }}>
                {workload.activeTasks}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                Đang làm
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>
                {workload.completedTasks}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                Đã xong
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#ef4444', fontSize: '1.1rem' }}>
                {workload.overdueTasks}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
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
          startIcon={<TrendingUp size={15} />}
          endIcon={<ChevronRight size={15} />}
          sx={{
            mt: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            borderRadius: '6px',
            borderColor: '#bae6fd',
            color: '#0284c7',
            bgcolor: '#f0f9ff',
            '&:hover': {
              bgcolor: '#e0f2fe',
              borderColor: '#0284c7',
            },
          }}
        >
          Xem Tiến Độ & Dự Án
        </Button>
      </CardContent>

      {(allowReset || allowEdit || allowDelete) && (
        <Box sx={{ px: 2, pb: 1.5, pt: 0 }}>
          <Divider sx={{ mb: 1.25, borderColor: '#f1f5f9' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            {allowReset && onResetPassword && (
              <Tooltip title="Đặt lại mật khẩu">
                <IconButton
                  size="small"
                  onClick={() => onResetPassword(u)}
                  sx={{ color: '#d97706', '&:hover': { bgcolor: '#fef3c7' } }}
                >
                  <KeyRound size={16} />
                </IconButton>
              </Tooltip>
            )}

            {allowEdit && (
              <Tooltip title="Chỉnh sửa thông tin">
                <IconButton
                  size="small"
                  onClick={() => onEdit && onEdit(u)}
                  sx={{ color: '#0284c7', '&:hover': { bgcolor: '#e0f2fe' } }}
                >
                  <Edit2 size={16} />
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
                      color: isUserActive ? '#f59e0b' : '#10b981',
                      '&:hover': { bgcolor: isUserActive ? '#fef3c7' : '#dcfce7' },
                    }}
                  >
                    {isUserActive ? <Lock size={16} /> : <Unlock size={16} />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Xóa tài khoản">
                  <IconButton
                    size="small"
                    onClick={() => onDelete && onDelete(u)}
                    sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                  >
                    <Trash2 size={16} />
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
