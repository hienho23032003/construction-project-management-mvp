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
  Select,
  MenuItem,
  Slider,
  Skeleton,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import { FolderKanban, ChevronDown, ChevronRight } from 'lucide-react';
import { TaskItem, TaskStatus } from '../../types';
import { StatusSelect } from '../common';
import { formatDate } from '../../utils/dateUtils';
import { getMediaUrl } from '../../utils/fileUtils';

interface TaskTableRowProps {
  task: TaskItem;
  stt: number;
  canUpdateStatus?: boolean;
  canUpdateProgress?: boolean;
  onRowClick: (task: TaskItem) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onProgressChange: (taskId: string, progress: number) => void;
}

const TaskTableRow: React.FC<TaskTableRowProps> = memo(({
  task,
  stt,
  canUpdateStatus = true,
  canUpdateProgress = true,
  onRowClick,
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
    <TableRow
      hover
      onClick={() => onRowClick(task)}
      sx={{
        cursor: 'pointer',
        bgcolor: task.isOverdue || isCompletedLate ? '#fffdfd' : 'inherit',
        '&:hover': { bgcolor: '#f8fafc !important' },
      }}
    >
      <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600, color: '#64748b' }}>
        {stt}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Chip
          label={task.projectCode || 'N/A'}
          size="small"
          sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: '0.75rem' }}
        />
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 200 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#0f172a',
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
              color: '#64748b',
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
        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5 }}>
          {task.assignees.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
              Chưa gán
            </Typography>
          ) : (
            task.assignees.slice(0, 2).map((a) => (
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
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: task.isOverdue || isCompletedLate ? '#ef4444' : '#334155',
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
          disabled={!canUpdateStatus}
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
            disabled={!canUpdateProgress}
            onChange={(_, val) => setLocalProgress(val as number)}
            onChangeCommitted={(_, val) => {
              const nextVal = val as number;
              if (nextVal !== task.progress) {
                onProgressChange(task.id, nextVal);
              }
            }}
            sx={{ color: localProgress >= 100 ? '#10b981' : '#0284c7' }}
          />
          <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 30, whiteSpace: 'nowrap' }}>
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
  canUpdateStatus?: boolean;
  canUpdateProgress?: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = memo(({
  tasks,
  loading,
  page = 0,
  rowsPerPage = 10,
  sortBy,
  isDescending,
  collapsedGroups: controlledCollapsedGroups,
  onToggleGroup,
  onSort,
  onRowClick,
  onStatusChange,
  onProgressChange,
  canUpdateStatus = true,
  canUpdateProgress = true,
}) => {
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
                <TableCell sx={{ whiteSpace: 'nowrap' }}><Skeleton variant="text" width={80} height={20} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><Skeleton variant="rounded" width={100} height={28} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><Skeleton variant="rounded" width="90%" height={12} sx={{ borderRadius: 1 }} /></TableCell>
              </TableRow>
            ))
          ) : tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8', whiteSpace: 'nowrap' }}>
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
                      bgcolor: '#f1f5f9',
                      borderLeft: '4px solid #0284c7',
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        bgcolor: '#e2e8f0 !important',
                      },
                      '& td': {
                        py: 0.85,
                        px: 2,
                        borderBottom: '1px solid #cbd5e1',
                      },
                    }}
                  >
                    <TableCell colSpan={7}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title={isCollapsed ? 'Nhấp để mở rộng' : 'Nhấp để thu gọn'} arrow>
                            <IconButton
                              size="small"
                              sx={{
                                p: 0.25,
                                color: '#0284c7',
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
                          <FolderKanban size={17} color="#0284c7" />
                          <Chip
                            label={group.projectCode}
                            size="small"
                            sx={{
                              bgcolor: '#0284c7',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              height: 22,
                            }}
                          />
                          {group.projectName && (
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}
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
                              borderColor: isCollapsed ? '#0284c7' : '#94a3b8',
                              bgcolor: isCollapsed ? '#e0f2fe' : '#ffffff',
                              color: isCollapsed ? '#0369a1' : '#475569',
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
                        onRowClick={onRowClick}
                        onStatusChange={onStatusChange}
                        onProgressChange={onProgressChange}
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
