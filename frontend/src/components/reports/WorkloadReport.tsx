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
          width: 190,
          minWidth: 160,
          maxWidth: 210,
          cellSx: { fontWeight: 700 },
          cell: ({ row }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <Avatar
                src={getMediaUrl(row.avatarUrl)}
                sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#0284c7', color: '#ffffff', fontWeight: 700, flexShrink: 0 }}
              >
                {row.fullName.charAt(0)}
              </Avatar>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={row.fullName}
              >
                {row.fullName}
              </Typography>
            </Box>
          ),
        },
        {
          id: 'department',
          header: 'Phòng Ban',
          accessorFn: (row) => row.department || 'Chưa phân ban',
          width: 170,
          minWidth: 130,
          maxWidth: 190,
          ellipsis: true,
        },
        {
          id: 'email',
          header: 'Email',
          accessorKey: 'email',
          width: 190,
          minWidth: 150,
          maxWidth: 210,
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
          width: 95,
          minWidth: 85,
          cell: ({ value }) => (
            <span style={{ color: '#10b981', fontWeight: 700 }}>{value}</span>
          ),
        },
        {
          id: 'overdueTasks',
          header: 'Quá Hạn',
          accessorKey: 'overdueTasks',
          align: 'center',
          width: 85,
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
          minWidth: 110,
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
          '&:hover': {
            bgcolor: 'action.hover',
          },
        })}
        emptyMessage="Không có dữ liệu nhân sự phù hợp"
      />
    );
  }
);
