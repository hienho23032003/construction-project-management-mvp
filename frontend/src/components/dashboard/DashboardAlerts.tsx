import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { AlertTriangle, Calendar } from 'lucide-react';
import { DashboardSummary } from '../../types';
import { CommonCard, CommonButton, CommonChip, ProgressBar } from '../common';
import { formatDate } from '../../utils/dateUtils';

interface DashboardAlertsProps {
  data: DashboardSummary;
  onSelectTask?: (taskId: string) => void;
}

export const DashboardAlerts: React.FC<DashboardAlertsProps> = memo(({ data, onSelectTask }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleTaskClick = (taskId: string) => {
    if (onSelectTask) {
      onSelectTask(taskId);
    } else {
      navigate(`/tasks?taskId=${taskId}`);
    }
  };

  return (
    <Grid container spacing={{ xs: 2, md: 2.5 }}>
      {/* Critical Overdue Tasks */}
      <Grid item xs={12} md={6}>
        <CommonCard
          title={`Cảnh Báo Công Việc Quá Hạn (${data.criticalOverdueTasks.length})`}
          headerIcon={<AlertTriangle size={18} color="#ef4444" />}
          action={
            <CommonButton
              size="small"
              variant="dangerOutline"
              onClick={() => navigate('/tasks')}
            >
              Chi tiết
            </CommonButton>
          }
          sx={{
            height: '100%',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : '#fee2e2',
          }}
        >
          {data.criticalOverdueTasks.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
              Không có công việc nào bị quá hạn. Tiến độ rất tốt!
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                maxHeight: 340,
                overflowY: 'auto',
                pr: 0.5,
              }}
            >
              {data.criticalOverdueTasks.map((task) => (
                <Box
                  key={task.taskId}
                  onClick={() => handleTaskClick(task.taskId)}
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
                    bgcolor: isDark ? '#18191a' : '#f8fafc',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isDark ? '#3a3b3c' : '#fff1f2',
                      borderColor: '#f87171',
                    },
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75, gap: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <CommonChip
                        label={task.projectCode}
                        colorVariant="danger"
                        size="small"
                        sx={{ mr: 1, verticalAlign: 'middle', height: 20 }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', wordBreak: 'break-word', display: 'inline' }}>
                        {task.taskName}
                      </Typography>
                    </Box>
                    <CommonChip
                      label={`Trễ ${task.overdueDays} ngày`}
                      colorVariant="danger"
                      size="small"
                      sx={{ bgcolor: '#ef4444', color: '#ffffff', fontWeight: 700, height: 20, flexShrink: 0 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
                      Phụ trách: {task.assigneeNames.join(', ') || 'Chưa gán'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#2d88ff' : '#0284c7', flexShrink: 0 }}>
                      {task.progress}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CommonCard>
      </Grid>

      {/* Upcoming Deadlines */}
      <Grid item xs={12} md={6}>
        <CommonCard
          title="Hạn Chót Sắp Tới (7 ngày tới)"
          headerIcon={<Calendar size={18} color={isDark ? '#2d88ff' : '#0284c7'} />}
          action={
            <CommonButton
              size="small"
              variant="outline"
              onClick={() => navigate('/tasks')}
            >
              Chi tiết
            </CommonButton>
          }
          sx={{ height: '100%' }}
        >
          {data.upcomingDeadlines.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
              Không có deadline nào trong 7 ngày tới.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                maxHeight: 340,
                overflowY: 'auto',
                pr: 0.5,
              }}
            >
              {data.upcomingDeadlines.map((task) => (
                <Box
                  key={task.taskId}
                  onClick={() => handleTaskClick(task.taskId)}
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: isDark ? '#18191a' : '#f8fafc',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isDark ? '#3a3b3c' : '#f0f9ff',
                      borderColor: isDark ? '#2d88ff' : '#0284c7',
                    },
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75, gap: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <CommonChip
                        label={task.projectCode}
                        colorVariant="primary"
                        size="small"
                        sx={{ mr: 1, verticalAlign: 'middle', height: 20 }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', wordBreak: 'break-word', display: 'inline' }}>
                        {task.taskName}
                      </Typography>
                    </Box>
                    <CommonChip
                      label={task.daysRemaining === 0 ? 'Hôm nay' : `Còn ${task.daysRemaining} ngày`}
                      colorVariant="warning"
                      size="small"
                      sx={{ height: 20, flexShrink: 0 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Hạn: {formatDate(task.plannedEndDate)}
                    </Typography>
                    <ProgressBar value={task.progress} height={6} showText />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CommonCard>
      </Grid>
    </Grid>
  );
});

