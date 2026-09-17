import React from 'react';
import { Box, Grid, Paper, Card, CardContent, Skeleton } from '@mui/material';

export const DashboardSkeleton: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Date Filter Skeleton */}
      <Paper sx={{ p: 2, borderRadius: '8px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Skeleton variant="text" width={240} height={32} />
          <Skeleton variant="rounded" width={320} height={36} sx={{ borderRadius: '8px' }} />
        </Box>
      </Paper>

      {/* KPI Cards Grid Skeleton */}
      <Grid container spacing={2}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '8px' }} />
                </Box>
                <Skeleton variant="text" width="40%" height={36} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Skeleton */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '8px', height: 320 }}>
            <Skeleton variant="text" width="45%" height={28} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" width="100%" height={240} sx={{ borderRadius: '8px' }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '8px', height: 320 }}>
            <Skeleton variant="text" width="55%" height={28} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220 }}>
              <Skeleton variant="circular" width={170} height={170} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
