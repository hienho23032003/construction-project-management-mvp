import React from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import { ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { GanttTask } from '../../types';
import { PriorityBadge } from '../common';

export interface GanttTreeItem extends GanttTask {
  depth: number;
  hasChildren: boolean;
}

interface GanttLeftTreeProps {
  leftPanelRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
  width: number;
  isSmall: boolean;
  visibleTasks: GanttTreeItem[];
  collapsedIds: Set<string>;
  onToggleCollapse: (id: string, e: React.MouseEvent) => void;
  onTaskClick?: (task: GanttTask) => void;
}

export const GanttLeftTree: React.FC<GanttLeftTreeProps> = React.memo(({
  leftPanelRef,
  onScroll,
  width,
  isSmall,
  visibleTasks,
  collapsedIds,
  onToggleCollapse,
  onTaskClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      ref={leftPanelRef}
      onScroll={onScroll}
      sx={{
        width,
        minWidth: isSmall ? 160 : 180,
        maxWidth: 750,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollBehavior: 'auto',
        willChange: 'scroll-position',
      }}
    >
      {/* Left Table Header (matching 64px height) */}
      <Box
        sx={{
          height: 64,
          minHeight: 64,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: isDark ? '#141414' : '#f8fafc',
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: 'text.primary', textTransform: 'uppercase', fontSize: '0.78rem' }}
        >
          Hạng Mục / Công Việc
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#38bdf8' : '#0284c7' }}>
          Tiến độ
        </Typography>
      </Box>

      {/* Rows */}
      {visibleTasks.map((task) => {
        const hasChildren = task.hasChildren;
        const isCollapsed = collapsedIds.has(task.id);
        const isProject = task.type === 'project';
        const isPhase = task.type === 'phase';
        const indent = (task.depth || 0) * 16;

        const handleRowClick = (e: React.MouseEvent) => {
          if (hasChildren || isProject || isPhase) {
            onToggleCollapse(task.id, e);
          } else if (onTaskClick) {
            onTaskClick(task);
          }
        };

        return (
          <Box
            key={task.id}
            onClick={handleRowClick}
            sx={{
              height: 44,
              minHeight: 44,
              px: 1.5,
              pl: `${8 + indent}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: isProject
                ? isDark
                  ? 'rgba(56, 189, 248, 0.1)'
                  : '#f1f5f9'
                : isPhase
                ? isDark
                  ? 'rgba(255, 255, 255, 0.03)'
                  : '#f8fafc'
                : 'background.paper',
              cursor: 'pointer',
              userSelect: 'none',
              contain: 'content',
              '&:hover': {
                bgcolor: isDark ? 'rgba(56, 189, 248, 0.14)' : '#f0f9ff',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, pr: 1 }}>
              {hasChildren ? (
                <IconButton
                  size="small"
                  onClick={(e) => onToggleCollapse(task.id, e)}
                  sx={{ p: 0.25, color: isDark ? '#38bdf8' : '#0284c7' }}
                >
                  {isCollapsed ? <ChevronRightIcon size={16} /> : <ChevronDown size={16} />}
                </IconButton>
              ) : (
                <Box sx={{ width: 24 }} />
              )}

              <Typography
                variant="body2"
                noWrap
                title={task.name}
                sx={{
                  fontWeight: isProject ? 700 : isPhase ? 600 : 500,
                  fontSize: isProject ? '0.875rem' : '0.8125rem',
                  color: isProject
                    ? isDark
                      ? '#38bdf8'
                      : '#0284c7'
                    : 'text.primary',
                }}
              >
                {task.name}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              {!isProject && task.priority && (
                <PriorityBadge priority={task.priority} variant="flagOnly" size="small" />
              )}
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color:
                    task.progress >= 100
                      ? isDark
                        ? '#34d399'
                        : '#10b981'
                      : task.progress > 0
                      ? isDark
                        ? '#38bdf8'
                        : '#0284c7'
                      : 'text.disabled',
                }}
              >
                {task.progress}%
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
});

GanttLeftTree.displayName = 'GanttLeftTree';
