import React, { memo, useMemo } from 'react';
import { Chip, Box, Tooltip, Avatar, Typography } from '@mui/material';
import { CommonTable, ColumnDef } from '../common/CommonTable';
import { ProgressBar } from '../common/ProgressBar';
import { StatusChip } from '../common/StatusChip';
import { formatDate } from '../../utils/dateUtils';
import { getMediaUrl } from '../../utils/fileUtils';

interface ProjectProgressReportItem {
  projectId: string;
  code: string;
  name: string;
  managerName?: string;
  managerNames?: string[];
  managers?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  }[];
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
  onViewTasks?: (projectId: string, filterType: 'all' | 'completed' | 'overdue') => void;
}

export const ProjectProgressReport: React.FC<ProjectProgressReportProps> = memo(
  ({ data, page, rowsPerPage, loading = false, onViewTasks }) => {
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
          accessorKey: 'name',
          minWidth: 200,
          sortable: true,
          cellSx: { fontWeight: 700, color: '#0f172a' },
        },
        {
          id: 'managerName',
          header: 'Quản Lý (PM)',
          accessorKey: 'managerName',
          minWidth: 180,
          cell: ({ value, row }) => {
            const managers =
              row.managers && row.managers.length > 0
                ? row.managers
                : row.managerNames && row.managerNames.length > 0
                ? row.managerNames.map((name) => ({ id: name, fullName: name, avatarUrl: undefined }))
                : value && value !== '-'
                ? [{ id: value, fullName: value, avatarUrl: undefined }]
                : [];

            if (managers.length === 0) {
              return (
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Chưa gán
                </Typography>
              );
            }

            return (
              <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, alignItems: 'center' }}>
                {managers.slice(0, 2).map((m: any) => (
                  <Chip
                    key={m.id || m.fullName}
                    avatar={
                      <Avatar
                        src={getMediaUrl(m.avatarUrl)}
                        sx={{ width: 20, height: 20, fontSize: '0.65rem', bgcolor: '#e0f2fe', color: '#0369a1' }}
                      >
                        {m.fullName.charAt(0)}
                      </Avatar>
                    }
                    label={m.fullName}
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
                {managers.length > 2 && (
                  <Tooltip title={managers.slice(2).map((m: any) => m.fullName).join(', ')}>
                    <Chip
                      label={`+${managers.length - 2}`}
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
          id: 'startDate',
          header: 'Ngày Khởi Công',
          accessorKey: 'startDate',
          minWidth: 120,
          cell: ({ value }) => formatDate(value),
        },
        {
          id: 'plannedEndDate',
          header: 'Hạn Dự Kiến',
          accessorKey: 'plannedEndDate',
          minWidth: 120,
          cell: ({ value }) => formatDate(value),
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
        {
          id: 'taskStats',
          header: 'Tổng Task / Xong / Trễ',
          align: 'right',
          minWidth: 210,
          cell: ({ row }) => (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, justifyContent: 'flex-end', width: '100%' }}>
              <Tooltip title={row.totalTasks > 0 ? `Bấm để xem tất cả (${row.totalTasks}) công việc của dự án này` : 'Không có công việc'} arrow>
                <Chip
                  label={`${row.totalTasks} Tổng`}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (row.totalTasks > 0 && onViewTasks) {
                      onViewTasks(row.projectId, 'all');
                    }
                  }}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: row.totalTasks > 0 ? 'pointer' : 'default',
                    bgcolor: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    '&:hover': row.totalTasks > 0 ? { bgcolor: '#e2e8f0', borderColor: '#94a3b8' } : undefined,
                    transition: 'all 0.15s ease-in-out',
                  }}
                />
              </Tooltip>
              <Tooltip title={row.completedTasks > 0 ? `Bấm để xem (${row.completedTasks}) công việc đã hoàn thành` : 'Chưa có công việc hoàn thành'} arrow>
                <Chip
                  label={`${row.completedTasks} Xong`}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (row.completedTasks > 0 && onViewTasks) {
                      onViewTasks(row.projectId, 'completed');
                    }
                  }}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: row.completedTasks > 0 ? 'pointer' : 'default',
                    bgcolor: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    '&:hover': row.completedTasks > 0 ? { bgcolor: '#d1fae5', borderColor: '#6ee7b7' } : undefined,
                    transition: 'all 0.15s ease-in-out',
                  }}
                />
              </Tooltip>
              <Tooltip title={row.overdueTasks > 0 ? `Bấm để xem (${row.overdueTasks}) công việc bị trễ hạn` : 'Không có công việc trễ hạn'} arrow>
                <Chip
                  label={`${row.overdueTasks} Trễ`}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (row.overdueTasks > 0 && onViewTasks) {
                      onViewTasks(row.projectId, 'overdue');
                    }
                  }}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: row.overdueTasks > 0 ? 'pointer' : 'default',
                    bgcolor: row.overdueTasks > 0 ? '#fef2f2' : '#f8fafc',
                    color: row.overdueTasks > 0 ? '#dc2626' : '#94a3b8',
                    border: row.overdueTasks > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0',
                    '&:hover': row.overdueTasks > 0 ? { bgcolor: '#fee2e2', borderColor: '#f87171' } : undefined,
                    transition: 'all 0.15s ease-in-out',
                  }}
                />
              </Tooltip>
            </Box>
          ),
        },
      ],
      [onViewTasks]
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

