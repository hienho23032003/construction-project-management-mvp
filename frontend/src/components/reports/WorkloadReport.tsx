import React, { memo, useMemo } from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import { CommonTable, ColumnDef } from '../common/CommonTable';
import { ProgressBar } from '../common/ProgressBar';
import { getMediaUrl } from '../../utils/fileUtils';

interface WorkloadReportItem {
  userId: string;
  fullName: string;
  avatarUrl?: string;
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
  onSelectUser?: (userId: string) => void;
}

export const WorkloadReport: React.FC<WorkloadReportProps> = memo(
  ({ data, page, rowsPerPage, loading = false, onSelectUser }) => {
    const paginatedData = useMemo(() => {
      return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [data, page, rowsPerPage]);

    const columns: ColumnDef<WorkloadReportItem>[] = useMemo(
      () => [
        {
          id: 'fullName',
          header: 'Họ Và Tên',
          accessorKey: 'fullName',
          minWidth: 190,
          cell: ({ row }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={getMediaUrl(row.avatarUrl)}
                sx={{ width: 26, height: 26, fontSize: '0.72rem', bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}
              >
                {row.fullName.charAt(0)}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {row.fullName}
              </Typography>
            </Box>
          ),
        },
        {
          id: 'department',
          header: 'Phòng Ban',
          accessorFn: (row) => row.department || '-',
          minWidth: 140,
        },
        {
          id: 'email',
          header: 'Email',
          accessorKey: 'email',
          minWidth: 170,
        },
        {
          id: 'totalTasks',
          header: 'Tổng Task',
          accessorKey: 'totalTasks',
          align: 'center',
          minWidth: 80,
          cellSx: { fontWeight: 700 },
        },
        {
          id: 'activeTasks',
          header: 'Đang Làm',
          accessorKey: 'activeTasks',
          align: 'center',
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
          minWidth: 80,
          cell: ({ value }) => (
            <span style={{ color: '#ef4444', fontWeight: 700 }}>{value}</span>
          ),
        },
        {
          id: 'averageProgress',
          header: 'Tiến Độ TB',
          accessorKey: 'averageProgress',
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
        onRowClick={(row) => onSelectUser?.(row.userId)}
        rowSx={() => ({
          cursor: onSelectUser ? 'pointer' : 'default',
          transition: 'background-color 0.15s ease',
          '&:hover': {
            bgcolor: '#f8fafc',
          },
        })}
        emptyMessage="Không có dữ liệu nhân sự phù hợp"
      />
    );
  }
);
