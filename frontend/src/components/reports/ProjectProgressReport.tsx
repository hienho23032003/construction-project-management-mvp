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
          width: 90,
          minWidth: 80,
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
          width: 260,
          minWidth: 180,
          maxWidth: 320,
          sortable: true,
          ellipsis: true,
          cellSx: { fontWeight: 700, color: 'text.primary' },
        },
        {
          id: 'managerName',
          header: 'Quản Lý (PM)',
          accessorKey: 'managerName',
          width: 240,
          minWidth: 200,
          maxWidth: 280,
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

            const isSingle = managers.length === 1;
            const hasMore = managers.length > 2;
            const maxChipWidth = isSingle ? 180 : (hasMore ? 95 : 120);

            return (
              <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, alignItems: 'center', minWidth: 0, width: '100%', overflow: 'hidden' }}>
                {managers.slice(0, 2).map((m: any) => (
                  <Chip
                    key={m.id || m.fullName}
                    avatar={
                      <Avatar
                        src={getMediaUrl(m.avatarUrl)}
                        sx={{ width: 20, height: 20, fontSize: '0.65rem', bgcolor: '#0284c7', color: '#ffffff', fontWeight: 700 }}
                      >
                        {m.fullName.charAt(0)}
                      </Avatar>
                    }
                    label={m.fullName}
                    size="small"
                    title={m.fullName}
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
                {managers.length > 2 && (
                  <Tooltip title={managers.slice(2).map((m: any) => m.fullName).join(', ')}>
                    <Chip
                      label={`+${managers.length - 2}`}
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
          id: 'startDate',
          header: 'Ngày Khởi Công',
          accessorKey: 'startDate',
          width: 120,
          minWidth: 110,
          cell: ({ value }) => formatDate(value),
        },
        {
          id: 'plannedEndDate',
          header: 'Hạn Dự Kiến',
          accessorKey: 'plannedEndDate',
          width: 120,
          minWidth: 110,
          cell: ({ value }) => formatDate(value),
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
          width: 140,
          minWidth: 130,
          cell: ({ row }) => <StatusChip status={row.status} isOverdue={row.isOverdue} />,
        },
        {
          id: 'taskStats',
          header: 'Tổng Task / Xong / Trễ',
          align: 'right',
          width: 250,
          minWidth: 230,
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
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                    color: 'text.primary',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': row.totalTasks > 0 ? { bgcolor: 'action.hover', borderColor: 'primary.main' } : undefined,
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
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.16)' : '#ecfdf5',
                    color: (theme) => theme.palette.mode === 'dark' ? '#34d399' : '#059669',
                    border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid #a7f3d0',
                    '&:hover': row.completedTasks > 0 ? { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.25)' : '#d1fae5', borderColor: '#6ee7b7' } : undefined,
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
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? (row.overdueTasks > 0 ? 'rgba(239, 68, 68, 0.16)' : 'rgba(255, 255, 255, 0.04)') : (row.overdueTasks > 0 ? '#fef2f2' : '#f8fafc'),
                    color: (theme) => theme.palette.mode === 'dark' ? (row.overdueTasks > 0 ? '#f87171' : '#7b7b7b') : (row.overdueTasks > 0 ? '#dc2626' : '#94a3b8'),
                    border: (theme) => theme.palette.mode === 'dark' ? (row.overdueTasks > 0 ? '1px solid rgba(248, 113, 113, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)') : (row.overdueTasks > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0'),
                    '&:hover': row.overdueTasks > 0 ? { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.25)' : '#fee2e2', borderColor: '#f87171' } : undefined,
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
        minWidth={1350}
        emptyMessage="Không có dữ liệu dự án phù hợp"
      />
    );
  }
);

