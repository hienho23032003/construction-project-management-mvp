import React, { memo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { format } from 'date-fns';
import { ActivityLog } from '../../types';
import { getVietnameseStatus } from '../common/StatusChip';

interface ProjectActivitiesTabProps {
  activities: ActivityLog[];
}

export const ProjectActivitiesTab: React.FC<ProjectActivitiesTabProps> = memo(({ activities }) => {
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
          activities.map((act) => (
            <Paper key={act.id} sx={{ p: 2, borderRadius: '8px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {act.userName}{' '}
                  <span style={{ fontWeight: 400, color: '#475569' }}>{act.details}</span>
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  {format(new Date(act.createdAt), 'HH:mm dd/MM/yyyy')}
                </Typography>
              </Box>
              {act.oldValue && act.newValue && (
                <Typography variant="caption" sx={{ color: '#0284c7', mt: 0.5, display: 'block' }}>
                  Thay đổi: {getVietnameseStatus(act.oldValue)} ➔ {getVietnameseStatus(act.newValue)}
                </Typography>
              )}
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
});
