import React from 'react';
import { Box, Typography } from '@mui/material';
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

const getTaskColor = (task: GanttTask) => {
  if (task.isOverdue) return { bar: '#ef4444', fill: '#dc2626', bg: '#fee2e2' };
  if (task.status === 'Completed') return { bar: '#10b981', fill: '#059669', bg: '#d1fae5' };
  if (task.status === 'InProgress') return { bar: '#0284c7', fill: '#0369a1', bg: '#e0f2fe' };
  if (task.status === 'OnHold') return { bar: '#f59e0b', fill: '#d97706', bg: '#fef3c7' };
  return { bar: '#94a3b8', fill: '#64748b', bg: '#f1f5f9' };
};

export const GanttTaskBarItem: React.FC<GanttTaskBarItemProps> = ({
  task,
  minDate,
  columnWidth,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}) => {
  const s = parseISO(task.start);
  const en = parseISO(task.end);
  const startDiff = differenceInDays(s, minDate);
  const duration = Math.max(differenceInDays(en, s) + 1, 1);
  const left = startDiff * columnWidth;
  const width = duration * columnWidth;

  const colors = getTaskColor(task);
  const isProject = task.type === 'project';
  const isPhase = task.type === 'phase';

  return (
    <Box
      sx={{
        height: 44,
        position: 'relative',
        borderBottom: '1px solid #f1f5f9',
        bgcolor: isProject ? 'rgba(248, 250, 252, 0.5)' : 'transparent',
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
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
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
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#ffffff',
              textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)',
              letterSpacing: '0.01em',
              display: 'block',
              pointerEvents: 'none',
            }}
          >
            {task.name} ({task.progress}%)
          </Typography>
        )}
      </Box>

      {/* Task Title beside bar if width <= 60px */}
      {width <= 60 && (
        <Typography
          variant="caption"
          noWrap
          onMouseEnter={(e) => onMouseEnter(task, e)}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          sx={{
            position: 'absolute',
            left: `${left + Math.max(width, 16) + 6}px`,
            top: isProject ? 11 : isPhase ? 12 : 12,
            zIndex: 4,
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#0f172a',
            cursor: 'grab',
          }}
        >
          {task.name} ({task.progress}%)
        </Typography>
      )}
    </Box>
  );
};
