import React from 'react';
import { Box, Typography, Chip, Paper, Avatar, CircularProgress } from '@mui/material';
import {
  History,
  Clock,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Edit3,
  UserCheck,
  PlusCircle,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { ActivityLog } from '../../../types';
import { getVietnameseStatus } from '../../common/StatusChip';
import { formatDateTime } from '../../../utils/dateUtils';
import { getMediaUrl } from '../../../utils/fileUtils';

interface TaskActivitiesTabProps {
  activities: ActivityLog[];
  loadingActivities: boolean;
}

const getActionConfig = (action: string | number) => {
  const actStr = String(action).toLowerCase();
  if (actStr === 'taskcreated' || actStr === '2') {
    return {
      label: 'Tạo công việc',
      color: '#10b981',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      icon: <PlusCircle size={12} color="#059669" />,
    };
  }
  if (actStr === 'statuschanged' || actStr === '5') {
    return {
      label: 'Đổi trạng thái',
      color: '#0284c7',
      bg: '#f0f9ff',
      border: '#bae6fd',
      icon: <CheckCircle2 size={12} color="#0284c7" />,
    };
  }
  if (actStr === 'progresschanged' || actStr === '6') {
    return {
      label: 'Cập nhật tiến độ',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      icon: <TrendingUp size={12} color="#d97706" />,
    };
  }
  if (actStr === 'deadlinechanged' || actStr === '7') {
    return {
      label: 'Đổi thời hạn',
      color: '#8b5cf6',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      icon: <Calendar size={12} color="#8b5cf6" />,
    };
  }
  if (actStr === 'taskassigned' || actStr === '4') {
    return {
      label: 'Gán người phụ trách',
      color: '#4f46e5',
      bg: '#eef2ff',
      border: '#c7d2fe',
      icon: <UserCheck size={12} color="#4f46e5" />,
    };
  }
  if (actStr === 'commentadded' || actStr === '8') {
    return {
      label: 'Bình luận mới',
      color: '#0d9488',
      bg: '#f0fdfa',
      border: '#99f6e4',
      icon: <MessageSquare size={12} color="#0d9488" />,
    };
  }
  return {
    label: 'Cập nhật công việc',
    color: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
    icon: <Edit3 size={12} color="#64748b" />,
  };
};

const cleanDetails = (details?: string) => {
  if (!details) return '';
  const cleaned = details
    .replace(/:\s*['"]?[\w\d_-]+['"]?\s*(->|→|➔|-->)\s*['"]?[\w\d_-]+['"]?/gi, '')
    .trim();
  return getVietnameseStatus(cleaned);
};

export const TaskActivitiesTab: React.FC<TaskActivitiesTabProps> = ({
  activities,
  loadingActivities,
}) => {
  if (loadingActivities) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (activities.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
        <History size={36} strokeWidth={1.5} style={{ marginBottom: 8, opacity: 0.6 }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Chưa có nhật ký thay đổi nào được ghi nhận.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ position: 'relative', pl: 3.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Timeline connecting line */}
        <Box
          sx={{
            position: 'absolute',
            left: 11,
            top: 12,
            bottom: 12,
            width: 2,
            bgcolor: '#e2e8f0',
          }}
        />

        {activities.map((act) => {
          const cfg = getActionConfig(act.action);

          return (
            <Box key={act.id} sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {/* Timeline Node Icon */}
              <Box
                sx={{
                  position: 'absolute',
                  left: -28,
                  top: 10,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: '#ffffff',
                  border: `2px solid ${cfg.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  zIndex: 1,
                }}
              >
                {cfg.icon}
              </Box>

              {/* Timeline Card */}
              <Paper
                sx={{
                  p: 2,
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  },
                }}
              >
                {/* Top Row: User & Time */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={getMediaUrl(act.userAvatarUrl) || undefined}
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: '0.7rem',
                        bgcolor: '#0284c7 !important',
                        color: '#ffffff !important',
                        fontWeight: 700,
                      }}
                    >
                      {act.userName ? act.userName.charAt(0) : 'U'}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                      {act.userName || 'Hệ thống'}
                    </Typography>
                    <Chip
                      label={cfg.label}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        bgcolor: cfg.bg,
                        color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Clock size={12} color="#94a3b8" />
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                      {formatDateTime(act.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                {/* Details Message */}
                <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem', mb: act.oldValue || act.newValue ? 1 : 0 }}>
                  {cleanDetails(act.details)}
                </Typography>

                {/* Diff changes if present */}
                {act.oldValue && act.newValue && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                      p: 1,
                      bgcolor: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #f1f5f9',
                      mt: 0.75,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                      Thay đổi:
                    </Typography>
                    <Chip
                      label={getVietnameseStatus(act.oldValue)}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        bgcolor: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                      }}
                    />
                    <ArrowRight size={13} color="#94a3b8" />
                    <Chip
                      label={getVietnameseStatus(act.newValue)}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        bgcolor: '#dcfce7',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
