import React, { memo } from 'react';
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Chip,
  Avatar,
  Select,
  MenuItem,
  Slider,
  Tooltip,
  IconButton,
  Button,
  Paper,
} from '@mui/material';
import { Plus, Edit, Trash2, CornerDownRight } from 'lucide-react';
import { TaskTreeItem, TaskStatus } from '../../types';
import { StatusSelect } from '../common';
import { formatDate } from '../../utils/dateUtils';
import { getMediaUrl } from '../../utils/fileUtils';

interface ProjectTaskTreeTabProps {
  tasks: TaskTreeItem[];
  canEditTask: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onProgressChange: (taskId: string, progress: number) => void;
  onCreateSubTask: (parentId: string) => void;
  onEditTask: (task: TaskTreeItem) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateModal: () => void;
}

export const ProjectTaskTreeTab: React.FC<ProjectTaskTreeTabProps> = memo(({
  tasks,
  canEditTask,
  onStatusChange,
  onProgressChange,
  onCreateSubTask,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal,
}) => {
  const renderTaskRows = (items: TaskTreeItem[], level = 0, prefix = ''): React.ReactNode => {
    return items.map((task, idx) => {
      const currentStt = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
      return (
        <React.Fragment key={task.id}>
          <TableRow
            hover
            sx={{
              bgcolor: level === 0 ? '#f8fafc' : level === 1 ? '#ffffff' : '#fafafa',
              borderLeft: level > 0 ? `4px solid ${level === 1 ? '#0284c7' : '#94a3b8'}` : 'none',
            }}
          >
            {/* STT */}
            <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600, color: '#64748b', py: 1.5, width: '50px' }}>
              {currentStt}
            </TableCell>

            {/* Name & Indentation */}
            <TableCell sx={{ pl: `${16 + level * 20}px`, whiteSpace: 'nowrap', maxWidth: { xs: 200, sm: 300, md: 400 }, py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              {level > 0 && <CornerDownRight size={14} color="#94a3b8" style={{ flexShrink: 0 }} />}
              <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontWeight: level === 0 ? 700 : 600,
                    color: level === 0 ? '#0f172a' : '#334155',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                  title={task.name}
                >
                  {task.name}
                </Typography>
                {task.description && (
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      color: '#64748b',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                    }}
                    title={task.description}
                  >
                    {task.description}
                  </Typography>
                )}
              </Box>
            </Box>
          </TableCell>

          {/* Assignees */}
          <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 180, py: 1.5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, overflow: 'hidden' }}>
              {task.assignees.length === 0 ? (
                <Typography variant="caption" sx={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  Chưa gán
                </Typography>
              ) : (
                task.assignees.slice(0, 2).map((a) => (
                  <Chip
                    key={a.id}
                    label={a.fullName}
                    size="small"
                    avatar={<Avatar src={getMediaUrl(a.avatarUrl)} sx={{ width: 18, height: 18, fontSize: '0.65rem' }}>{a.fullName.charAt(0)}</Avatar>}
                    sx={{ height: 22, fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                  />
                ))
              )}
              {task.assignees.length > 2 && (
                <Chip
                  label={`+${task.assignees.length - 2}`}
                  size="small"
                  sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#f1f5f9' }}
                />
              )}
            </Box>
          </TableCell>

          {/* Timeline */}
          <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', display: 'block' }}>
              {formatDate(task.startDate, 'dd/MM')} - {formatDate(task.plannedEndDate, 'dd/MM/yyyy')}
            </Typography>
          </TableCell>

          {/* Status */}
          <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>
            <StatusSelect
              value={task.status}
              onChange={(status) => onStatusChange(task.id, status)}
              disabled={!canEditTask}
            />
          </TableCell>

          {/* Progress Slider */}
          <TableCell sx={{ width: 140, whiteSpace: 'nowrap', py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Slider
                size="small"
                value={task.progress}
                min={0}
                max={100}
                step={5}
                onChange={(_, val) => onProgressChange(task.id, val as number)}
                sx={{ color: task.progress >= 100 ? '#10b981' : '#0284c7', width: 70 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 30, whiteSpace: 'nowrap' }}>
                {task.progress}%
              </Typography>
            </Box>
          </TableCell>

          {/* Actions */}
          <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
              {canEditTask && (
                <Tooltip title="Thêm công việc con">
                  <IconButton size="small" onClick={() => onCreateSubTask(task.id)}>
                    <Plus size={15} color="#0284c7" />
                  </IconButton>
                </Tooltip>
              )}
              {canEditTask && (
                <Tooltip title="Chỉnh sửa công việc">
                  <IconButton size="small" onClick={() => onEditTask(task)}>
                    <Edit size={15} color="#64748b" />
                  </IconButton>
                </Tooltip>
              )}
              {canEditTask && (
                <Tooltip title="Xóa công việc">
                  <IconButton size="small" onClick={() => onDeleteTask(task.id)}>
                    <Trash2 size={15} color="#ef4444" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </TableCell>
        </TableRow>

        {/* Recursive Subtasks */}
        {task.children && task.children.length > 0 && renderTaskRows(task.children, level + 1, currentStt)}
      </React.Fragment>
    );
    });
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'auto',
        maxHeight: 'calc(100vh - 280px)',
      }}
    >
      <Table stickyHeader sx={{ minWidth: { xs: 750, md: '100%' } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '50px', textAlign: 'center', whiteSpace: 'nowrap', py: 1.5 }}>STT</TableCell>
            <TableCell sx={{ width: '35%', whiteSpace: 'nowrap', py: 1.5 }}>Hạng Mục / Công Việc</TableCell>
            <TableCell sx={{ width: '20%', whiteSpace: 'nowrap', py: 1.5 }}>Người Thực Hiện</TableCell>
            <TableCell sx={{ width: '16%', whiteSpace: 'nowrap', py: 1.5 }}>Thời Gian</TableCell>
            <TableCell sx={{ width: '14%', whiteSpace: 'nowrap', py: 1.5 }}>Trạng Thái</TableCell>
            <TableCell sx={{ width: '15%', whiteSpace: 'nowrap', py: 1.5 }}>Tiến Độ</TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6, whiteSpace: 'nowrap' }}>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1, whiteSpace: 'nowrap' }}>
                  Chưa có hạng mục công việc nào trong dự án này.
                </Typography>
                {canEditTask && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Plus size={14} />}
                    onClick={onOpenCreateModal}
                  >
                    Thêm Công Việc Đầu Tiên
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            renderTaskRows(tasks)
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
