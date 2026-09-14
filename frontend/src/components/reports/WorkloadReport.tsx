import React, { memo, useMemo } from 'react';
import { CommonTable, ColumnDef } from '../common/CommonTable';
import { ProgressBar } from '../common/ProgressBar';

interface WorkloadReportItem {
  userId: string;
  fullName: string;
  department?: string;
  email: string;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageProgress: number;
}

interface WorkloadReportProps {
  data: WorkloadReportItem[];
  page: number;
  rowsPerPage: number;
  loading?: boolean;
}

export const WorkloadReport: React.FC<WorkloadReportProps> = memo(
  ({ data, page, rowsPerPage, loading = false }) => {
    const paginatedData = useMemo(() => {
      return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [data, page, rowsPerPage]);

    const columns: ColumnDef<WorkloadReportItem>[] = useMemo(
      () => [
        {
          id: 'fullName',
          header: 'Họ Và Tên',
          accessorKey: 'fullName',
          width: '24%',
          minWidth: 160,
          ellipsis: true,
          cellSx: { fontWeight: 700 },
        },
        {
          id: 'department',
          header: 'Phòng Ban',
          accessorFn: (row) => row.department || '-',
          width: '18%',
          minWidth: 130,
          ellipsis: true,
        },
        {
          id: 'email',
          header: 'Email',
          accessorKey: 'email',
          width: '22%',
          minWidth: 150,
          ellipsis: true,
        },
        {
          id: 'totalTasks',
          header: 'Tổng Task',
          accessorKey: 'totalTasks',
          align: 'center',
          width: 90,
          minWidth: 80,
          cellSx: { fontWeight: 700 },
        },
        {
          id: 'activeTasks',
          header: 'Đang Làm',
          accessorKey: 'activeTasks',
          align: 'center',
          width: 90,
          minWidth: 80,
          cell: ({ value }) => (
            <span style={{ color: '#0284c7', fontWeight: 700 }}>{value}</span>
          ),
        },
        {
          id: 'completedTasks',
          header: 'Hoàn Thành',
          accessorKey: 'completedTasks',
          align: 'center',
          width: 100,
          minWidth: 90,
          cell: ({ value }) => (
            <span style={{ color: '#10b981', fontWeight: 700 }}>{value}</span>
          ),
        },
        {
          id: 'overdueTasks',
          header: 'Quá Hạn',
          accessorKey: 'overdueTasks',
          align: 'center',
          width: 90,
          minWidth: 80,
          cell: ({ value }) => (
            <span style={{ color: '#ef4444', fontWeight: 700 }}>{value}</span>
          ),
        },
        {
          id: 'averageProgress',
          header: 'Tiến Độ TB',
          accessorKey: 'averageProgress',
          width: 130,
          minWidth: 120,
          cell: ({ value }) => <ProgressBar value={value} height={7} />,
        },
      ],
      []
    );

    return (
      <CommonTable<WorkloadReportItem>
        data={paginatedData}
        columns={columns}
        loading={loading}
        showSTT
        sttConfig={{
          page,
          rowsPerPage,
        }}
        rowKey="userId"
        emptyMessage="Không có dữ liệu nhân sự phù hợp"
      />
    );
  }
);
