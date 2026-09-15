import React, { memo, useMemo } from 'react';
import { Chip } from '@mui/material';
import { CommonTable, ColumnDef } from '../common/CommonTable';
import { ProgressBar } from '../common/ProgressBar';
import { formatDate } from '../../utils/dateUtils';

interface OverdueReportItem {
  taskId: string;
  projectCode: string;
  taskName: string;
  assigneeNames?: string;
  plannedEndDate: string;
  overdueDays: number;
  progress: number;
}

interface OverdueReportProps {
  data: OverdueReportItem[];
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  onSelectTask?: (taskId: string) => void;
}

export const OverdueReport: React.FC<OverdueReportProps> = memo(
  ({ data, page, rowsPerPage, loading = false, onSelectTask }) => {
    const paginatedData = useMemo(() => {
      return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [data, page, rowsPerPage]);

    const columns: ColumnDef<OverdueReportItem>[] = useMemo(
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
              sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 800 }}
            />
          ),
        },
        {
          id: 'taskName',
          header: 'Tên Công Việc',
          accessorKey: 'taskName',
          minWidth: 200,
          headerSx: { fontWeight: 700 },
          cellSx: { fontWeight: 700, color: '#0f172a' },
        },
        {
          id: 'assigneeNames',
          header: 'Người Phụ Trách',
          accessorFn: (row) => row.assigneeNames || 'Chưa gán',
          minWidth: 150,
        },
        {
          id: 'plannedEndDate',
          header: 'Hạn Ban Đầu',
          accessorKey: 'plannedEndDate',
          minWidth: 130,
          cell: ({ value }) => (
            <span style={{ color: '#b91c1c', fontWeight: 600 }}>
              {formatDate(value)}
            </span>
          ),
        },
        {
          id: 'overdueDays',
          header: 'Số Ngày Quá Hạn',
          accessorKey: 'overdueDays',
          minWidth: 140,
          cell: ({ value }) => (
            <Chip
              label={`Trễ ${value} ngày`}
              size="small"
              sx={{ bgcolor: '#ef4444', color: '#ffffff', fontWeight: 700 }}
            />
          ),
        },
        {
          id: 'progress',
          header: 'Tiến Độ Hiện Tại',
          accessorKey: 'progress',
          minWidth: 130,
          cell: ({ value }) => <ProgressBar value={value} height={7} />,
        },
      ],
      []
    );

    return (
      <CommonTable<OverdueReportItem>
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
          bgcolor: '#fff5f5',
          cursor: onSelectTask ? 'pointer' : 'default',
          transition: 'background-color 0.15s ease',
          '&:hover': {
            bgcolor: '#fee2e2 !important',
          },
        })}
        emptyMessage="Tuyệt vời! Không có công việc nào bị quá hạn."
      />
    );
  }
);
