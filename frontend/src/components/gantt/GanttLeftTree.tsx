import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { GanttTask } from '../../types';

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

export const GanttLeftTree: React.FC<GanttLeftTreeProps> = ({
  leftPanelRef,
  onScroll,
  width,
  isSmall,
  visibleTasks,
  collapsedIds,
  onToggleCollapse,
  onTaskClick,
}) => {
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
        bgcolor: '#ffffff',
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
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #cbd5e1',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', fontSize: '0.78rem' }}
        >
          Hạng Mục / Công Việc
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
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
              borderBottom: '1px solid #f1f5f9',
              bgcolor: isProject ? '#f1f5f9' : isPhase ? '#f8fafc' : '#ffffff',
              cursor: 'pointer',
              userSelect: 'none',
              contain: 'content',
              '&:hover': { bgcolor: '#f0f9ff' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, pr: 1 }}>
              {hasChildren ? (
                <IconButton
                  size="small"
                  onClick={(e) => onToggleCollapse(task.id, e)}
                  sx={{ p: 0.25, color: '#64748b' }}
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
                  color: isProject ? '#0f172a' : isPhase ? '#1e293b' : '#334155',
                }}
              >
                {task.name}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: task.progress >= 100 ? '#10b981' : task.progress > 0 ? '#0284c7' : '#94a3b8',
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
};
