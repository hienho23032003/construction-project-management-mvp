import React, { memo, useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Slider,
  Avatar,
} from '@mui/material';
import { TaskItem, TaskStatus } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { getMediaUrl } from '../../utils/fileUtils';
import { PriorityBadge, StatusSelect } from '../common';

interface TaskCardProps {
  task: TaskItem;
  onCardClick: (task: TaskItem) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onProgressChange: (taskId: string, progress: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = memo(({
  task,
  onCardClick,
  onStatusChange,
  onProgressChange,
}) => {
  const [localProgress, setLocalProgress] = useState(task.progress);

  useEffect(() => {
    setLocalProgress(task.progress);
  }, [task.progress]);

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

  return (
    <Card
      variant="outlined"
      onClick={() => onCardClick(task)}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        bgcolor: task.isOverdue || isCompletedLate ? '#fff5f5' : '#ffffff',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderColor: '#94a3b8',
        },
      }}
    >
      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header: Project Code & Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Chip
            label={task.projectCode || 'N/A'}
            size="small"
            sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: '0.75rem' }}
          />
          <Box onClick={(e) => e.stopPropagation()}>
            <StatusSelect
              value={task.status}
              onChange={(status) => onStatusChange(task.id, status)}
            />
          </Box>
        </Box>

        {/* Task Name */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.3,
            mb: 0.5,
          }}
        >
          {task.name}
        </Typography>

        {/* Parent Category */}
        {task.parentName && (
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              mb: 1.5,
              display: 'block',
            }}
          >
            Thuộc hạng mục: {task.parentName}
          </Typography>
        )}

        {/* Priority Badge */}
        <Box sx={{ mb: 1.5 }}>
          <PriorityBadge priority={task.priority} />
        </Box>

        {/* Assignees List */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5, mt: 'auto' }}>
          {task.assignees.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Chưa gán
            </Typography>
          ) : (
            task.assignees.map((a) => (
              <Chip
                key={a.id}
                avatar={
                  <Avatar
                    src={getMediaUrl(a.avatarUrl)}
                    sx={{ width: 18, height: 18, fontSize: '0.65rem' }}
                  >
                    {a.fullName.charAt(0)}
                  </Avatar>
                }
                label={a.fullName}
                size="small"
                sx={{ height: 22, fontSize: '0.7rem' }}
              />
            ))
          )}
        </Box>

        {/* Timeline & Due Date */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pt: 1, borderTop: '1px solid #f1f5f9' }}>
          <Typography variant="caption" sx={{ color: task.isOverdue || isCompletedLate ? '#dc2626' : '#64748b', fontWeight: task.isOverdue || isCompletedLate ? 600 : 400 }}>
            Hạn: {formattedDate}
          </Typography>
          {task.isOverdue && (
            <Chip
              label={`Trễ ${task.overdueDays} ngày`}
              size="small"
              sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }}
            />
          )}
          {isCompletedLate && (
            <Chip
              label={`Xong trễ ${completedLateDays} ngày`}
              size="small"
              sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }}
            />
          )}
        </Box>

        {/* Progress Slider */}
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Slider
            size="small"
            value={localProgress}
            min={0}
            max={100}
            step={5}
            onChange={(_, val) => setLocalProgress(val as number)}
            onChangeCommitted={(_, val) => {
              const nextVal = val as number;
              if (nextVal !== task.progress) {
                onProgressChange(task.id, nextVal);
              }
            }}
            sx={{ color: localProgress >= 100 ? '#10b981' : '#0284c7' }}
          />
          <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 32, textAlign: 'right', color: '#0f172a' }}>
            {localProgress}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
});
