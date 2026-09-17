import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Paper, Skeleton } from '@mui/material';
import { DashboardSkeleton } from './DashboardSkeleton';
import { GanttSkeleton } from './GanttSkeleton';
import { TableSkeleton } from './TableSkeleton';

export const PageFallbackSkeleton: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  if (path === '/' || path === '') {
    return <DashboardSkeleton />;
  }

  if (path === '/gantt') {
    return <GanttSkeleton />;
  }

  // Standard List/Table Page Skeleton (Projects, Tasks, Employees, Reports, Roles, LoginHistory, etc.)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {/* Top Header & Action Bar Skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="text" width={180} height={32} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="rounded" width={100} height={36} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: '8px' }} />
        </Box>
      </Box>

      {/* Filter / Search Toolbar Skeleton */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Skeleton variant="rounded" width={240} height={38} sx={{ borderRadius: '8px' }} />
        <Skeleton variant="rounded" width={140} height={38} sx={{ borderRadius: '8px' }} />
        <Skeleton variant="rounded" width={140} height={38} sx={{ borderRadius: '8px' }} />
        <Skeleton variant="rounded" width={38} height={38} sx={{ ml: 'auto', borderRadius: '8px' }} />
      </Paper>

      {/* Table Skeleton */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <TableSkeleton columns={6} rows={7} />
      </Paper>
    </Box>
  );
};
