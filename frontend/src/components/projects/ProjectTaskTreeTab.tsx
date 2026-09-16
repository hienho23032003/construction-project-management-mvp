import React, { memo, useMemo, useRef } from 'react';
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
  Slider,
  Tooltip,
  IconButton,
  Button,
  Paper,
} from '@mui/material';
import { Plus, Edit, Trash2, CornerDownRight } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TaskTreeItem, TaskStatus } from '../../types';
import { StatusSelect } from '../common';
import { formatDate } from '../../utils/dateUtils';
import { getMediaUrl } from '../../utils/fileUtils';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { PERMISSIONS } from '../../constants/permissions';

interface ProjectTaskTreeTabProps {
  tasks: TaskTreeItem[];
  canEditTask?: boolean;
  canCreateTask?: boolean;
  canDeleteTask?: boolean;
  canUpdateStatus?: boolean;
  canUpdateProgress?: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onProgressChange: (taskId: string, progress: number) => void;
  onCreateSubTask: (parentId: string) => void;
  onEditTask: (task: TaskTreeItem) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateModal: () => void;
}

interface FlattenedTaskItem {
  task: TaskTreeItem;
  level: number;
  stt: string;
}

export const ProjectTaskTreeTab: React.FC<ProjectTaskTreeTabProps> = memo(({
  tasks,
  canEditTask = false,
  canCreateTask = false,
  canDeleteTask = false,
  canUpdateStatus = false,
  canUpdateProgress = false,
  onStatusChange,
  onProgressChange,
  onCreateSubTask,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal,
}) => {
  const { user } = useAuth();
  const { isSuperAdmin, can } = usePermission();
  const hasManagerRights = isSuperAdmin || can(PERMISSIONS.TASKS_EDIT) || canEditTask;
  const allowCreate = canCreateTask || canEditTask || hasManagerRights;
  const allowEdit = hasManagerRights;
  const allowDelete = canDeleteTask || isSuperAdmin || can(PERMISSIONS.TASKS_DELETE);
  const hasAnyAction = allowCreate || allowEdit || allowDelete;
  const totalCols = hasAnyAction ? 7 : 6;
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Flatten the recursive tree into a flat list with depth levels for virtualization
  const flattenedTasks = useMemo(() => {
    const list: FlattenedTaskItem[] = [];
    const traverse = (items: TaskTreeItem[], level = 0, prefix = '') => {
      items.forEach((item, idx) => {
        const currentStt = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
        list.push({ task: item, level, stt: currentStt });
        if (item.children && item.children.length > 0) {
          traverse(item.children, level + 1, currentStt);
        }
      });
    };
    traverse(tasks);
    return list;
  }, [tasks]);

  // Virtualizer for smooth rendering of thousands of rows
  const rowVirtualizer = useVirtualizer({
    count: flattenedTasks.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48, // Estimated row height in px
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? totalHeight - virtualItems[virtualItems.length - 1].end
      : 0;

  return (
    <TableContainer
      ref={tableContainerRef}
      component={Paper}
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'auto',
        maxHeight: 'calc(100vh - 280px)',
        position: 'relative',
      }}
    >
      <Table stickyHeader sx={{ minWidth: { xs: 750, md: '100%' } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '50px', textAlign: 'center', whiteSpace: 'nowrap', py: 1.5 }}>STT</TableCell>
            <TableCell sx={{ width: '30%', whiteSpace: 'nowrap', py: 1.5 }}>Hạng Mục / Công Việc</TableCell>
            <TableCell sx={{ width: '22%', whiteSpace: 'nowrap', py: 1.5 }}>Người Thực Hiện</TableCell>
            <TableCell sx={{ width: '15%', whiteSpace: 'nowrap', py: 1.5 }}>Thời Gian</TableCell>
            <TableCell sx={{ width: '14%', whiteSpace: 'nowrap', py: 1.5 }}>Trạng Thái</TableCell>
            <TableCell sx={{ width: '15%', whiteSpace: 'nowrap', py: 1.5 }}>Tiến Độ</TableCell>
            {hasAnyAction && (
              <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Thao Tác</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {flattenedTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalCols} align="center" sx={{ py: 6, whiteSpace: 'nowrap' }}>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1, whiteSpace: 'nowrap' }}>
                  Chưa có hạng mục công việc nào trong dự án này.
                </Typography>
                {allowCreate && (
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
            <>
              {paddingTop > 0 && (
                <TableRow>
                  <TableCell colSpan={totalCols} sx={{ height: `${paddingTop}px`, p: 0, border: 'none' }} />
                </TableRow>
              )}
              {virtualItems.map((virtualRow) => {
                const { task, level, stt } = flattenedTasks[virtualRow.index];
                const isAssigned = Boolean(user?.id && task.assignees?.some((a) => a.userId === user.id || a.id === user.id));
                const rowAllowStatus = hasManagerRights || (canUpdateStatus && isAssigned) || isAssigned;
                const rowAllowProgress = hasManagerRights || (canUpdateProgress && isAssigned) || isAssigned;

                return (
                  <TableRow
                    key={task.id}
                    hover
                    sx={{
                      height: `${virtualRow.size}px`,
                      bgcolor: level === 0 ? '#f8fafc' : level === 1 ? '#ffffff' : '#fafafa',
                      borderLeft: level > 0 ? `4px solid ${level === 1 ? '#0284c7' : '#94a3b8'}` : 'none',
                    }}
                  >
                    {/* STT */}
                    <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600, color: '#64748b', py: 1, width: '50px' }}>
                      {stt}
                    </TableCell>

                    {/* Name & Indentation */}
                    <TableCell sx={{ pl: `${16 + level * 20}px`, whiteSpace: 'nowrap', maxWidth: { xs: 200, sm: 300, md: 400 }, py: 1 }}>
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
                    <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 180, py: 1 }}>
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
                    <TableCell sx={{ whiteSpace: 'nowrap', py: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', display: 'block' }}>
                        {formatDate(task.startDate, 'dd/MM')} - {formatDate(task.plannedEndDate, 'dd/MM/yyyy')}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ whiteSpace: 'nowrap', py: 1 }}>
                      <StatusSelect
                        value={task.status}
                        onChange={(status) => onStatusChange(task.id, status)}
                        disabled={!rowAllowStatus}
                      />
                    </TableCell>

                    {/* Progress Slider */}
                    <TableCell sx={{ width: 140, whiteSpace: 'nowrap', py: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Slider
                          size="small"
                          value={task.progress}
                          min={0}
                          max={100}
                          step={5}
                          disabled={!rowAllowProgress}
                          onChange={(_, val) => onProgressChange(task.id, val as number)}
                          sx={{ color: task.progress >= 100 ? '#10b981' : '#0284c7', width: 70 }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 30, whiteSpace: 'nowrap' }}>
                          {task.progress}%
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    {hasAnyAction && (
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          {allowCreate && (
                            <Tooltip title="Thêm công việc con">
                              <IconButton size="small" onClick={() => onCreateSubTask(task.id)}>
                                <Plus size={15} color="#0284c7" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {allowEdit && (
                            <Tooltip title="Chỉnh sửa công việc">
                              <IconButton size="small" onClick={() => onEditTask(task)}>
                                <Edit size={15} color="#64748b" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {allowDelete && (
                            <Tooltip title="Xóa công việc">
                              <IconButton size="small" onClick={() => onDeleteTask(task.id)}>
                                <Trash2 size={15} color="#ef4444" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {paddingBottom > 0 && (
                <TableRow>
                  <TableCell colSpan={totalCols} sx={{ height: `${paddingBottom}px`, p: 0, border: 'none' }} />
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
