import React, { memo } from 'react';
import { Grid, Card, CardContent, Box, Typography } from '@mui/material';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import { DashboardSummary } from '../../types';

interface DashboardKpiGridProps {
  data: DashboardSummary;
}

export const DashboardKpiGrid: React.FC<DashboardKpiGridProps> = memo(({ data }) => {
  const kpis = [
    { title: 'Tổng Công Trình', value: data.totalProjects, icon: FolderKanban, color: '#0284c7', bg: '#e0f2fe' },
    { title: 'Đang Thực Hiện', value: data.inProgressProjects, icon: Clock, color: '#0ea5e9', bg: '#f0f9ff' },
    { title: 'Đã Hoàn Thành', value: data.completedProjects, icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5' },
    { title: 'Dự Án Trễ Hạn', value: data.overdueProjects, icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2' },
    { title: 'Tổng Công Việc', value: data.totalTasks, icon: ListTodo, color: '#6366f1', bg: '#eef2ff' },
    { title: 'Task Hoàn Thành', value: data.completedTasks, icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5' },
    { title: 'Task Đang Làm', value: data.inProgressTasks, icon: TrendingUp, color: '#0284c7', bg: '#f0f9ff' },
    { title: 'Task Quá Hạn', value: data.overdueTasks, icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2' },
  ];

  return (
    <Grid container spacing={2}>
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Grid item xs={6} sm={3} key={idx}>
            <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>
                    {kpi.title}
                  </Typography>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: kpi.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: kpi.color,
                    }}
                  >
                    <Icon size={18} />
                  </Box>
                </Box>
                <Typography variant="h2" sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a' }}>
                  {kpi.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
});
