import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Box, Typography, Avatar, Chip, IconButton, Tooltip, Divider, Button } from '@mui/material';
import { Mail, Phone, Briefcase, Edit2, Lock, Unlock, Trash2, TrendingUp, ChevronRight } from 'lucide-react';
import { User } from '../../types';
import { roleLabels } from '../../pages/EmployeesPage';
import { getMediaUrl } from '../../utils/fileUtils';

interface EmployeeCardProps {
  user: User;
  workload: {
    activeTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
  isAdmin?: boolean;
  onEdit?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = memo(({
  user: u,
  workload,
  isAdmin = false,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const navigate = useNavigate();
  const isUserActive = u.isActive ?? true;

  return (
    <Card
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: isUserActive ? 1 : 0.7,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.15)',
          borderColor: '#0284c7',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, pb: 1.5 }}>
        {/* User Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 2 }}>
          <Box
            onClick={() => navigate(`/employees/${u.id}`)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flexGrow: 1, cursor: 'pointer' }}
          >
            <Avatar
              src={getMediaUrl(u.avatarUrl)}
              sx={{
                bgcolor: u.role === 'SuperAdmin' ? '#ef4444' : u.role === 'ProjectManager' ? '#0284c7' : '#10b981',
                width: 46,
                height: 46,
                fontWeight: 700,
                fontSize: '1.05rem',
              }}
            >
              {u.fullName.charAt(0)}
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  '&:hover': { color: '#0284c7' },
                  transition: 'color 0.15s ease',
                }}
                noWrap
              >
                {u.fullName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25, flexWrap: 'wrap' }}>
                <Chip
                  label={roleLabels[u.role] || u.roleName || u.role}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor: u.role === 'SuperAdmin' ? '#fee2e2' : u.role === 'ProjectManager' ? '#e0f2fe' : '#ecfdf5',
                    color: u.role === 'SuperAdmin' ? '#b91c1c' : u.role === 'ProjectManager' ? '#0369a1' : '#047857',
                  }}
                />
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

      {isAdmin && (
        <Box sx={{ px: 2, pb: 1.5, pt: 0 }}>
          <Divider sx={{ mb: 1.25, borderColor: '#f1f5f9' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            <Tooltip title="Chỉnh sửa thông tin">
              <IconButton
                size="small"
                onClick={() => onEdit && onEdit(u)}
                sx={{ color: '#0284c7', '&:hover': { bgcolor: '#e0f2fe' } }}
              >
                <Edit2 size={16} />
              </IconButton>
            </Tooltip>

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
          </Box>
        </Box>
      )}
    </Card>
  );
});
