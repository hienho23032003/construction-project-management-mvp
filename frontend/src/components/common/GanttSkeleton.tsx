import React from 'react';
import { Box, Paper, Skeleton } from '@mui/material';

export const GanttSkeleton: React.FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexGrow: 1,
        minHeight: 450,
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Top Toolbar Skeleton */}
      <Box
        sx={{
          p: { xs: 1.25, sm: 1.5 },
          px: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexWrap: 'wrap',
          gap: 1.5,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          flexShrink: 0,
        }}
      >
        {/* Left: Icon & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="text" width={220} height={28} />
        </Box>

        {/* Right: Export button & View Mode ButtonGroup & Legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <Skeleton variant="rounded" width={110} height={32} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="rounded" width={180} height={32} sx={{ borderRadius: '8px' }} />
          <Box sx={{ display: 'flex', gap: 0.75, ml: 1 }}>
            <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: '8px' }} />
            <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: '8px' }} />
            <Skeleton variant="rounded" width={65} height={24} sx={{ borderRadius: '8px' }} />
          </Box>
        </Box>
      </Box>

      {/* Main Gantt Body Skeleton (Split Left Panel & Timeline Grid) */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Left Panel: Task Hierarchy List */}
        <Box
          sx={{
            width: { xs: 240, sm: 360 },
            flexShrink: 0,
            borderRight: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Left Header */}
          <Box
            sx={{
              height: 48,
              bgcolor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              px: 2,
              borderBottom: '1px solid #0369a1',
            }}
          >
            <Skeleton variant="text" width={160} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
          </Box>

          {/* Left Rows */}
          <Box sx={{ flexGrow: 1, p: 1, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {/* Project Row 1 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.75, bgcolor: '#f1f5f9', borderRadius: '6px' }}>
              <Skeleton variant="rounded" width={18} height={18} sx={{ borderRadius: '4px' }} />
              <Skeleton variant="text" width="60%" height={22} />
              <Skeleton variant="rounded" width={45} height={18} sx={{ ml: 'auto', borderRadius: '8px' }} />
            </Box>

            {/* Task Row 1.1 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 3, pr: 1, py: 0.5 }}>
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width="55%" height={20} />
              <Skeleton variant="circular" width={22} height={22} sx={{ ml: 'auto' }} />
            </Box>

            {/* Task Row 1.2 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 3, pr: 1, py: 0.5 }}>
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width="65%" height={20} />
              <Skeleton variant="circular" width={22} height={22} sx={{ ml: 'auto' }} />
            </Box>

            {/* Task Row 1.3 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 3, pr: 1, py: 0.5 }}>
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width="50%" height={20} />
              <Skeleton variant="circular" width={22} height={22} sx={{ ml: 'auto' }} />
            </Box>

            {/* Project Row 2 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.75, bgcolor: '#f1f5f9', borderRadius: '6px', mt: 0.5 }}>
              <Skeleton variant="rounded" width={18} height={18} sx={{ borderRadius: '4px' }} />
              <Skeleton variant="text" width="70%" height={22} />
              <Skeleton variant="rounded" width={45} height={18} sx={{ ml: 'auto', borderRadius: '8px' }} />
            </Box>

            {/* Task Row 2.1 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 3, pr: 1, py: 0.5 }}>
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width="58%" height={20} />
              <Skeleton variant="circular" width={22} height={22} sx={{ ml: 'auto' }} />
            </Box>

            {/* Task Row 2.2 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 3, pr: 1, py: 0.5 }}>
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width="62%" height={20} />
              <Skeleton variant="circular" width={22} height={22} sx={{ ml: 'auto' }} />
            </Box>

            {/* Task Row 2.3 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 3, pr: 1, py: 0.5 }}>
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width="48%" height={20} />
              <Skeleton variant="circular" width={22} height={22} sx={{ ml: 'auto' }} />
            </Box>
          </Box>
        </Box>

        {/* Right Panel: Timeline Grid & Horizontal Bars */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fafafa' }}>
          {/* Timeline Calendar Header */}
          <Box
            sx={{
              height: 48,
              bgcolor: '#0284c7',
              borderBottom: '1px solid #0369a1',
              display: 'flex',
              alignItems: 'center',
              px: 2,
              gap: 2,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={50}
                height={20}
                sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: '4px' }}
              />
            ))}
          </Box>

          {/* Timeline Rows with Gantt Bars */}
          <Box sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.6, position: 'relative' }}>
            {/* Background vertical guides */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                justifyContent: 'space-between',
                px: 3,
                pointerEvents: 'none',
                opacity: 0.35,
              }}
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <Box key={i} sx={{ width: '1px', height: '100%', bgcolor: '#cbd5e1' }} />
              ))}
            </Box>

            {/* Gantt Bar 1 (Project summary bar) */}
            <Box sx={{ height: 32, display: 'flex', alignItems: 'center' }}>
              <Skeleton
                variant="rounded"
                width="75%"
                height={20}
                sx={{ ml: '5%', borderRadius: '4px', bgcolor: '#93c5fd' }}
              />
            </Box>

            {/* Gantt Bar 2 */}
            <Box sx={{ height: 28, display: 'flex', alignItems: 'center' }}>
              <Skeleton
                variant="rounded"
                width="28%"
                height={22}
                sx={{ ml: '8%', borderRadius: '6px', bgcolor: '#67e8f9' }}
              />
            </Box>

            {/* Gantt Bar 3 */}
            <Box sx={{ height: 28, display: 'flex', alignItems: 'center' }}>
              <Skeleton
                variant="rounded"
                width="34%"
                height={22}
                sx={{ ml: '32%', borderRadius: '6px', bgcolor: '#86efac' }}
              />
            </Box>

            {/* Gantt Bar 4 */}
            <Box sx={{ height: 28, display: 'flex', alignItems: 'center' }}>
              <Skeleton
                variant="rounded"
                width="20%"
                height={22}
                sx={{ ml: '60%', borderRadius: '6px', bgcolor: '#fde047' }}
              />
            </Box>

            {/* Gantt Bar 5 (Project 2 summary) */}
            <Box sx={{ height: 32, display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Skeleton
                variant="rounded"
                width="65%"
                height={20}
                sx={{ ml: '20%', borderRadius: '4px', bgcolor: '#93c5fd' }}
              />
            </Box>

            {/* Gantt Bar 6 */}
            <Box sx={{ height: 28, display: 'flex', alignItems: 'center' }}>
              <Skeleton
                variant="rounded"
                width="25%"
                height={22}
                sx={{ ml: '22%', borderRadius: '6px', bgcolor: '#67e8f9' }}
              />
            </Box>

            {/* Gantt Bar 7 */}
            <Box sx={{ height: 28, display: 'flex', alignItems: 'center' }}>
              <Skeleton
                variant="rounded"
                width="30%"
                height={22}
                sx={{ ml: '44%', borderRadius: '6px', bgcolor: '#86efac' }}
              />
            </Box>

            {/* Gantt Bar 8 */}
            <Box sx={{ height: 28, display: 'flex', alignItems: 'center' }}>
              <Skeleton
                variant="rounded"
                width="18%"
                height={22}
                sx={{ ml: '68%', borderRadius: '6px', bgcolor: '#fca5a5' }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
