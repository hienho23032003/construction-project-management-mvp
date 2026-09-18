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
  Tooltip,
  IconButton,
  Button,
  Paper,
} from '@mui/material';
import { Plus, Edit, Trash2, CornerDownRight } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TaskTreeItem, TaskStatus, PriorityLevel } from '../../types';
import { StatusSelect, PrioritySelect, InlineEditCell, AssigneeSelectPopover, InlineDateEditCell, TaskProgressSlider } from '../common';
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
  canUpdatePriority?: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onProgressChange: (taskId: string, progress: number) => void;
  onPriorityChange?: (taskId: string, priority: PriorityLevel) => void;
  onTaskNameChange?: (taskId: string, newName: string) => void;
  onAssigneesChange?: (taskId: string, assigneeUserIds: string[]) => void;
  onDatesChange?: (taskId: string, startDate: string, plannedEndDate: string) => void;
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
  canUpdatePriority = false,
  onStatusChange,
  onProgressChange,
  onPriorityChange,
  onTaskNameChange,
  onAssigneesChange,
  onDatesChange,
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
  const totalCols = hasAnyAction ? 8 : 7;
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
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px',
        overflow: 'auto',
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 280px)',
        position: 'relative',
      }}
    >
      <Table stickyHeader sx={{ tableLayout: 'fixed', minWidth: 1230, width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 50, textAlign: 'center', whiteSpace: 'nowrap', py: 1.5 }}>STT</TableCell>
            <TableCell sx={{ width: 340, whiteSpace: 'nowrap', py: 1.5 }}>Hạng Mục / Công Việc</TableCell>
            <TableCell sx={{ width: 170, whiteSpace: 'nowrap', py: 1.5 }}>Người Thực Hiện</TableCell>
            <TableCell sx={{ width: 160, whiteSpace: 'nowrap', py: 1.5 }}>Ưu Tiên</TableCell>
            <TableCell sx={{ width: 165, whiteSpace: 'nowrap', py: 1.5 }}>Thời Gian</TableCell>
            <TableCell sx={{ width: 180, whiteSpace: 'nowrap', py: 1.5 }}>Trạng Thái</TableCell>
            <TableCell sx={{ width: 160, whiteSpace: 'nowrap', py: 1.5 }}>Tiến Độ</TableCell>
            {hasAnyAction && (
              <TableCell align="right" sx={{ width: 90, whiteSpace: 'nowrap', py: 1.5 }}>Thao Tác</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {flattenedTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalCols} align="center" sx={{ py: 6, whiteSpace: 'nowrap' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, whiteSpace: 'nowrap' }}>
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
                const rowAllowPriority = hasManagerRights || (canUpdatePriority && isAssigned) || isAssigned;

                return (
                  <TableRow
                    key={task.id}
                    hover
                    sx={{
                      height: `${virtualRow.size}px`,
                      bgcolor: (theme) => {
                        const isDark = theme.palette.mode === 'dark';
                        if (isDark) {
                          return level === 0 ? '#18191a' : level === 1 ? '#242526' : '#1e1f20';
                        }
                        return level === 0 ? '#f8fafc' : level === 1 ? '#ffffff' : '#fafafa';
                      },
                      boxShadow: level > 0 ? (level === 1 ? 'inset 4px 0 0 #0284c7' : 'inset 4px 0 0 #7b7b7b') : 'none',
                    }}
                  >
                    {/* STT */}
                    <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600, color: 'text.secondary', py: 1, width: 50 }}>
                      {stt}
                    </TableCell>

                    {/* Name & Indentation */}
                    <TableCell sx={{ pl: `${16 + level * 20}px`, whiteSpace: 'nowrap', width: 340, py: 1, overflow: 'hidden' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        {level > 0 && <CornerDownRight size={14} color="#7b7b7b" style={{ flexShrink: 0 }} />}
                        <InlineEditCell
                          value={task.name}
                          subtitle={task.description || undefined}
                          disabled={!allowEdit || !onTaskNameChange}
                          onSave={(newName) => onTaskNameChange?.(task.id, newName)}
                          placeholder="Nhập tên hạng mục..."
                          fontWeight={level === 0 ? 700 : 600}
                          typographyVariant={level === 0 ? 'subtitle2' : 'body2'}
                          modalTitle={level === 0 ? 'Chỉnh sửa tên hạng mục' : 'Chỉnh sửa tên công việc'}
                        />
                      </Box>
                    </TableCell>

                    {/* Assignees */}
                    <TableCell sx={{ whiteSpace: 'nowrap', width: 170, py: 1, overflow: 'hidden' }}>
                      <AssigneeSelectPopover
                        assignees={task.assignees}
                        taskId={task.id}
                        projectId={task.projectId}
                        disabled={!allowEdit || !onAssigneesChange}
                        onAssigneesChange={onAssigneesChange}
                      />
                    </TableCell>

                    {/* Priority */}
                    <TableCell sx={{ whiteSpace: 'nowrap', width: 115, py: 1, overflow: 'hidden' }}>
                      <PrioritySelect
                        value={task.priority}
                        onChange={(priority) => onPriorityChange?.(task.id, priority)}
                        disabled={!rowAllowPriority}
                      />
                    </TableCell>

                    {/* Timeline */}
                    <TableCell sx={{ whiteSpace: 'nowrap', width: 165, py: 1, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                      <InlineDateEditCell
                        mode="range"
                        startDate={task.startDate}
                        plannedEndDate={task.plannedEndDate}
                        disabled={!allowEdit || !onDatesChange}
                        onDatesChange={(start, end) => onDatesChange?.(task.id, start, end)}
                      />
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ whiteSpace: 'nowrap', width: 150, py: 1, overflow: 'hidden' }}>
                      <StatusSelect
                        value={task.status}
                        onChange={(status) => onStatusChange(task.id, status)}
                        disabled={!rowAllowStatus}
                      />
                    </TableCell>

                    {/* Progress Slider */}
                    <TableCell sx={{ width: 150, whiteSpace: 'nowrap', py: 1, overflow: 'hidden' }}>
                      <TaskProgressSlider
                        value={task.progress}
                        disabled={!rowAllowProgress}
                        onChange={(nextVal) => onProgressChange(task.id, nextVal)}
                      />
                    </TableCell>

                    {/* Actions */}
                    {hasAnyAction && (
                      <TableCell align="right" sx={{ width: 90, whiteSpace: 'nowrap', py: 1, overflow: 'hidden' }}>
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
