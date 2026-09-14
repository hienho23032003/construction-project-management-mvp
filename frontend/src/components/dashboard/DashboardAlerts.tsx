import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Button, Chip } from '@mui/material';
import { AlertTriangle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardSummary } from '../../types';
import { ProgressBar } from '../common/ProgressBar';

interface DashboardAlertsProps {
  data: DashboardSummary;
}

export const DashboardAlerts: React.FC<DashboardAlertsProps> = memo(({ data }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={2.5}>
      {/* Critical Overdue Tasks */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2.5, border: '1px solid #fee2e2', bgcolor: '#fff5f5', borderRadius: '8px' }}>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {data.criticalOverdueTasks.map((task) => (
                <Paper
                  key={task.taskId}
                  onClick={() => navigate('/tasks')}
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    bgcolor: '#ffffff',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#fff1f2' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Box>
                      <Chip
                        label={task.projectCode}
                        size="small"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, mr: 1, bgcolor: '#fee2e2', color: '#b91c1c' }}
                      />
                      <Typography variant="subtitle2" sx={{ display: 'inline', fontWeight: 700, color: '#0f172a' }}>
                        {task.taskName}
                      </Typography>
                    </Box>
                    <Chip
                      label={`Trễ ${task.overdueDays} ngày`}
                      size="small"
                      sx={{ bgcolor: '#ef4444', color: '#ffffff', fontWeight: 700, height: 20, fontSize: '0.65rem' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Phụ trách: {task.assigneeNames.join(', ') || 'Chưa gán'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0284c7' }}>
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
        <Paper sx={{ p: 2.5, border: '1px solid #e2e8f0', borderRadius: '8px' }}>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {data.upcomingDeadlines.map((task) => (
                <Paper
                  key={task.taskId}
                  onClick={() => navigate('/tasks')}
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    bgcolor: '#f8fafc',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f0f9ff' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box>
                      <Chip
                        label={task.projectCode}
                        size="small"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, mr: 1, bgcolor: '#e0f2fe', color: '#0369a1' }}
                      />
                      <Typography variant="subtitle2" sx={{ display: 'inline', fontWeight: 600 }}>
                        {task.taskName}
                      </Typography>
                    </Box>
                    <Chip
                      label={task.daysRemaining === 0 ? 'Hôm nay' : `Còn ${task.daysRemaining} ngày`}
                      size="small"
                      sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, height: 20, fontSize: '0.65rem' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Hạn: {format(new Date(task.plannedEndDate), 'dd/MM/yyyy')}
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
