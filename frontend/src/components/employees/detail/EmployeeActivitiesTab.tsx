import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Activity } from 'lucide-react';
import { EmployeeActivityLog } from '../../../types';
import { formatShortDateTime } from '../../../utils/dateUtils';

interface EmployeeActivitiesTabProps {
  activities: EmployeeActivityLog[];
}

export const EmployeeActivitiesTab: React.FC<EmployeeActivitiesTabProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>
        <Activity size={40} color="#94a3b8" style={{ marginBottom: 8 }} />
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Chưa có nhật ký hoạt động nào
        </Typography>
        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
          Các thao tác cập nhật tiến độ, hoàn thành công việc của nhân viên sẽ hiển thị tại đây.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {activities.map((act) => (
        <Paper
          key={act.id}
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1.5,
            border: '1px solid #f1f5f9',
            bgcolor: '#f8fafc',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: '50%',
              bgcolor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Activity size={16} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {act.details || act.action}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {formatShortDateTime(act.createdAt)}
              </Typography>
            </Box>
            {(act.projectName || act.taskName) && (
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                {act.projectName && <span>Dự án: <strong>{act.projectName}</strong></span>}
                {act.projectName && act.taskName && ' • '}
                {act.taskName && <span>Công việc: <strong>{act.taskName}</strong></span>}
              </Typography>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
