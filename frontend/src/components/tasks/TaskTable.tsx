import React, { memo, useState, useMemo } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
  useTheme,
  Skeleton,
} from '@mui/material';
import { FolderKanban, ChevronDown, ChevronRight, Inbox } from 'lucide-react';
import { TaskItem, TaskStatus, PriorityLevel } from '../../types';
import {
  StatusSelect,
  PrioritySelect,
  InlineEditCell,
  AssigneeSelectPopover,
  InlineDateEditCell,
  TaskProgressSlider,
} from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { PERMISSIONS } from '../../constants/permissions';

interface TaskTableProps {
  tasks: TaskItem[];
  loading: boolean;
  page?: number;
  rowsPerPage?: number;
  sortBy: string;
  isDescending: boolean;
  collapsedGroups?: Record<string, boolean>;
  onToggleGroup?: (groupKey: string) => void;
  onSort: (field: string) => void;
  onRowClick: (task: TaskItem) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onProgressChange: (taskId: string, progress: number) => void;
  onPriorityChange?: (taskId: string, priority: PriorityLevel) => void;
  onTaskNameChange?: (taskId: string, newName: string) => void;
  onAssigneesChange?: (taskId: string, assigneeUserIds: string[]) => void;
  onDatesChange?: (taskId: string, startDate: string, plannedEndDate: string) => void;
  canUpdateStatus?: boolean;
  canUpdateProgress?: boolean;
  canUpdatePriority?: boolean;
  canEditName?: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = memo(({
  tasks,
  loading,
  sortBy,
  isDescending,
  collapsedGroups: controlledCollapsedGroups,
  onToggleGroup,
  onSort,
  onRowClick,
  onStatusChange,
  onProgressChange,
  onPriorityChange,
  onTaskNameChange,
  onAssigneesChange,
  onDatesChange,
  canUpdateStatus = true,
  canUpdateProgress = true,
  canUpdatePriority = true,
  canEditName = true,
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { isSuperAdmin, can } = usePermission();
  const hasManagerRights = isSuperAdmin || can(PERMISSIONS.TASKS_EDIT);

  // State for tracking collapsed project groups (if not controlled from parent)
  const [internalCollapsedGroups, setInternalCollapsedGroups] = useState<Record<string, boolean>>({});

  const isControlled = controlledCollapsedGroups !== undefined;
  const currentCollapsedGroups = isControlled ? controlledCollapsedGroups : internalCollapsedGroups;

  const toggleGroup = (groupKey: string) => {
    if (onToggleGroup) {
      onToggleGroup(groupKey);
    } else {
      setInternalCollapsedGroups((prev) => ({
        ...prev,
        [groupKey]: !prev[groupKey],
      }));
    }
  };

  // Group tasks by project
  const projectGroups = useMemo(() => {
    const groups: {
      projectId: string;
      projectCode: string;
      projectName?: string;
      items: { task: TaskItem; originalIndex: number }[];
    }[] = [];

    const groupMap = new Map<string, typeof groups[0]>();

    tasks.forEach((task, idx) => {
      const pKey = task.projectCode || task.projectId || 'UNKNOWN';
      let group = groupMap.get(pKey);
      if (!group) {
        group = {
          projectId: task.projectId,
          projectCode: task.projectCode || 'Khác',
          projectName: task.projectName,
          items: [],
        };
        groupMap.set(pKey, group);
        groups.push(group);
      }
      group.items.push({ task, originalIndex: idx });
    });

    return groups;
  }, [tasks]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        bgcolor: 'background.paper',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <TableContainer
        sx={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 270px)',
          width: '100%',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Table
          stickyHeader
          sx={{
            width: '100%',
            minWidth: 1220,
            tableLayout: 'fixed',
            borderCollapse: 'separate',
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                bgcolor: isDark ? '#141414' : '#f8fafc',
                '& th': {
                  bgcolor: isDark ? '#141414 !important' : '#f8fafc',
                  color: isDark ? '#b4b4b4' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  py: 1.25,
                  px: 2,
                  whiteSpace: 'nowrap',
                },
              }}
            >
              <TableCell sx={{ width: 50, textAlign: 'center' }}>STT</TableCell>
              <TableCell sx={{ width: 105 }}>
                <TableSortLabel
                  active={sortBy === 'projectCode' || sortBy === 'projectCreatedAt'}
                  direction={isDescending ? 'desc' : 'asc'}
                  onClick={() => onSort('projectCode')}
                >
                  Mã Dự Án
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: 320 }}>
                <TableSortLabel
                  active={sortBy === 'name'}
                  direction={isDescending ? 'desc' : 'asc'}
                  onClick={() => onSort('name')}
                >
                  Tên Công Việc
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: 170 }}>Người Thực Hiện</TableCell>
              <TableCell sx={{ width: 120 }}>
                <TableSortLabel
                  active={sortBy === 'priority'}
                  direction={isDescending ? 'desc' : 'asc'}
                  onClick={() => onSort('priority')}
                >
                  Ưu Tiên
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: 165 }}>
                <TableSortLabel
                  active={sortBy === 'plannedEndDate'}
                  direction={isDescending ? 'desc' : 'asc'}
                  onClick={() => onSort('plannedEndDate')}
                >
                  Hạn Dự Kiến
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: 145 }}>
                <TableSortLabel
                  active={sortBy === 'status'}
                  direction={isDescending ? 'desc' : 'asc'}
                  onClick={() => onSort('status')}
                >
                  Trạng Thái
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: 145 }}>
                <TableSortLabel
                  active={sortBy === 'progress'}
                  direction={isDescending ? 'desc' : 'asc'}
                  onClick={() => onSort('progress')}
                >
                  Tiến Độ
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && tasks.length === 0 ? (
              Array.from({ length: 6 }).map((_, rIdx) => (
                <TableRow key={`skeleton-row-${rIdx}`}>
                  <TableCell sx={{ width: 50, textAlign: 'center', py: 1.25 }}>
                    <Skeleton variant="text" width={20} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell sx={{ width: 105, py: 1.25 }}>
                    <Skeleton variant="rounded" width={55} height={24} sx={{ borderRadius: 1 }} />
                  </TableCell>
                  <TableCell sx={{ width: 320, py: 1.25 }}>
                    <Skeleton variant="text" width="80%" height={20} />
                  </TableCell>
                  <TableCell sx={{ width: 170, py: 1.25 }}>
                    <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: 1 }} />
                  </TableCell>
                  <TableCell sx={{ width: 120, py: 1.25 }}>
                    <Skeleton variant="rounded" width={75} height={24} sx={{ borderRadius: 1 }} />
                  </TableCell>
                  <TableCell sx={{ width: 165, py: 1.25 }}>
                    <Skeleton variant="text" width="70%" height={20} />
                  </TableCell>
                  <TableCell sx={{ width: 145, py: 1.25 }}>
                    <Skeleton variant="rounded" width={95} height={24} sx={{ borderRadius: 1 }} />
                  </TableCell>
                  <TableCell sx={{ width: 145, py: 1.25 }}>
                    <Skeleton variant="rounded" width="80%" height={12} sx={{ borderRadius: 1 }} />
                  </TableCell>
                </TableRow>
              ))
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8, borderBottom: 'none' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <Inbox size={40} color="#94a3b8" strokeWidth={1.5} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Không tìm thấy công việc nào phù hợp với điều kiện lọc.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              projectGroups.map((group) => {
                const groupKey = group.projectCode || group.projectId;
                const isCollapsed = Boolean(currentCollapsedGroups[groupKey]);

                return (
                  <React.Fragment key={`group-${groupKey}`}>
                    {/* Collapsible Project Group Header Row */}
                    <TableRow
                      onClick={() => toggleGroup(groupKey)}
                      sx={{
                        bgcolor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#f1f5f9',
                        boxShadow: `inset 4px 0 0 ${isDark ? '#38bdf8' : '#0284c7'}`,
                        cursor: 'pointer',
                        userSelect: 'none',
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0',
                        },
                      }}
                    >
                      <TableCell
                        colSpan={8}
                        sx={{
                          py: 0.9,
                          px: 2,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title={isCollapsed ? 'Nhấp để mở rộng' : 'Nhấp để thu gọn'} arrow>
                            <IconButton
                              size="small"
                              sx={{
                                p: 0.25,
                                color: isDark ? '#38bdf8' : '#0284c7',
                                transition: 'transform 0.2s',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGroup(groupKey);
                              }}
                            >
                              {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                            </IconButton>
                          </Tooltip>
                          <FolderKanban size={17} color={isDark ? '#38bdf8' : '#0284c7'} />
                          <Chip
                            label={group.projectCode}
                            size="small"
                            sx={{
                              bgcolor: '#0284c7',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              height: 22,
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.primary' }}>
                            {group.projectName || 'Công trình'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            ({group.items.length} công việc)
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* Group Tasks Rows */}
                    {!isCollapsed &&
                      group.items.map(({ task, originalIndex }) => {
                        const isAssigned = Boolean(user?.id && task.assignees?.some((a) => a.userId === user.id || a.id === user.id));
                        const allowStatus = hasManagerRights || (canUpdateStatus && isAssigned) || isAssigned;
                        const allowProgress = hasManagerRights || (canUpdateProgress && isAssigned) || isAssigned;
                        const allowPriority = hasManagerRights || (canUpdatePriority && isAssigned) || isAssigned;
                        const allowEditName = (hasManagerRights || (canEditName && isAssigned)) && Boolean(onTaskNameChange);
                        const allowEditAssignees = (hasManagerRights || isAssigned) && Boolean(onAssigneesChange);
                        const allowEditDates = (hasManagerRights || isAssigned) && Boolean(onDatesChange);

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
                          <TableRow
                            key={task.id}
                            hover
                            onClick={() => onRowClick(task)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(255, 255, 255, 0.04) !important' : 'action.hover',
                              },
                            }}
                          >
                            {/* STT */}
                            <TableCell sx={{ textAlign: 'center', width: 50, py: 1, px: 2, fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {originalIndex + 1}
                            </TableCell>

                            {/* Project Code */}
                            <TableCell sx={{ width: 105, py: 1, px: 2, borderBottom: '1px solid', borderColor: 'divider', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              <Chip
                                label={task.projectCode || 'N/A'}
                                size="small"
                                sx={{
                                  bgcolor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                                  color: isDark ? '#38bdf8' : '#0369a1',
                                  border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : 'none',
                                  fontWeight: 800,
                                  fontSize: '0.75rem',
                                }}
                              />
                            </TableCell>

                            {/* Task Name */}
                            <TableCell sx={{ width: 320, py: 1, px: 2, borderBottom: '1px solid', borderColor: 'divider', overflow: 'hidden', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                              <InlineEditCell
                                value={task.name}
                                subtitle={task.parentName ? `Thuộc hạng mục: ${task.parentName}` : undefined}
                                disabled={!allowEditName}
                                onSave={(newName) => onTaskNameChange?.(task.id, newName)}
                                placeholder="Nhập tên công việc..."
                              />
                            </TableCell>

                            {/* Assignees */}
                            <TableCell sx={{ width: 170, py: 1, px: 2, borderBottom: '1px solid', borderColor: 'divider', overflow: 'hidden', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                              <AssigneeSelectPopover
                                assignees={task.assignees}
                                taskId={task.id}
                                projectId={task.projectId}
                                disabled={!allowEditAssignees}
                                onAssigneesChange={onAssigneesChange}
                              />
                            </TableCell>

                            {/* Priority */}
                            <TableCell sx={{ width: 120, py: 1, px: 2, borderBottom: '1px solid', borderColor: 'divider', overflow: 'hidden', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                              <PrioritySelect
                                value={task.priority}
                                onChange={(priority) => onPriorityChange?.(task.id, priority)}
                                disabled={!allowPriority}
                              />
                            </TableCell>

                            {/* Timeline */}
                            <TableCell sx={{ width: 165, py: 1, px: 2, borderBottom: '1px solid', borderColor: 'divider', overflow: 'hidden', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                              <InlineDateEditCell
                                mode="range"
                                startDate={task.startDate}
                                plannedEndDate={task.plannedEndDate}
                                isOverdue={task.isOverdue}
                                overdueDays={task.overdueDays}
                                isCompletedLate={isCompletedLate}
                                completedLateDays={completedLateDays}
                                disabled={!allowEditDates}
                                onDatesChange={(start, end) => onDatesChange?.(task.id, start, end)}
                              />
                            </TableCell>

                            {/* Status */}
                            <TableCell sx={{ width: 145, py: 1, px: 2, borderBottom: '1px solid', borderColor: 'divider', overflow: 'hidden', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                              <StatusSelect
                                value={task.status}
                                onChange={(status) => onStatusChange(task.id, status)}
                                disabled={!allowStatus}
                              />
                            </TableCell>

                            {/* Progress */}
                            <TableCell sx={{ width: 145, py: 1, px: 2, borderBottom: '1px solid', borderColor: 'divider', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              <TaskProgressSlider
                                value={task.progress}
                                disabled={!allowProgress}
                                onChange={(nextVal) => onProgressChange(task.id, nextVal)}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
});

TaskTable.displayName = 'TaskTable';
