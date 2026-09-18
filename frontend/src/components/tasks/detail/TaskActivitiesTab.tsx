import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Avatar,
  CircularProgress,
  useTheme,
  TextField,
  InputAdornment,
} from '@mui/material';
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
  Search,
  Filter,
  Layers,
  Sparkles,
  Minus,
  Check,
} from 'lucide-react';
import { ActivityLog } from '../../../types';
import { getVietnameseStatus } from '../../common/StatusChip';
import { formatDateTime } from '../../../utils/dateUtils';
import { getMediaUrl } from '../../../utils/fileUtils';

interface TaskActivitiesTabProps {
  activities: ActivityLog[];
  loadingActivities: boolean;
}

const getActionConfig = (action: string | number, isDark: boolean) => {
  const actStr = String(action).toLowerCase();
  if (actStr === 'taskcreated' || actStr === '2') {
    return {
      label: 'Tạo công việc',
      type: 'create',
      color: isDark ? '#34d399' : '#059669',
      bg: isDark ? 'rgba(16, 185, 129, 0.16)' : '#ecfdf5',
      border: isDark ? 'rgba(52, 211, 153, 0.35)' : '#a7f3d0',
      icon: <PlusCircle size={13} />,
    };
  }
  if (actStr === 'statuschanged' || actStr === '5') {
    return {
      label: 'Đổi trạng thái',
      type: 'status',
      color: isDark ? '#38bdf8' : '#0284c7',
      bg: isDark ? 'rgba(2, 132, 199, 0.16)' : '#f0f9ff',
      border: isDark ? 'rgba(56, 189, 248, 0.35)' : '#bae6fd',
      icon: <CheckCircle2 size={13} />,
    };
  }
  if (actStr === 'progresschanged' || actStr === '6') {
    return {
      label: 'Cập nhật tiến độ',
      type: 'progress',
      color: isDark ? '#fbbf24' : '#d97706',
      bg: isDark ? 'rgba(245, 158, 11, 0.16)' : '#fffbeb',
      border: isDark ? 'rgba(251, 191, 36, 0.35)' : '#fde68a',
      icon: <TrendingUp size={13} />,
    };
  }
  if (actStr === 'deadlinechanged' || actStr === '7') {
    return {
      label: 'Đổi thời hạn',
      type: 'deadline',
      color: isDark ? '#a78bfa' : '#7c3aed',
      bg: isDark ? 'rgba(139, 92, 246, 0.16)' : '#f5f3ff',
      border: isDark ? 'rgba(167, 139, 250, 0.35)' : '#ddd6fe',
      icon: <Calendar size={13} />,
    };
  }
  if (actStr === 'taskassigned' || actStr === '4') {
    return {
      label: 'Gán người phụ trách',
      type: 'assign',
      color: isDark ? '#818cf8' : '#4f46e5',
      bg: isDark ? 'rgba(99, 102, 241, 0.16)' : '#eef2ff',
      border: isDark ? 'rgba(129, 140, 248, 0.35)' : '#c7d2fe',
      icon: <UserCheck size={13} />,
    };
  }
  if (actStr === 'commentadded' || actStr === '8') {
    return {
      label: 'Bình luận mới',
      type: 'comment',
      color: isDark ? '#2dd4bf' : '#0d9488',
      bg: isDark ? 'rgba(20, 184, 166, 0.16)' : '#f0fdfa',
      border: isDark ? 'rgba(45, 212, 191, 0.35)' : '#99f6e4',
      icon: <MessageSquare size={13} />,
    };
  }
  return {
    label: 'Cập nhật nội dung',
    type: 'content',
    color: isDark ? '#94a3b8' : '#475569',
    bg: isDark ? 'rgba(148, 163, 184, 0.14)' : '#f8fafc',
    border: isDark ? 'rgba(148, 163, 184, 0.3)' : '#e2e8f0',
    icon: <Edit3 size={13} />,
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const cfg = getActionConfig(act.action, isDark);
      if (filterType !== 'ALL' && cfg.type !== filterType) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const userMatch = (act.userName || '').toLowerCase().includes(q);
      const detailMatch = (act.details || '').toLowerCase().includes(q);
      const labelMatch = cfg.label.toLowerCase().includes(q);
      const oldMatch = (act.oldValue || '').toLowerCase().includes(q);
      const newMatch = (act.newValue || '').toLowerCase().includes(q);
      return userMatch || detailMatch || labelMatch || oldMatch || newMatch;
    });
  }, [activities, filterType, search, isDark]);

  if (loadingActivities) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 1.5 }}>
        <CircularProgress size={32} thickness={4} sx={{ color: '#0284c7' }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Đang tải nhật ký thay đổi...
        </Typography>
      </Box>
    );
  }

  if (activities.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 2,
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
          borderRadius: '12px',
          border: '1px dashed',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            bgcolor: isDark ? 'rgba(2, 132, 199, 0.12)' : '#e0f2fe',
            color: '#0284c7',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
          }}
        >
          <History size={26} strokeWidth={1.75} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          Chưa có nhật ký hoạt động
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360, mx: 'auto' }}>
          Tất cả các thay đổi về trạng thái, tiến độ, thời hạn và phân công sẽ được tự động ghi lại tại đây.
        </Typography>
      </Box>
    );
  }

  const filterButtons = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'progress', label: 'Tiến độ' },
    { key: 'assign', label: 'Phụ trách' },
    { key: 'deadline', label: 'Thời hạn' },
    { key: 'content', label: 'Nội dung' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header Controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Filter Chips */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          {filterButtons.map((fb) => {
            const isSelected = filterType === fb.key;
            return (
              <Chip
                key={fb.key}
                label={fb.label}
                size="small"
                onClick={() => setFilterType(fb.key)}
                sx={{
                  height: 26,
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  bgcolor: isSelected
                    ? (isDark ? 'rgba(2, 132, 199, 0.25)' : '#e0f2fe')
                    : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'),
                  color: isSelected
                    ? (isDark ? '#38bdf8' : '#0284c7')
                    : 'text.secondary',
                  border: '1px solid',
                  borderColor: isSelected
                    ? (isDark ? 'rgba(56, 189, 248, 0.4)' : '#bae6fd')
                    : 'transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isSelected
                      ? (isDark ? 'rgba(2, 132, 199, 0.35)' : '#bae6fd')
                      : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'),
                  },
                }}
              />
            );
          })}
        </Box>

        {/* Search Field */}
        {activities.length > 3 && (
          <TextField
            size="small"
            placeholder="Tìm theo nội dung, người đổi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={14} color="#94a3b8" />
                </InputAdornment>
              ),
              sx: {
                height: 32,
                fontSize: '0.8rem',
                minWidth: { xs: '100%', sm: 300 },
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
              },
            }}
          />
        )}
      </Box>

      {/* Activities Timeline */}
      {filteredActivities.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
          <Typography variant="body2">Không tìm thấy nhật ký phù hợp với bộ lọc.</Typography>
        </Box>
      ) : (
        <Box sx={{ position: 'relative', pl: 3.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Continuous Timeline Line */}
          <Box
            sx={{
              position: 'absolute',
              left: 12,
              top: 14,
              bottom: 14,
              width: 2,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
              borderRadius: 1,
            }}
          />

          {filteredActivities.map((act) => {
            const cfg = getActionConfig(act.action, isDark);
            const rawDetails = act.details || '';
            const isNameChange = rawDetails.toLowerCase().includes('đổi tên') || rawDetails.toLowerCase().includes('tên công việc');

            return (
              <Box key={act.id} sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {/* Floating Node Icon */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: -28,
                    top: 10,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#18191a' : '#ffffff',
                    border: `2px solid ${cfg.color}`,
                    color: cfg.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isDark
                      ? '0 0 0 3px rgba(0, 0, 0, 0.4)'
                      : '0 1px 4px rgba(0, 0, 0, 0.08)',
                    zIndex: 2,
                  }}
                >
                  {cfg.icon}
                </Box>

                {/* Timeline Card */}
                <Paper
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'divider',
                    bgcolor: isDark ? 'background.paper' : '#ffffff',
                    boxShadow: isDark
                      ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                      : '0 1px 4px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: cfg.border,
                      boxShadow: isDark
                        ? '0 4px 16px rgba(0, 0, 0, 0.45)'
                        : '0 3px 12px rgba(0, 0, 0, 0.06)',
                    },
                  }}
                >
                  {/* Card Header: User, Action Badge, Time */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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

                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }}
                      >
                        {act.userName || 'Hệ thống'}
                      </Typography>

                      <Chip
                        label={cfg.label}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Clock size={12} color="#94a3b8" />
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}
                      >
                        {formatDateTime(act.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Card Body Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                      fontSize: '0.825rem',
                      lineHeight: 1.5,
                      mb: act.oldValue || act.newValue ? 1.25 : 0,
                    }}
                  >
                    {cleanDetails(act.details)}
                  </Typography>

                  {/* Visual Diff Container (Old -> New) */}
                  {act.oldValue && act.newValue && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: isNameChange ? 'column' : 'row' },
                        alignItems: { xs: 'stretch', sm: isNameChange ? 'stretch' : 'center' },
                        gap: 1,
                        p: 1.25,
                        bgcolor: isDark ? 'rgba(0, 0, 0, 0.25)' : '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0',
                        mt: 0.75,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: 'text.secondary',
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          Thay đổi:
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flexWrap: 'wrap',
                          flexGrow: 1,
                          minWidth: 0,
                        }}
                      >
                        {/* Old Value Box */}
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1,
                            py: 0.4,
                            borderRadius: '6px',
                            bgcolor: isDark ? 'rgba(239, 68, 68, 0.14)' : '#fee2e2',
                            color: isDark ? '#f87171' : '#991b1b',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            maxWidth: '100%',
                            wordBreak: 'break-word',
                            lineHeight: 1.4,
                          }}
                        >
                          <Minus size={11} style={{ flexShrink: 0 }} />
                          <span>{getVietnameseStatus(act.oldValue)}</span>
                        </Box>

                        <ArrowRight size={14} color="#94a3b8" style={{ flexShrink: 0 }} />

                        {/* New Value Box */}
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1,
                            py: 0.4,
                            borderRadius: '6px',
                            bgcolor: isDark ? 'rgba(16, 185, 129, 0.14)' : '#dcfce7',
                            color: isDark ? '#34d399' : '#166534',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#bbf7d0',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            maxWidth: '100%',
                            wordBreak: 'break-word',
                            lineHeight: 1.4,
                          }}
                        >
                          <Check size={11} style={{ flexShrink: 0 }} />
                          <span>{getVietnameseStatus(act.newValue)}</span>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
