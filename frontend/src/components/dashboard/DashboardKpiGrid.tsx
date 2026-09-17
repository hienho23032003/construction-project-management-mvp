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
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: { xs: 1.5, sm: 2 },
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', boxShadow: 'none', borderRadius: '8px' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: { xs: '0.72rem', sm: '0.8rem' } }} noWrap>
                  {kpi.title}
                </Typography>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : kpi.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: kpi.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </Box>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.25rem', sm: '1.5rem' }, color: 'text.primary' }}>
                {kpi.value}
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
});
