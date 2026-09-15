import React, { memo, useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  Slider,
} from '@mui/material';
import { TaskItem, TaskStatus } from '../../types';
import { formatDate } from '../../utils/dateUtils';

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
        bgcolor: task.isOverdue ? '#fff5f5' : '#ffffff',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#0284c7',
          boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.20)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 2.2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header: Project Code & Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Chip
            label={task.projectCode}
            size="small"
            sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: '0.72rem' }}
          />
          <Box onClick={(e) => e.stopPropagation()}>
            <Select
              size="small"
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
              sx={{ height: 26, fontSize: '0.72rem', fontWeight: 600, minWidth: 110 }}
            >
              <MenuItem value="NotStarted">Chưa bắt đầu</MenuItem>
              <MenuItem value="InProgress">Đang thực hiện</MenuItem>
              <MenuItem value="Completed">Hoàn thành</MenuItem>
              <MenuItem value="OnHold">Tạm dừng</MenuItem>
            </Select>
          </Box>
        </Box>

        {/* Task Name & Parent */}
        <Typography
          variant="subtitle2"
          noWrap
          sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', mb: 0.2 }}
          title={task.name}
        >
          {task.name}
        </Typography>

        {task.parentName && (
          <Typography variant="caption" noWrap sx={{ color: '#64748b', mb: 1.5, display: 'block' }}>
            Thuộc: {task.parentName}
          </Typography>
        )}

        {/* Assignees */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5, mt: 'auto' }}>
          {task.assignees.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Chưa gán người thực hiện
            </Typography>
          ) : (
            task.assignees.map((a) => (
              <Chip
                key={a.id}
                label={a.fullName}
                size="small"
                sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#f1f5f9', color: '#334155' }}
              />
            ))
          )}
        </Box>

        {/* Timeline & Due Date */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pt: 1, borderTop: '1px solid #f1f5f9' }}>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Hạn: {formattedDate}
          </Typography>
          {task.isOverdue && (
            <Chip
              label={`Trễ ${task.overdueDays} ngày`}
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
