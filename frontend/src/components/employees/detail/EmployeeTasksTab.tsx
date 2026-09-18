import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FolderKanban,
  Search,
  ExternalLink,
} from 'lucide-react';
import { CommonTable, ColumnDef } from '../../common/CommonTable';
import { CommonSelect } from '../../common/CommonSelect';
import { StatusChip } from '../../common/StatusChip';
import { PriorityBadge } from '../../common/PriorityBadge';
import { EmployeeTaskItem, EmployeeProjectParticipation } from '../../../types';
import { formatDate } from '../../../utils/dateUtils';

interface EmployeeTasksTabProps {
  tasks: EmployeeTaskItem[];
  projects: EmployeeProjectParticipation[];
  onSelectTask: (taskId: string) => void;
}

export const EmployeeTasksTab: React.FC<EmployeeTasksTabProps> = ({
  tasks,
  projects,
  onSelectTask,
}) => {
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');
  const [taskProjectFilter, setTaskProjectFilter] = useState('ALL');

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t: EmployeeTaskItem) => {
      const matchSearch =
        !taskSearch.trim() ||
        t.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.projectCode.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.projectName.toLowerCase().includes(taskSearch.toLowerCase());

      const matchStatus =
        taskStatusFilter === 'ALL' ||
        (taskStatusFilter === 'OVERDUE' ? t.isOverdue : t.status === taskStatusFilter);

      const matchProject =
        taskProjectFilter === 'ALL' || t.projectId === taskProjectFilter;

      return matchSearch && matchStatus && matchProject;
    });
  }, [tasks, taskSearch, taskStatusFilter, taskProjectFilter]);

  // Project Filter Options
  const projectOptions = useMemo(() => {
    const opts = [{ value: 'ALL', label: 'Tất cả dự án' }];
    projects.forEach((p: EmployeeProjectParticipation) => {
      opts.push({ value: p.projectId, label: `[${p.projectCode}] ${p.projectName}` });
    });
    return opts;
  }, [projects]);

  // Task Columns
  const taskColumns: ColumnDef<EmployeeTaskItem>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Hạng Mục / Công Việc',
        accessorKey: 'name',
        width: 380,
        minWidth: 320,
        cell: ({ row }) => (
          <Box
            onClick={() => onSelectTask(row.taskId)}
            sx={{
              cursor: 'pointer',
              '&:hover': { color: '#0284c7' },
              transition: 'color 0.15s ease',
              width: '100%',
              minWidth: 0,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: 'inherit',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={row.name}
            >
              {row.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.25,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={`[${row.projectCode}] ${row.projectName}`}
            >
              <FolderKanban size={13} color="#0284c7" style={{ flexShrink: 0 }} />
              <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                [{row.projectCode}] {row.projectName}
              </Box>
            </Typography>
          </Box>
        ),
      },
      {
        id: 'priority',
        header: 'Ưu Tiên',
        accessorKey: 'priority',
        width: 120,
        minWidth: 110,
        align: 'center',
        cell: ({ value }) => <PriorityBadge priority={value} size="small" />,
      },
      {
        id: 'status',
        header: 'Trạng Thái',
        accessorKey: 'status',
        width: 190,
        minWidth: 180,
        cell: ({ row }) => {
          const isDone = row.status === 'Completed';
          const isCompletedLate =
            isDone &&
            row.actualEndDate &&
            new Date(row.actualEndDate.split('T')[0]).getTime() > new Date(row.plannedEndDate.split('T')[0]).getTime();
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <StatusChip status={row.status} size="small" />
              {row.isOverdue && !isDone && (
                <Chip
                  label="Trễ hạn"
                  size="small"
                  sx={{
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.16)' : '#fee2e2',
                    color: (theme) => theme.palette.mode === 'dark' ? '#f87171' : '#ef4444',
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    height: 22,
                  }}
                />
              )}
              {isCompletedLate && (
                <Chip
                  label="Xong trễ"
                  size="small"
                  sx={{
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.16)' : '#fee2e2',
                    color: (theme) => theme.palette.mode === 'dark' ? '#f87171' : '#ef4444',
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    height: 22,
                  }}
                />
              )}
            </Box>
          );
        },
      },
      {
        id: 'progress',
        header: 'Tiến Độ',
        accessorKey: 'progress',
        width: 140,
        minWidth: 120,
        cell: ({ value, row }) => (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {Math.round(value)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, value))}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#3a3b3c' : '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  bgcolor:
                    row.status === 'Completed'
                      ? '#10b981'
                      : row.isOverdue
                      ? '#ef4444'
                      : '#0284c7',
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        ),
      },
      {
        id: 'plannedEndDate',
        header: 'Hạn Chót',
        accessorKey: 'plannedEndDate',
        width: 170,
        minWidth: 160,
        cell: ({ row }) => {
          const isDone = row.status === 'Completed';
          const isCompletedLate =
            isDone &&
            row.actualEndDate &&
            new Date(row.actualEndDate.split('T')[0]).getTime() > new Date(row.plannedEndDate.split('T')[0]).getTime();
          return (
            <Box>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {formatDate(row.plannedEndDate)}
              </Typography>
              {!isDone ? (
                <Typography
                  variant="caption"
                  sx={{
                    color: row.isOverdue ? '#ef4444' : row.daysRemaining <= 3 ? '#f59e0b' : '#64748b',
                    fontWeight: row.isOverdue || row.daysRemaining <= 3 ? 700 : 500,
                  }}
                >
                  {row.isOverdue
                    ? `Quá hạn ${Math.abs(row.daysRemaining)} ngày`
                    : row.daysRemaining === 0
                    ? 'Hạn hôm nay'
                    : `Còn ${row.daysRemaining} ngày`}
                </Typography>
              ) : isCompletedLate ? (
                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, display: 'block' }}>
                  Xong: {formatDate(row.actualEndDate!)} (Trễ hạn)
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, display: 'block' }}>
                  {row.actualEndDate ? `Xong: ${formatDate(row.actualEndDate)} (Đúng hạn)` : 'Hoàn thành đúng hạn'}
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        id: 'actions',
        header: 'Thao Tác',
        width: 80,
        minWidth: 80,
        align: 'center',
        cell: ({ row }) => (
          <Tooltip title="Xem chi tiết công việc">
            <IconButton
              size="small"
              onClick={() => onSelectTask(row.taskId)}
              sx={{ color: '#0284c7', '&:hover': { bgcolor: '#e0f2fe' } }}
            >
              <ExternalLink size={17} />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [onSelectTask]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Task Filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
        <TextField
          size="small"
          placeholder="Tìm kiếm công việc, mã dự án..."
          value={taskSearch}
          onChange={(e) => setTaskSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={17} color="#94a3b8" />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 280, md: 340 } }}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <CommonSelect
            label="Dự Án"
            value={taskProjectFilter}
            onChange={(val) => setTaskProjectFilter(val as string)}
            options={projectOptions}
            size="small"
            sx={{ minWidth: 180 }}
          />

          <CommonSelect
            label="Trạng Thái"
            value={taskStatusFilter}
            onChange={(val) => setTaskStatusFilter(val as string)}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'InProgress', label: 'Đang thực hiện' },
              { value: 'Completed', label: 'Đã hoàn thành' },
              { value: 'OVERDUE', label: 'Quá hạn (Overdue)' },
              { value: 'NotStarted', label: 'Chưa bắt đầu' },
              { value: 'OnHold', label: 'Tạm dừng' },
            ]}
            size="small"
            sx={{ minWidth: 170 }}
          />
        </Box>
      </Box>

      {/* Tasks Table */}
      <CommonTable<EmployeeTaskItem>
        data={filteredTasks}
        columns={taskColumns}
        minWidth={1050}
        emptyMessage={
          tasks.length === 0
            ? 'Nhân viên này chưa được phân công công việc nào.'
            : 'Không tìm thấy công việc phù hợp với bộ lọc.'
        }
      />
    </Box>
  );
};
