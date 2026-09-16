import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Box, Typography, Button } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardSummary } from '../../types';

interface DashboardChartsProps {
  data: DashboardSummary;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = memo(({ data }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={{ xs: 2, md: 2.5 }}>
      {/* Project Progress Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: { xs: 1.75, sm: 2.5 }, border: '1px solid #e2e8f0', borderRadius: '8px', height: '100%', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' }, color: '#0f172a' }}>
              Tiến Độ Công Trình Trọng Điểm (%)
            </Typography>
            <Button
              size="small"
              endIcon={<ArrowRight size={14} />}
              onClick={() => navigate('/projects')}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Xem Tất Cả
            </Button>
          </Box>

          <Box sx={{ height: 260, minWidth: 0, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.projectProgressList} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="projectCode" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <RechartsTooltip
                  formatter={(value: any) => [`${value}%`, 'Tiến độ']}
                  labelFormatter={(label) => {
                    const item = data.projectProgressList.find((p) => p.projectCode === label);
                    return item ? `${item.projectCode} - ${item.projectName}` : label;
                  }}
                />
                <Bar dataKey="progress" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* Task Status Distribution Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: { xs: 1.75, sm: 2.5 }, border: '1px solid #e2e8f0', borderRadius: '8px', height: '100%', overflow: 'hidden' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' }, color: '#0f172a', mb: 2 }}>
            Phân Bổ Trạng Thái Công Việc
          </Typography>

          <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(() => {
              const activeStatusData = data.taskStatusDistribution.filter((d) => d.count > 0);
              if (activeStatusData.length === 0) {
                return (
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Chưa có dữ liệu công việc
                  </Typography>
                );
              }
              return (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeStatusData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {activeStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              );
            })()}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1 }}>
            {data.taskStatusDistribution.map((s, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }} />
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                  {s.status}: {s.count}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
});
