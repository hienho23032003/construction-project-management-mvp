import React, { memo, useMemo } from 'react';
import { Chip } from '@mui/material';
import { format } from 'date-fns';
import { CommonTable, ColumnDef } from '../common/CommonTable';
import { ProgressBar } from '../common/ProgressBar';

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
}

export const OverdueReport: React.FC<OverdueReportProps> = memo(
  ({ data, page, rowsPerPage, loading = false }) => {
    const paginatedData = useMemo(() => {
      return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [data, page, rowsPerPage]);

    const columns: ColumnDef<OverdueReportItem>[] = useMemo(
      () => [
        {
          id: 'projectCode',
          header: 'Dự Án',
          accessorKey: 'projectCode',
          width: 100,
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
          width: '32%',
          minWidth: 180,
          ellipsis: true,
          headerSx: { fontWeight: 700 },
          cellSx: { fontWeight: 700, color: '#0f172a' },
        },
        {
          id: 'assigneeNames',
          header: 'Người Phụ Trách',
          accessorFn: (row) => row.assigneeNames || 'Chưa gán',
          width: '20%',
          minWidth: 140,
          ellipsis: true,
        },
        {
          id: 'plannedEndDate',
          header: 'Hạn Ban Đầu',
          accessorKey: 'plannedEndDate',
          width: 130,
          cell: ({ value }) => {
            try {
              return (
                <span style={{ color: '#b91c1c', fontWeight: 600 }}>
                  {format(new Date(value), 'dd/MM/yyyy')}
                </span>
              );
            } catch {
              return value || '-';
            }
          },
        },
        {
          id: 'overdueDays',
          header: 'Số Ngày Quá Hạn',
          accessorKey: 'overdueDays',
          width: 140,
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
          width: 140,
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
        rowSx={() => ({
          bgcolor: '#fff5f5',
        })}
        emptyMessage="Tuyệt vời! Không có công việc nào bị quá hạn."
      />
    );
  }
);
