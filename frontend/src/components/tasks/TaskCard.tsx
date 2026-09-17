import React, { memo, useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import { TaskItem, TaskStatus } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { getMediaUrl } from '../../utils/fileUtils';
import { PriorityBadge, StatusSelect, AssigneeSelectPopover, TaskProgressSlider } from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { PERMISSIONS } from '../../constants/permissions';

interface TaskCardProps {
  task: TaskItem;
  canUpdateStatus?: boolean;
  canUpdateProgress?: boolean;
  onCardClick: (task: TaskItem) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onProgressChange: (taskId: string, progress: number) => void;
  onAssigneesChange?: (taskId: string, assigneeUserIds: string[]) => void;
}

export const TaskCard: React.FC<TaskCardProps> = memo(({
  task,
  canUpdateStatus = true,
  canUpdateProgress = true,
  onCardClick,
  onStatusChange,
  onProgressChange,
  onAssigneesChange,
}) => {
  const { user } = useAuth();
  const { isSuperAdmin, can } = usePermission();
  const hasManagerRights = isSuperAdmin || can(PERMISSIONS.TASKS_EDIT);
  const isAssigned = Boolean(user?.id && task.assignees?.some((a) => a.userId === user.id || a.id === user.id));
  const allowStatus = hasManagerRights || (canUpdateStatus && isAssigned) || isAssigned;
  const allowProgress = hasManagerRights || (canUpdateProgress && isAssigned) || isAssigned;
  const allowEditAssignees = (hasManagerRights || isAssigned) && Boolean(onAssigneesChange);

  const formattedDate = useMemo(() => {
    return formatDate(task.plannedEndDate);
  }, [task.plannedEndDate]);

  const isCompletedLate = task.status === 'Completed' && Boolean(
    task.isCompletedLate ||
    (task.actualEndDate && new Date(task.actualEndDate.split('T')[0]).getTime() > new Date(task.plannedEndDate.split('T')[0]).getTime())
  );
  const completedLateDays = task.completedLateDays || (
    isCompletedLate && task.actualEndDate
      ? Math.max(1, Math.round((new Date(task.actualEndDate.split('T')[0]).getTime() - new Date(task.plannedEndDate.split('T')[0]).getTime()) / 86400000))
      : 0
  );

  const statusBorderColor = useMemo(() => {
    if (task.status === 'Completed') return '#10b981';
    if (task.isOverdue) return '#ef4444';
    if (task.status === 'InProgress') return '#0284c7';
    if (task.status === 'OnHold') return '#f59e0b';
    return '#94a3b8';
  }, [task.status, task.isOverdue]);

  return (
    <Card
      variant="outlined"
      onClick={() => onCardClick(task)}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `4px solid ${statusBorderColor} !important`,
        bgcolor: (theme) =>
          task.isOverdue || isCompletedLate
            ? theme.palette.mode === 'dark'
              ? 'rgba(239, 68, 68, 0.08)'
              : '#fffbfb'
            : 'background.paper',
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        boxSizing: 'border-box',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 24px -4px rgba(15, 23, 42, 0.09), 0 4px 8px -2px rgba(15, 23, 42, 0.04)',
        },
      }}
    >
      <CardContent sx={{ p: 1.5, pb: 1.25, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header: Project Code & Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Chip
            label={task.projectCode || 'N/A'}
            size="small"
            sx={{
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.15)' : '#f0f9ff'),
              color: (theme) => (theme.palette.mode === 'dark' ? '#38bdf8' : '#0284c7'),
              fontWeight: 800,
              fontSize: '0.7rem',
              border: '1px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.3)' : '#e0f2fe'),
              borderRadius: '6px',
              height: 22,
            }}
          />
          <Box onClick={(e) => e.stopPropagation()}>
            <StatusSelect
              value={task.status}
              onChange={(status) => onStatusChange(task.id, status)}
              disabled={!allowStatus}
            />
          </Box>
        </Box>

        {/* Task Name */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: '0.85rem',
            lineHeight: 1.3,
            mb: 0.25,
          }}
          noWrap
          title={task.name}
        >
          {task.name}
        </Typography>

        {/* Parent Category */}
        {task.parentName && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              mb: 1,
              display: 'block',
              fontSize: '0.7rem',
            }}
            noWrap
            title={`Thuộc hạng mục: ${task.parentName}`}
          >
            Thuộc hạng mục: {task.parentName}
          </Typography>
        )}

        {/* Priority Badge */}
        <Box sx={{ mb: 1 }}>
          <PriorityBadge priority={task.priority} />
        </Box>

        {/* Assignees Quick Edit */}
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, mt: 'auto' }}
        >
          <AssigneeSelectPopover
            assignees={task.assignees}
            taskId={task.id}
            projectId={task.projectId}
            disabled={!allowEditAssignees}
            onAssigneesChange={onAssigneesChange}
          />
        </Box>

        {/* Timeline & Due Date */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: task.isOverdue || isCompletedLate ? '#ef4444' : 'text.secondary', fontWeight: task.isOverdue || isCompletedLate ? 600 : 400 }}>
            Hạn: {formattedDate}
          </Typography>
          {task.isOverdue && (
            <Chip
              label={`Trễ ${task.overdueDays} ngày`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'),
                color: (theme) => (theme.palette.mode === 'dark' ? '#f87171' : '#dc2626'),
                fontWeight: 700,
              }}
            />
          )}
          {isCompletedLate && (
            <Chip
              label={`Xong trễ ${completedLateDays} ngày`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'),
                color: (theme) => (theme.palette.mode === 'dark' ? '#f87171' : '#dc2626'),
                fontWeight: 700,
              }}
            />
          )}
        </Box>

        {/* Progress Slider */}
        <TaskProgressSlider
          value={task.progress}
          disabled={!allowProgress}
          onChange={(nextVal) => onProgressChange(task.id, nextVal)}
        />
      </CardContent>
    </Card>
  );
});
