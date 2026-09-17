import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Box, Typography, useTheme } from '@mui/material';
import { ArrowRight, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
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
import { CommonCard, CommonButton } from '../common';

interface DashboardChartsProps {
  data: DashboardSummary;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = memo(({ data }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Grid container spacing={{ xs: 2, md: 2.5 }}>
      {/* Project Progress Chart */}
      <Grid item xs={12} md={6}>
        <CommonCard
          title="Tiến Độ Công Trình Trọng Điểm (%)"
          headerIcon={<BarChart3 size={18} color={theme.palette.mode === 'dark' ? '#2d88ff' : '#0284c7'} />}
          action={
            <CommonButton
              size="small"
              variant="outline"
              endIcon={<ArrowRight size={14} />}
              onClick={() => navigate('/projects')}
            >
              Xem Tất Cả
            </CommonButton>
          }
          sx={{ height: '100%' }}
        >
          <Box sx={{ height: 260, minWidth: 0, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.projectProgressList} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="projectCode" tick={{ fill: '#7b7b7b', fontSize: 11, fontWeight: 600 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#7b7b7b', fontSize: 11 }} />
                <RechartsTooltip
                  formatter={(value: any) => [`${value}%`, 'Tiến độ']}
                  labelFormatter={(label) => {
                    const item = data.projectProgressList.find((p) => p.projectCode === label);
                    return item ? `${item.projectCode} - ${item.projectName}` : label;
                  }}
                  contentStyle={{
                    backgroundColor: (theme.palette.mode === 'dark' ? '#242526' : '#ffffff'),
                    borderColor: (theme.palette.mode === 'dark' ? '#3e4042' : '#e2e8f0'),
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                  itemStyle={{ color: (theme.palette.mode === 'dark' ? '#e4e6eb' : '#0f172a'), fontWeight: 600, fontSize: '0.85rem' }}
                  labelStyle={{ color: (theme.palette.mode === 'dark' ? '#e4e6eb' : '#0f172a'), fontWeight: 700 }}
                />
                <Bar dataKey="progress" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CommonCard>
      </Grid>

      {/* Task Status Distribution Chart */}
      <Grid item xs={12} md={6}>
        <CommonCard
          title="Phân Bổ Trạng Thái Công Việc"
          headerIcon={<PieChartIcon size={18} color={theme.palette.mode === 'dark' ? '#2d88ff' : '#0284c7'} />}
          sx={{ height: '100%' }}
        >
          <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(() => {
              const activeStatusData = data.taskStatusDistribution.filter((d) => d.count > 0);
              if (activeStatusData.length === 0) {
                return (
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
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
                    <RechartsTooltip
                      formatter={(value: any, name: any) => [`${value} công việc`, `${name}`]}
                      contentStyle={{
                        backgroundColor: (theme.palette.mode === 'dark' ? '#242526' : '#ffffff'),
                        borderColor: (theme.palette.mode === 'dark' ? '#3e4042' : '#e2e8f0'),
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      }}
                      itemStyle={{ color: (theme.palette.mode === 'dark' ? '#e4e6eb' : '#0f172a'), fontWeight: 600, fontSize: '0.85rem' }}
                      labelStyle={{ color: (theme.palette.mode === 'dark' ? '#e4e6eb' : '#0f172a'), fontWeight: 700 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              );
            })()}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1 }}>
            {data.taskStatusDistribution.map((s, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {s.status}: {s.count}
                </Typography>
              </Box>
            ))}
          </Box>
        </CommonCard>
      </Grid>
    </Grid>
  );
});

