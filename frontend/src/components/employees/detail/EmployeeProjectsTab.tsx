import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import { FolderKanban, ChevronRight } from 'lucide-react';
import { StatusChip } from '../../common/StatusChip';
import { EmployeeProjectParticipation } from '../../../types';

interface EmployeeProjectsTabProps {
  projects: EmployeeProjectParticipation[];
}

export const EmployeeProjectsTab: React.FC<EmployeeProjectsTabProps> = ({ projects }) => {
  if (projects.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>
        <FolderKanban size={40} color="#94a3b8" style={{ marginBottom: 8 }} />
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Chưa tham gia dự án nào
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
          Nhân viên chưa được phân công vào danh sách thành viên dự án nào.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2.5}>
      {projects.map((p) => (
        <Grid item xs={12} sm={6} md={4} key={p.projectId}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              transition: 'all 0.2s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                borderColor: '#0284c7',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Chip
                  label={p.projectCode}
                  size="small"
                  sx={{ bgcolor: '#f0f9ff', color: '#0284c7', fontWeight: 800, fontSize: '0.75rem' }}
                />
                <StatusChip status={p.projectStatus} size="small" />
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5, lineHeight: 1.3 }}>
                {p.projectName}
              </Typography>

              {p.roleInProject && (
                <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600, mb: 1, display: 'block' }}>
                  Vai trò: {p.roleInProject}
                </Typography>
              )}

              {p.projectLocation && (
                <Typography variant="caption" sx={{ color: '#64748b', mb: 1.5, display: 'block' }} noWrap>
                  {p.projectLocation}
                </Typography>
              )}

              <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Tiến độ công trình
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {Math.round(p.projectProgress)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={p.projectProgress}
                  sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0', mb: 1.5 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    <strong>{p.totalTasks}</strong> việc ({p.completedTasks} xong)
                  </Typography>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/projects/${p.projectId}`}
                    endIcon={<ChevronRight size={14} />}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', p: 0 }}
                  >
                    Xem Dự Án
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
