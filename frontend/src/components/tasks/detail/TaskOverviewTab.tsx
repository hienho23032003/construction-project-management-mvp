import React from 'react';
import { Box, Typography, Chip, Paper, Avatar } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import { TaskItem, TaskDependency } from '../../../types';
import { StatusChip } from '../../common/StatusChip';
import { ProgressBar } from '../../common';
import { formatDate } from '../../../utils/dateUtils';
import { getMediaUrl } from '../../../utils/fileUtils';

interface TaskOverviewTabProps {
  task: TaskItem;
  dependencies: TaskDependency[];
  isCompletedLate: boolean;
  completedLateDays: number;
}

const getDependencyTypeLabel = (type: string): string => {
  switch (type) {
    case 'FinishToStart':
    case '0':
      return 'Xong - Bắt đầu (FS)';
    case 'StartToStart':
    case '1':
      return 'Cùng Bắt đầu (SS)';
    case 'FinishToFinish':
    case '2':
      return 'Cùng Kết thúc (FF)';
    case 'StartToFinish':
    case '3':
      return 'Bắt đầu - Kết thúc (SF)';
    default:
      return type;
  }
};

export const TaskOverviewTab: React.FC<TaskOverviewTabProps> = ({
  task,
  dependencies,
  isCompletedLate,
  completedLateDays,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Properties Grid */}
      <Paper sx={{ p: 2, borderRadius: '8px', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
              Trạng thái hiện tại:
            </Typography>
            <StatusChip status={task.status} isOverdue={task.isOverdue} />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
              Tiến độ hoàn thành:
            </Typography>
            <ProgressBar value={task.progress} height={8} showText={true} />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
              Ngày bắt đầu dự kiến:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
              {formatDate(task.startDate)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
              Hạn hoàn thành (Deadline):
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: task.isOverdue ? '#ef4444' : '#0f172a' }}>
              {formatDate(task.plannedEndDate)}
            </Typography>
          </Box>

          {task.actualEndDate && (
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Ngày thực tế hoàn thành:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: isCompletedLate ? '#ef4444' : '#10b981' }}>
                {formatDate(task.actualEndDate)} {isCompletedLate ? `(Trễ ${completedLateDays} ngày)` : '(Đúng hạn)'}
              </Typography>
            </Box>
          )}

          <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.75 }}>
              Nhân sự phụ trách thi công:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {task.assignees.length === 0 ? (
                <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  Chưa phân công nhân sự
                </Typography>
              ) : (
                task.assignees.map((a) => (
                  <Chip
                    key={a.id}
                    avatar={
                      <Avatar
                        src={getMediaUrl(a.avatarUrl) || undefined}
                        sx={{
                          bgcolor: '#0284c7 !important',
                          color: '#ffffff !important',
                          fontWeight: 700,
                        }}
                      >
                        {a.fullName.charAt(0)}
                      </Avatar>
                    }
                    label={a.fullName}
                    size="small"
                    sx={{
                      bgcolor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      fontWeight: 600,
                      height: 26,
                      '& .MuiChip-avatar': {
                        color: '#ffffff !important',
                        bgcolor: '#0284c7 !important',
                      },
                    }}
                  />
                ))
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Description */}
      {task.description && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
            Mô Tả Yêu Cầu Kỹ Thuật
          </Typography>
          <Box sx={{ bgcolor: '#ffffff', p: 2, borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {task.description}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Task Dependencies */}
      {dependencies.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
            Liên Kết Phụ Thuộc Công Việc ({dependencies.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {dependencies.map((d) => (
              <Box
                key={d.id}
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                    {d.predecessorTaskName}
                  </Typography>
                  <ArrowRight size={14} color="#64748b" />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0284c7' }}>
                    {d.successorTaskName}
                  </Typography>
                </Box>
                <Chip
                  label={getDependencyTypeLabel(d.dependencyType)}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    borderRadius: '6px',
                    flexShrink: 0,
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
