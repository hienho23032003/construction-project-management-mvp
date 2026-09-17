import React, { memo } from 'react';
import { Box, Typography, Paper, Chip, Avatar } from '@mui/material';
import { ChevronRight, CheckSquare } from 'lucide-react';
import { ActivityLog } from '../../types';
import { getVietnameseStatus } from '../common/StatusChip';
import { formatDateTime } from '../../utils/dateUtils';
import { getMediaUrl } from '../../utils/fileUtils';

interface ProjectActivitiesTabProps {
  activities: ActivityLog[];
  onSelectTask?: (taskId: string) => void;
}

const formatLogDetails = (details?: string) => {
  if (!details) return '';
  // Remove redundant trailing ': StatusA -> StatusB' or ': StatusA → StatusB'
  return details
    .replace(/:\s*['"]?[\w\d_-]+['"]?\s*(->|→|➔|-->)\s*['"]?[\w\d_-]+['"]?/gi, '')
    .trim();
};

export const ProjectActivitiesTab: React.FC<ProjectActivitiesTabProps> = memo(({ activities, onSelectTask }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
        Lịch Sử Biến Động Công Trình
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {activities.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Chưa có nhật ký hoạt động nào.
          </Typography>
        ) : (
          activities.map((act) => {
            const hasTask = Boolean(act.taskId && onSelectTask);

            return (
              <Paper
                key={act.id}
                onClick={() => {
                  if (hasTask && act.taskId && onSelectTask) {
                    onSelectTask(act.taskId);
                  }
                }}
                sx={{
                  p: 2,
                  borderRadius: '8px',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#141414' : '#f8fafc',
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: hasTask ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  '&:hover': hasTask
                    ? {
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.08)' : '#f0f9ff',
                        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.4)' : '#bae6fd',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)',
                      }
                    : {},
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                      <Avatar
                        src={getMediaUrl(act.userAvatarUrl) || undefined}
                        sx={{
                          width: 22,
                          height: 22,
                          fontSize: '0.65rem',
                          bgcolor: '#0284c7',
                          color: '#ffffff',
                          fontWeight: 700,
                        }}
                      >
                        {act.userName ? act.userName.charAt(0) : 'U'}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {act.userName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {formatLogDetails(act.details)}
                      </Typography>
                      {act.taskName && (
                        <Chip
                          icon={<CheckSquare size={13} style={{ marginLeft: 4 }} />}
                          label={act.taskName}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.16)' : '#e0f2fe',
                            color: (theme) => theme.palette.mode === 'dark' ? '#38bdf8' : '#0369a1',
                            border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid #bae6fd',
                          }}
                        />
                      )}
                    </Box>

                    {act.oldValue && act.newValue && (
                      <Typography variant="caption" sx={{ color: '#0284c7', display: 'block', fontWeight: 600, mt: 0.5 }}>
                        Thay đổi: {getVietnameseStatus(act.oldValue)} ➔ {getVietnameseStatus(act.newValue)}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      {formatDateTime(act.createdAt)}
                    </Typography>
                    {hasTask && (
                      <ChevronRight size={16} color="#0284c7" />
                    )}
                  </Box>
                </Box>
              </Paper>
            );
          })
        )}
      </Box>
    </Box>
  );
});

