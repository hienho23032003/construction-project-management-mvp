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
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem' }}>
              Dự Án Tham Gia
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
              {stats?.totalProjects || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600, display: 'block', mt: 0.25 }}>
              {projects.filter((p) => p.projectStatus === 'InProgress').length} công trình đang thi công
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(2, 132, 199, 0.15)' : '#f0f9ff', color: '#0284c7' }}>
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
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem' }}>
              Việc Được Giao
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
              {stats?.totalTasks || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, display: 'block', mt: 0.25 }}>
              {stats?.completedTasks || 0} đã xong • {stats?.inProgressTasks || 0} đang làm
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5', color: '#10b981' }}>
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
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem' }}>
              Việc Quá Hạn
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: (stats?.overdueTasks || 0) > 0 ? '#ef4444' : 'text.primary', mt: 0.5 }}>
              {stats?.overdueTasks || 0}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: (stats?.overdueTasks || 0) > 0 ? '#ef4444' : 'text.secondary',
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
              bgcolor: (theme) =>
                (stats?.overdueTasks || 0) > 0
                  ? theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2'
                  : theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.15)' : '#f1f5f9',
              color: (stats?.overdueTasks || 0) > 0 ? '#ef4444' : 'text.secondary',
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
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem' }}>
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
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mt: 0.25 }}>
              Tiến độ TB: {stats?.averageTaskProgress || 0}%
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: (theme) =>
                (stats?.totalTasks ?? 0) === 0
                  ? theme.palette.mode === 'dark' ? 'rgba(2, 132, 199, 0.15)' : '#f0f9ff'
                  : (stats?.onTimeCompletionRate ?? 100) >= 80
                  ? theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5'
                  : (stats?.onTimeCompletionRate ?? 100) >= 50
                  ? theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb'
                  : theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
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
