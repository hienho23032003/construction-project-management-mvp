import React, { memo, useMemo } from 'react';
import { Chip } from '@mui/material';
import { format } from 'date-fns';
import { CommonTable, ColumnDef } from '../common/CommonTable';
import { ProgressBar } from '../common/ProgressBar';
import { StatusChip } from '../common/StatusChip';

interface ProjectProgressReportItem {
  projectId: string;
  code: string;
  name: string;
  managerName?: string;
  startDate: string;
  plannedEndDate: string;
  progress: number;
  status: any;
  isOverdue?: boolean;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

interface ProjectProgressReportProps {
  data: ProjectProgressReportItem[];
  page: number;
  rowsPerPage: number;
  loading?: boolean;
}

export const ProjectProgressReport: React.FC<ProjectProgressReportProps> = memo(
  ({ data, page, rowsPerPage, loading = false }) => {
    const paginatedData = useMemo(() => {
      return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [data, page, rowsPerPage]);

    const columns: ColumnDef<ProjectProgressReportItem>[] = useMemo(
      () => [
        {
          id: 'code',
          header: 'Mã',
          accessorKey: 'code',
          width: 90,
          minWidth: 80,
          cell: ({ value }) => (
            <Chip
              label={value}
              size="small"
              sx={{ bgcolor: '#0284c7', color: '#ffffff', fontWeight: 800 }}
            />
          ),
        },
        {
          id: 'name',
          header: 'Tên Công Trình',
          accessorKey: 'name',
          width: '24%',
          minWidth: 160,
          ellipsis: true,
          cellSx: { fontWeight: 700 },
        },
        {
          id: 'managerName',
          header: 'Người Quản Lý (PM)',
          accessorFn: (row) => row.managerName || 'Chưa gán',
          width: '16%',
          minWidth: 130,
          ellipsis: true,
        },
        {
          id: 'startDate',
          header: 'Ngày Khởi Công',
          accessorKey: 'startDate',
          width: 120,
          minWidth: 110,
          cell: ({ value }) => {
            try {
              return format(new Date(value), 'dd/MM/yyyy');
            } catch {
              return value || '-';
            }
          },
        },
        {
          id: 'plannedEndDate',
          header: 'Hạn Dự Kiến',
          accessorKey: 'plannedEndDate',
          width: 120,
          minWidth: 110,
          cell: ({ value }) => {
            try {
              return format(new Date(value), 'dd/MM/yyyy');
            } catch {
              return value || '-';
            }
          },
        },
        {
          id: 'progress',
          header: 'Tiến Độ',
          accessorKey: 'progress',
          width: 130,
          minWidth: 120,
          cell: ({ value }) => <ProgressBar value={value} height={7} />,
        },
        {
          id: 'status',
          header: 'Trạng Thái',
          width: 130,
          minWidth: 120,
          cell: ({ row }) => <StatusChip status={row.status} isOverdue={row.isOverdue} />,
        },
        {
          id: 'taskStats',
          header: 'Tổng Task / Xong / Trễ',
          align: 'right',
          width: 170,
          minWidth: 150,
          cell: ({ row }) => (
            <span>
              {row.totalTasks} /{' '}
              <span style={{ color: '#10b981', fontWeight: 700 }}>{row.completedTasks}</span> /{' '}
              <span style={{ color: '#ef4444', fontWeight: 700 }}>{row.overdueTasks}</span>
            </span>
          ),
        },
      ],
      []
    );

    return (
      <CommonTable<ProjectProgressReportItem>
        data={paginatedData}
        columns={columns}
        loading={loading}
        showSTT
        sttConfig={{
          page,
          rowsPerPage,
        }}
        rowKey="projectId"
        emptyMessage="Không có dữ liệu dự án phù hợp"
      />
    );
  }
);
