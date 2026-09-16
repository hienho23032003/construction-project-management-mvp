import React, { memo, useMemo } from 'react';
import { Chip, Box, Avatar, Typography, Tooltip } from '@mui/material';
import { CommonTable, ColumnDef } from '../common/CommonTable';
import { ProgressBar } from '../common/ProgressBar';
import { StatusChip } from '../common/StatusChip';
import { formatDate } from '../../utils/dateUtils';
import { getMediaUrl } from '../../utils/fileUtils';

interface TaskDetailReportItem {
  taskId: string;
  projectCode: string;
  taskName: string;
  assigneeNames?: string;
  assignees?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  }[];
  startDate: string;
  plannedEndDate: string;
  progress: number;
  status: any;
  isOverdue?: boolean;
}

interface TaskDetailReportProps {
  data: TaskDetailReportItem[];
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  onSelectTask?: (taskId: string) => void;
}

export const TaskDetailReport: React.FC<TaskDetailReportProps> = memo(
  ({ data, page, rowsPerPage, loading = false, onSelectTask }) => {
    const paginatedData = useMemo(() => {
      return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [data, page, rowsPerPage]);

    const columns: ColumnDef<TaskDetailReportItem>[] = useMemo(
      () => [
        {
          id: 'projectCode',
          header: 'Dự Án',
          accessorKey: 'projectCode',
          minWidth: 100,
          cell: ({ value }) => (
            <Chip
              label={value}
              size="small"
              sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}
            />
          ),
        },
        {
          id: 'taskName',
          header: 'Tên Công Việc',
          accessorKey: 'taskName',
          minWidth: 200,
          cellSx: { fontWeight: 700, color: '#0f172a' },
        },
        {
          id: 'assigneeNames',
          header: 'Người Phụ Trách',
          minWidth: 180,
          cell: ({ row }) => {
            const assignees =
              row.assignees && row.assignees.length > 0
                ? row.assignees
                : row.assigneeNames && row.assigneeNames.trim()
                ? row.assigneeNames.split(',').map((name) => ({ id: name.trim(), fullName: name.trim(), avatarUrl: undefined }))
                : [];

            if (assignees.length === 0) {
              return (
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Chưa gán
                </Typography>
              );
            }

            return (
              <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, alignItems: 'center' }}>
                {assignees.slice(0, 2).map((a: any) => (
                  <Chip
                    key={a.id || a.fullName}
                    avatar={
                      <Avatar
                        src={getMediaUrl(a.avatarUrl)}
                        sx={{ width: 20, height: 20, fontSize: '0.65rem', bgcolor: '#e0f2fe', color: '#0369a1' }}
                      >
                        {a.fullName.charAt(0)}
                      </Avatar>
                    }
                    label={a.fullName}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.72rem',
                      whiteSpace: 'nowrap',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                ))}
                {assignees.length > 2 && (
                  <Tooltip title={assignees.slice(2).map((a: any) => a.fullName).join(', ')}>
                    <Chip
                      label={`+${assignees.length - 2}`}
                      size="small"
                      sx={{ height: 24, fontSize: '0.72rem', bgcolor: '#f1f5f9' }}
                    />
                  </Tooltip>
                )}
              </Box>
            );
          },
        },
        {
          id: 'dateRange',
          header: 'Thời Gian',
          minWidth: 150,
          cell: ({ row }) => {
            return `${formatDate(row.startDate, 'dd/MM')} - ${formatDate(
              row.plannedEndDate,
              'dd/MM/yyyy'
            )}`;
          },
        },
        {
          id: 'progress',
          header: 'Tiến Độ',
          accessorKey: 'progress',
          minWidth: 120,
          cell: ({ value }) => <ProgressBar value={value} height={7} />,
        },
        {
          id: 'status',
          header: 'Trạng Thái',
          minWidth: 120,
          cell: ({ row }) => <StatusChip status={row.status} isOverdue={row.isOverdue} />,
        },
      ],
      []
    );

    return (
      <CommonTable<TaskDetailReportItem>
        data={paginatedData}
        columns={columns}
        loading={loading}
        showSTT
        sttConfig={{
          page,
          rowsPerPage,
        }}
        rowKey="taskId"
        onRowClick={(row) => onSelectTask?.(row.taskId)}
        rowSx={() => ({
          cursor: onSelectTask ? 'pointer' : 'default',
          transition: 'background-color 0.15s ease',
          '&:hover': {
            bgcolor: '#f8fafc',
          },
        })}
        emptyMessage="Không có dữ liệu công việc phù hợp"
      />
    );
  }
);
