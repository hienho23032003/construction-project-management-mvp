import React, { memo, useState, useEffect, useMemo } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Chip,
  Box,
  Typography,
  Slider,
  Skeleton,
  IconButton,
  Tooltip,
  Avatar,
  useTheme,
} from '@mui/material';
import { FolderKanban, ChevronDown, ChevronRight } from 'lucide-react';
import { TaskItem, TaskStatus, PriorityLevel } from '../../types';
import { StatusSelect, PrioritySelect } from '../common';
import { formatDate } from '../../utils/dateUtils';
import { getMediaUrl } from '../../utils/fileUtils';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { PERMISSIONS } from '../../constants/permissions';

interface TaskTableRowProps {
  task: TaskItem;
  stt: number;
  canUpdateStatus?: boolean;
  canUpdateProgress?: boolean;
  canUpdatePriority?: boolean;
  onRowClick: (task: TaskItem) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onProgressChange: (taskId: string, progress: number) => void;
  onPriorityChange?: (taskId: string, priority: PriorityLevel) => void;
}

const TaskTableRow: React.FC<TaskTableRowProps> = memo(({
  task,
  stt,
  canUpdateStatus = true,
  canUpdateProgress = true,
  canUpdatePriority = true,
  onRowClick,
  onStatusChange,
  onProgressChange,
  onPriorityChange,
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { isSuperAdmin, can } = usePermission();
  const hasManagerRights = isSuperAdmin || can(PERMISSIONS.TASKS_EDIT);
  const isAssigned = Boolean(user?.id && task.assignees?.some((a) => a.userId === user.id || a.id === user.id));
  const allowStatus = hasManagerRights || (canUpdateStatus && isAssigned) || isAssigned;
  const allowProgress = hasManagerRights || (canUpdateProgress && isAssigned) || isAssigned;
  const allowPriority = hasManagerRights || (canUpdatePriority && isAssigned) || isAssigned;

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
    <TableRow
      hover
      onClick={() => onRowClick(task)}
      sx={{
        cursor: 'pointer',
        bgcolor: 'inherit',
        '&:hover': {
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.04) !important' : 'action.hover',
        },
      }}
    >
      <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600, color: 'text.secondary' }}>
        {stt}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
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
      <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 200 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            whiteSpace: 'nowrap',
          }}
          title={task.name}
        >
          {task.name}
        </Typography>
        {task.parentName && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
            title={`Thuộc hạng mục: ${task.parentName}`}
          >
            Thuộc hạng mục: {task.parentName}
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 140 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: 0.5 }}>
          {task.assignees.length === 0 ? (
            <Typography variant="caption" sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}>
              Chưa gán
            </Typography>
          ) : (
            <>
              <Chip
                key={task.assignees[0].id || task.assignees[0].userId}
                avatar={
                  <Avatar
                    src={getMediaUrl(task.assignees[0].avatarUrl)}
                    sx={{ width: 18, height: 18, fontSize: '0.65rem' }}
                  >
                    {task.assignees[0].fullName.charAt(0)}
                  </Avatar>
                }
                label={task.assignees[0].fullName}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap',
                  maxWidth: task.assignees.length > 1 ? 120 : 160,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : undefined,
                  border: `1px solid ${theme.palette.divider}`,
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  },
                }}
              />
              {task.assignees.length > 1 && (
                <Tooltip
                  title={
                    <Box sx={{ p: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.25, display: 'block', color: 'inherit' }}>
                        Người thực hiện khác ({task.assignees.length - 1}):
                      </Typography>
                      {task.assignees.slice(1).map((a) => (
                        <Box key={a.id || a.userId} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Avatar
                            src={getMediaUrl(a.avatarUrl)}
                            sx={{ width: 18, height: 18, fontSize: '0.65rem' }}
                          >
                            {a.fullName.charAt(0)}
                          </Avatar>
                          <Typography variant="caption" sx={{ color: 'inherit' }}>
                            {a.fullName}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  }
                  arrow
                  placement="top"
                >
                  <Chip
                    label={`+${task.assignees.length - 1}`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                      color: 'text.secondary',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  />
                </Tooltip>
              )}
            </>
          )}
        </Box>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()} sx={{ whiteSpace: 'nowrap' }}>
        <PrioritySelect
          value={task.priority}
          onChange={(priority) => onPriorityChange?.(task.id, priority)}
          disabled={!allowPriority}
        />
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: task.isOverdue || isCompletedLate ? (isDark ? '#f87171' : '#ef4444') : 'text.primary',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          {formattedDate}
          {task.isOverdue && ` (Trễ ${task.overdueDays} ngày)`}
          {isCompletedLate && ` (Trễ ${completedLateDays} ngày)`}
        </Typography>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()} sx={{ whiteSpace: 'nowrap' }}>
        <StatusSelect
          value={task.status}
          onChange={(status) => onStatusChange(task.id, status)}
          disabled={!allowStatus}
        />
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()} sx={{ whiteSpace: 'nowrap', minWidth: 120 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Slider
            size="small"
            value={localProgress}
            min={0}
            max={100}
            step={5}
            disabled={!allowProgress}
            onChange={(_, val) => setLocalProgress(val as number)}
            onChangeCommitted={(_, val) => {
              const nextVal = val as number;
              if (nextVal !== task.progress) {
                onProgressChange(task.id, nextVal);
              }
            }}
            sx={{ color: localProgress >= 100 ? (isDark ? '#34d399' : '#10b981') : (isDark ? '#38bdf8' : '#0284c7') }}
          />
          <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 30, whiteSpace: 'nowrap', color: 'text.primary' }}>
            {localProgress}%
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
});

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
  canUpdateStatus?: boolean;
  canUpdateProgress?: boolean;
  canUpdatePriority?: boolean;
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
  canUpdateStatus = true,
  canUpdateProgress = true,
  canUpdatePriority = true,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
    <TableContainer
      sx={{
        overflow: 'auto',
        maxHeight: 'calc(100vh - 270px)',
        bgcolor: 'background.paper',
      }}
    >
      <Table
        stickyHeader
        sx={{
          width: '100%',
          minWidth: { xs: 'max-content', md: '100%' },
          tableLayout: { xs: 'auto !important', sm: 'auto !important', md: 'auto' },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ minWidth: 50, textAlign: 'center', whiteSpace: 'nowrap', py: 1.5 }}>
              STT
            </TableCell>
            <TableCell sx={{ minWidth: 100, whiteSpace: 'nowrap', py: 1.5 }}>
              <TableSortLabel
                active={sortBy === 'projectCode'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('projectCode')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Mã Dự Án
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ minWidth: 220, whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              <TableSortLabel
                active={sortBy === 'name'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('name')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Tên Công Việc
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ minWidth: 150, whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              Người Thực Hiện
            </TableCell>
            <TableCell sx={{ minWidth: 125, whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              <TableSortLabel
                active={sortBy === 'priority'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('priority')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Ưu Tiên
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              <TableSortLabel
                active={sortBy === 'plannedEndDate'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('plannedEndDate')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Hạn Dự Kiến
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ minWidth: 130, whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              <TableSortLabel
                active={sortBy === 'status'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('status')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Trạng Thái
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              <TableSortLabel
                active={sortBy === 'progress'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('progress')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Tiến Độ
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && tasks.length === 0 ? (
            Array.from({ length: 6 }).map((_, r) => (
              <TableRow key={r}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><Skeleton variant="text" width={24} height={20} sx={{ mx: 'auto' }} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><Skeleton variant="text" width="80%" height={22} /><Skeleton variant="text" width="40%" height={16} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><Skeleton variant="rounded" width={90} height={22} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><Skeleton variant="rounded" width={75} height={24} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><Skeleton variant="text" width={80} height={20} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><Skeleton variant="rounded" width={100} height={28} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><Skeleton variant="rounded" width="90%" height={12} sx={{ borderRadius: 1 }} /></TableCell>
              </TableRow>
            ))
          ) : tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.disabled', whiteSpace: 'nowrap' }}>
                Không tìm thấy công việc nào phù hợp với điều kiện lọc.
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
                      bgcolor: isDark ? 'rgba(0, 0, 0, 0.35)' : '#f1f5f9',
                      borderLeft: `4px solid ${isDark ? '#38bdf8' : '#0284c7'}`,
                      cursor: 'pointer',
                      userSelect: 'none',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.06) !important' : '#e2e8f0 !important',
                      },
                      '& td': {
                        py: 0.85,
                        px: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      },
                    }}
                  >
                    <TableCell colSpan={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
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
                              bgcolor: isDark ? '#0284c7' : '#0284c7',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              height: 22,
                            }}
                          />
                          {group.projectName && (
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }}
                            >
                              {group.projectName}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={isCollapsed ? `${group.items.length} công việc (Đã thu gọn)` : `${group.items.length} công việc`}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: isCollapsed ? (isDark ? '#38bdf8' : '#0284c7') : theme.palette.divider,
                              bgcolor: isCollapsed
                                ? isDark
                                  ? 'rgba(56, 189, 248, 0.15)'
                                  : '#e0f2fe'
                                : isDark
                                ? 'rgba(255, 255, 255, 0.05)'
                                : '#ffffff',
                              color: isCollapsed ? (isDark ? '#38bdf8' : '#0369a1') : 'text.secondary',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 22,
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Group Tasks (rendered if not collapsed) */}
                  {!isCollapsed &&
                    group.items.map((item) => (
                      <TaskTableRow
                        key={item.task.id}
                        task={item.task}
                        stt={item.originalIndex + 1}
                        canUpdateStatus={canUpdateStatus}
                        canUpdateProgress={canUpdateProgress}
                        canUpdatePriority={canUpdatePriority}
                        onRowClick={onRowClick}
                        onStatusChange={onStatusChange}
                        onProgressChange={onProgressChange}
                        onPriorityChange={onPriorityChange}
                      />
                    ))}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
