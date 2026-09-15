import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Button, Chip } from '@mui/material';
import { AlertTriangle, Calendar } from 'lucide-react';
import { DashboardSummary } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import { formatDate } from '../../utils/dateUtils';

interface DashboardAlertsProps {
  data: DashboardSummary;
  onSelectTask?: (taskId: string) => void;
}

export const DashboardAlerts: React.FC<DashboardAlertsProps> = memo(({ data, onSelectTask }) => {
  const navigate = useNavigate();

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
        <Paper
          sx={{
            p: { xs: 1.75, sm: 2.5 },
            border: '1px solid #fee2e2',
            bgcolor: '#fff5f5',
            borderRadius: '8px',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AlertTriangle size={18} color="#ef4444" />
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#b91c1c' }}>
                Cảnh Báo Công Việc Quá Hạn ({data.criticalOverdueTasks.length})
              </Typography>
            </Box>
            <Button size="small" onClick={() => navigate('/tasks')} sx={{ color: '#b91c1c', fontWeight: 600 }}>
              Chi tiết
            </Button>
          </Box>

          {data.criticalOverdueTasks.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#64748b', py: 2 }}>
              Không có công việc nào bị quá hạn. Tiến độ rất tốt!
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                maxHeight: 340,
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '5px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#fca5a5',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#f87171',
                },
              }}
            >
              {data.criticalOverdueTasks.map((task) => (
                <Paper
                  key={task.taskId}
                  onClick={() => handleTaskClick(task.taskId)}
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    bgcolor: '#ffffff',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#fff1f2', borderColor: '#f87171' },
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75, gap: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Chip
                        label={task.projectCode}
                        size="small"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, mr: 1, bgcolor: '#fee2e2', color: '#b91c1c', verticalAlign: 'middle' }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-word', display: 'inline' }}>
                        {task.taskName}
                      </Typography>
                    </Box>
                    <Chip
                      label={`Trễ ${task.overdueDays} ngày`}
                      size="small"
                      sx={{ bgcolor: '#ef4444', color: '#ffffff', fontWeight: 700, height: 20, fontSize: '0.65rem', flexShrink: 0, whiteSpace: 'nowrap' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', wordBreak: 'break-word' }}>
                      Phụ trách: {task.assigneeNames.join(', ') || 'Chưa gán'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0284c7', flexShrink: 0 }}>
                      {task.progress}%
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Upcoming Deadlines */}
      <Grid item xs={12} md={6}>
        <Paper
          sx={{
            p: { xs: 1.75, sm: 2.5 },
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calendar size={18} color="#0284c7" />
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                Hạn Chót Sắp Tới (7 ngày tới)
              </Typography>
            </Box>
            <Button size="small" onClick={() => navigate('/tasks')} sx={{ fontWeight: 600 }}>
              Chi tiết
            </Button>
          </Box>

          {data.upcomingDeadlines.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#64748b', py: 2 }}>
              Không có deadline nào trong 7 ngày tới.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                maxHeight: 340,
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '5px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#cbd5e1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#94a3b8',
                },
              }}
            >
              {data.upcomingDeadlines.map((task) => (
                <Paper
                  key={task.taskId}
                  onClick={() => handleTaskClick(task.taskId)}
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    bgcolor: '#f8fafc',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f0f9ff', borderColor: '#38bdf8' },
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75, gap: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Chip
                        label={task.projectCode}
                        size="small"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, mr: 1, bgcolor: '#e0f2fe', color: '#0369a1', verticalAlign: 'middle' }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, wordBreak: 'break-word', display: 'inline' }}>
                        {task.taskName}
                      </Typography>
                    </Box>
                    <Chip
                      label={task.daysRemaining === 0 ? 'Hôm nay' : `Còn ${task.daysRemaining} ngày`}
                      size="small"
                      sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, height: 20, fontSize: '0.65rem', flexShrink: 0, whiteSpace: 'nowrap' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Hạn: {formatDate(task.plannedEndDate)}
                    </Typography>
                    <ProgressBar value={task.progress} height={6} showText />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
});
