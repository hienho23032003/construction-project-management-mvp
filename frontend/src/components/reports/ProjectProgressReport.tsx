import React, { memo, useMemo } from 'react';
import { Chip } from '@mui/material';
import { CommonTable, ColumnDef } from '../common/CommonTable';
import { ProgressBar } from '../common/ProgressBar';
import { StatusChip } from '../common/StatusChip';
import { formatDate } from '../../utils/dateUtils';

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
          header: 'Mã Dự Án',
          accessorKey: 'code',
          width: '10%',
          minWidth: 100,
          sortable: true,
          cell: ({ value }) => (
            <Chip
              label={value}
              size="small"
              sx={{ fontWeight: 700, bgcolor: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem' }}
            />
          ),
        },
        {
          id: 'name',
          header: 'Tên Công Trình',
          width: '20%',
          accessorKey: 'name',
          minWidth: 200,
          sortable: true,
          ellipsis: true,
        },
        {
          id: 'managerName',
          header: 'Chỉ Huy Trưởng',
          accessorKey: 'managerName',
          width: '12%',
          minWidth: 130,
          ellipsis: true,
        },
        {
          id: 'startDate',
          header: 'Ngày Khởi Công',
          accessorKey: 'startDate',
          width: '10%',
          minWidth: 110,
          cell: ({ value }) => formatDate(value),
        },
        {
          id: 'plannedEndDate',
          header: 'Hạn Dự Kiến',
          accessorKey: 'plannedEndDate',
          width: '10%',
          minWidth: 110,
          cell: ({ value }) => formatDate(value),
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
          width: '10%',
          minWidth: 120,
          cell: ({ row }) => <StatusChip status={row.status} isOverdue={row.isOverdue} />,
        },
        {
          id: 'taskStats',
          header: 'Tổng Task / Xong / Trễ',
          align: 'right',
          width: '12%',
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
