import React, { memo } from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import { Project, ProjectMember, TaskItem } from '../../types';
import { ProgressBar } from '../common/PriorityBadge';
import { formatDate } from '../../utils/dateUtils';

interface ProjectOverviewTabProps {
  project: Project & { members: ProjectMember[]; tasks: TaskItem[] };
}

export const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = memo(({ project }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5 }}>
            Mô Tả & Mục Tiêu Công Trình
          </Typography>
          <Typography variant="body1" sx={{ color: '#475569', mb: 3 }}>
            {project.description || 'Chưa có mô tả chi tiết.'}
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Thông Tin Chi Tiết
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Mã công trình
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {project.code}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Chỉ huy trưởng / Quản lý
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {project.managerName || 'Chưa phân công'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Ngày khởi công
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatDate(project.startDate)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Hạn hoàn thành dự kiến
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: project.isOverdue ? '#ef4444' : '#0f172a' }}>
                {formatDate(project.plannedEndDate)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Thống Kê Khối Lượng & Tiến Độ
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  Tiến độ chung
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0284c7' }}>
                  {project.progress}%
                </Typography>
              </Box>
              <ProgressBar value={project.progress} height={10} showText={false} />
            </Box>

            <Grid container spacing={1.5} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Tổng Task
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {project.taskCount}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#10b981' }}>
                    Đã Xong
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#10b981' }}>
                    {project.completedTaskCount}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#ef4444' }}>
                    Quá Hạn
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#ef4444' }}>
                    {project.overdueTaskCount}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
});
