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
          width: 80,
          minWidth: 70,
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
          width: 280,
          minWidth: 180,
          maxWidth: 320,
          ellipsis: true,
          cellSx: { fontWeight: 700, color: 'text.primary' },
        },
        {
          id: 'assigneeNames',
          header: 'Người Phụ Trách',
          width: 220,
          minWidth: 170,
          maxWidth: 240,
          cell: ({ row }) => {
            const assignees =
              row.assignees && row.assignees.length > 0
                ? row.assignees
                : row.assigneeNames && row.assigneeNames.trim()
                ? row.assigneeNames.split(',').map((name) => ({ id: name.trim(), fullName: name.trim(), avatarUrl: undefined }))
                : [];

            if (assignees.length === 0) {
              return (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  Chưa gán
                </Typography>
              );
            }

            const isSingle = assignees.length === 1;
            const hasMore = assignees.length > 2;
            const maxChipWidth = isSingle ? 175 : (hasMore ? 95 : 110);

            return (
              <Box sx={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap', minWidth: 0, width: '100%', overflow: 'hidden' }}>
                {assignees.slice(0, 2).map((a: any) => (
                  <Chip
                    key={a.id || a.fullName}
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
                    title={a.fullName}
                    sx={{
                      height: 24,
                      fontSize: '0.72rem',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                      maxWidth: maxChipWidth,
                      '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        px: 0.75,
                      },
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#141414' : '#f8fafc',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                ))}
                {assignees.length > 2 && (
                  <Tooltip title={assignees.slice(2).map((a: any) => a.fullName).join(', ')}>
                    <Chip
                      label={`+${assignees.length - 2}`}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.72rem',
                        bgcolor: 'action.hover',
                        flexShrink: 0,
                        minWidth: 'fit-content',
                        '& .MuiChip-label': { px: 0.75 },
                      }}
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
          width: 160,
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
          width: 130,
          minWidth: 110,
          cell: ({ value }) => <ProgressBar value={value} height={7} />,
        },
        {
          id: 'status',
          header: 'Trạng Thái',
          accessorKey: 'status',
          width: 130,
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
        minWidth={1070}
        onRowClick={(row) => onSelectTask?.(row.taskId)}
        rowSx={() => ({
          cursor: onSelectTask ? 'pointer' : 'default',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        })}
        emptyMessage="Không có dữ liệu công việc phù hợp"
      />
    );
  }
);
