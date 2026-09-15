import React, { memo, useMemo } from 'react';
import { Chip } from '@mui/material';
import { CommonTable, ColumnDef } from '../common/CommonTable';
import { ProgressBar } from '../common/ProgressBar';
import { StatusChip } from '../common/StatusChip';
import { formatDate } from '../../utils/dateUtils';

interface TaskDetailReportItem {
  taskId: string;
  projectCode: string;
  taskName: string;
  assigneeNames?: string;
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
}

export const TaskDetailReport: React.FC<TaskDetailReportProps> = memo(
  ({ data, page, rowsPerPage, loading = false }) => {
    const paginatedData = useMemo(() => {
      return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [data, page, rowsPerPage]);

    const columns: ColumnDef<TaskDetailReportItem>[] = useMemo(
      () => [
        {
          id: 'projectCode',
          header: 'Dự Án',
          accessorKey: 'projectCode',
          width: '10%',
          minWidth: 90,
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
          width: '25%',
          minWidth: 180,
          ellipsis: true,
          cellSx: { fontWeight: 600 },
        },
        {
          id: 'assigneeNames',
          header: 'Người Phụ Trách',
          accessorFn: (row) => row.assigneeNames || 'Chưa gán',
          width: '15%',
          minWidth: 140,
          ellipsis: true,
        },
        {
          id: 'dateRange',
          header: 'Thời Gian',
          width: '15%',
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
          width: '15%',
          minWidth: 120,
          cell: ({ value }) => <ProgressBar value={value} height={7} />,
        },
        {
          id: 'status',
          header: 'Trạng Thái',
          width: '15%',
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
        emptyMessage="Không có dữ liệu công việc phù hợp"
      />
    );
  }
);
