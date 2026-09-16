import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';
import { FolderKanban, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { EmployeeProjectParticipation } from '../../../types';

interface EmployeeStatsCardsProps {
  stats?: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    onTimeCompletionRate?: number;
    averageTaskProgress?: number;
  };
  projects: EmployeeProjectParticipation[];
}

export const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({
  stats,
  projects,
}) => {
  return (
    <Grid container spacing={2}>
      {/* Total Projects */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem' }}>
              Dự Án Tham Gia
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {stats?.totalProjects || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600, display: 'block', mt: 0.25 }}>
              {projects.filter((p) => p.projectStatus === 'InProgress').length} công trình đang thi công
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f0f9ff', color: '#0284c7' }}>
            <FolderKanban size={26} />
          </Box>
        </Paper>
      </Grid>

      {/* Total Tasks */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem' }}>
              Việc Được Giao
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {stats?.totalTasks || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, display: 'block', mt: 0.25 }}>
              {stats?.completedTasks || 0} đã xong • {stats?.inProgressTasks || 0} đang làm
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 size={26} />
          </Box>
        </Paper>
      </Grid>

      {/* Overdue Tasks */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem' }}>
              Việc Quá Hạn
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: (stats?.overdueTasks || 0) > 0 ? '#ef4444' : '#0f172a', mt: 0.5 }}>
              {stats?.overdueTasks || 0}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: (stats?.overdueTasks || 0) > 0 ? '#ef4444' : '#64748b',
                fontWeight: 600,
                display: 'block',
                mt: 0.25,
              }}
            >
              {(stats?.overdueTasks || 0) > 0 ? 'Cần xử lý gấp' : 'Đúng tiến độ'}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: (stats?.overdueTasks || 0) > 0 ? '#fef2f2' : '#f1f5f9',
              color: (stats?.overdueTasks || 0) > 0 ? '#ef4444' : '#64748b',
            }}
          >
            <AlertTriangle size={26} />
          </Box>
        </Paper>
      </Grid>

      {/* On-Time Rate & Avg Progress */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem' }}>
              Tỷ Lệ Đúng Hạn
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color:
                  (stats?.totalTasks ?? 0) === 0
                    ? '#0284c7'
                    : (stats?.onTimeCompletionRate ?? 100) >= 80
                    ? '#10b981'
                    : (stats?.onTimeCompletionRate ?? 100) >= 50
                    ? '#f59e0b'
                    : '#ef4444',
                mt: 0.5,
              }}
            >
              {(stats?.totalTasks ?? 0) === 0 ? 100 : (stats?.onTimeCompletionRate ?? 0)}%
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mt: 0.25 }}>
              Tiến độ TB: {stats?.averageTaskProgress || 0}%
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor:
                (stats?.totalTasks ?? 0) === 0
                  ? '#f0f9ff'
                  : (stats?.onTimeCompletionRate ?? 100) >= 80
                  ? '#ecfdf5'
                  : (stats?.onTimeCompletionRate ?? 100) >= 50
                  ? '#fffbeb'
                  : '#fef2f2',
              color:
                (stats?.totalTasks ?? 0) === 0
                  ? '#0284c7'
                  : (stats?.onTimeCompletionRate ?? 100) >= 80
                  ? '#10b981'
                  : (stats?.onTimeCompletionRate ?? 100) >= 50
                  ? '#f59e0b'
                  : '#ef4444',
            }}
          >
            <TrendingUp size={26} />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
