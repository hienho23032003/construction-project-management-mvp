import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { parseISO, differenceInDays } from 'date-fns';
import { GanttTask } from '../../types';

interface GanttTaskBarItemProps {
  task: GanttTask;
  minDate: Date;
  columnWidth: number;
  onMouseEnter: (task: GanttTask, e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

const getTaskColor = (task: GanttTask, isDark: boolean) => {
  if (task.isOverdue) return { bar: '#f87171', fill: '#dc2626', bg: isDark ? 'rgba(239, 68, 68, 0.28)' : '#fee2e2' };
  if (task.status === 'Completed') return { bar: isDark ? '#34d399' : '#10b981', fill: '#059669', bg: isDark ? 'rgba(16, 185, 129, 0.28)' : '#d1fae5' };
  if (task.status === 'InProgress') return { bar: isDark ? '#38bdf8' : '#0284c7', fill: '#0369a1', bg: isDark ? 'rgba(2, 132, 199, 0.28)' : '#e0f2fe' };
  if (task.status === 'OnHold') return { bar: isDark ? '#fbbf24' : '#f59e0b', fill: '#d97706', bg: isDark ? 'rgba(245, 158, 11, 0.28)' : '#fef3c7' };
  return { bar: '#94a3b8', fill: '#64748b', bg: isDark ? 'rgba(100, 116, 139, 0.28)' : '#f1f5f9' };
};

export const GanttTaskBarItem: React.FC<GanttTaskBarItemProps> = React.memo(({
  task,
  minDate,
  columnWidth,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { left, width, colors, isProject, isPhase } = React.useMemo(() => {
    const s = parseISO(task.start);
    const en = parseISO(task.end);
    const startDiff = differenceInDays(s, minDate);
    const duration = Math.max(differenceInDays(en, s) + 1, 1);
    const calculatedLeft = startDiff * columnWidth;
    const calculatedWidth = duration * columnWidth;
    const calculatedColors = getTaskColor(task, isDark);
    const proj = task.type === 'project';
    const phase = task.type === 'phase';

    return {
      left: calculatedLeft,
      width: calculatedWidth,
      colors: calculatedColors,
      isProject: proj,
      isPhase: phase,
    };
  }, [task.start, task.end, task.status, task.isOverdue, task.type, minDate, columnWidth, isDark]);

  return (
    <Box
      sx={{
        height: 44,
        position: 'relative',
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: isProject
          ? isDark
            ? 'rgba(56, 189, 248, 0.08)'
            : 'rgba(248, 250, 252, 0.5)'
          : 'transparent',
        zIndex: 1,
        contain: 'layout paint',
      }}
    >
      {/* Task Bar */}
      <Box
        className="gantt-task-bar"
        onMouseEnter={(e) => onMouseEnter(task, e)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        sx={{
          position: 'absolute',
          top: isProject ? 6 : isPhase ? 7 : 7,
          height: isProject ? 32 : isPhase ? 30 : 30,
          left: `${left}px`,
          width: `${Math.max(width, 16)}px`,
          bgcolor: colors.bg,
          border: `1.5px solid ${colors.bar}`,
          borderRadius: isProject ? '4px' : '6px',
          cursor: 'grab',
          boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          zIndex: 5,
          userSelect: 'none',
        }}
      >
        {/* Progress Fill inside task */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${task.progress}%`,
            bgcolor: colors.fill,
            opacity: 0.85,
            borderRadius: '4px 0 0 4px',
            pointerEvents: 'none',
          }}
        />

        {/* Title text on bar if width is enough */}
        {width > 60 && (
          <Typography
            variant="caption"
            noWrap
            sx={{
              position: 'relative',
              zIndex: 3,
              px: 1,
              fontWeight: 700,
              fontSize: '0.75rem',
              color: '#ffffff',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              lineHeight: 1,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {task.name} ({task.progress}%)
          </Typography>
        )}
      </Box>
    </Box>
  );
});

GanttTaskBarItem.displayName = 'GanttTaskBarItem';
