import React, { memo, useMemo } from 'react';
import {
  Chip,
  IconButton,
  Typography,
  Avatar,
  Box,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Edit, Trash2 } from 'lucide-react';
import { Project } from '../../types';
import { StatusChip } from '../common/StatusChip';
import { ProgressBar } from '../common/ProgressBar';
import { CommonTable, ColumnDef } from '../common/CommonTable';
import { formatDate } from '../../utils/dateUtils';
import { getMediaUrl } from '../../utils/fileUtils';

interface ProjectTableProps {
  projects: Project[];
  loading?: boolean;
  page?: number;
  rowsPerPage?: number;
  sortBy: string;
  isDescending: boolean;
  onSort: (field: string) => void;
  onRowClick: (id: string) => void;
  onEditClick?: (p: Project, e: React.MouseEvent) => void;
  onDeleteClick?: (id: string, e: React.MouseEvent) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  isAdmin?: boolean;
}

export const ProjectTable: React.FC<ProjectTableProps> = memo(({
  projects,
  loading = false,
  page = 0,
  rowsPerPage = 12,
  sortBy,
  isDescending,
  onSort,
  onRowClick,
  onEditClick,
  onDeleteClick,
  canEdit = false,
  canDelete = false,
  isAdmin = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const showDelete = canDelete || isAdmin;

  const columns: ColumnDef<Project>[] = useMemo(
    () => [
      {
        id: 'code',
        header: 'Mã Dự Án',
        accessorKey: 'code',
        sortable: true,
        width: 100,
        minWidth: 100,
        cell: ({ value }) => (
          <Chip
            label={value}
            size="small"
            sx={{
              bgcolor: isDark ? '#0284c7' : '#0284c7',
              color: '#ffffff',
              fontWeight: 800,
            }}
          />
        ),
      },
      {
        id: 'name',
        header: 'Tên Công Trình / Dự Án',
        accessorKey: 'name',
        sortable: true,
        width: 280,
        minWidth: 180,
        maxWidth: 280,
        cell: ({ value, row }) => (
          <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
            <Tooltip title={value} arrow placement="top-start">
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {value}
              </Typography>
            </Tooltip>
            {row.location && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
                title={row.location}
              >
                {row.location}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        id: 'status',
        header: 'Trạng Thái',
        accessorKey: 'status',
        sortable: true,
        width: 120,
        minWidth: 100,
        cell: ({ value, row }) => (
          <StatusChip status={value} isOverdue={row.isOverdue} />
        ),
      },
      {
        id: 'managerName',
        header: 'Quản Lý (PM)',
        accessorKey: 'managerName',
        sortable: true,
        width: 200,
        minWidth: 200,
        maxWidth: 230,
        cell: ({ value, row }) => {
          const managers =
            row.managers && row.managers.length > 0
              ? row.managers
              : row.managerNames && row.managerNames.length > 0
              ? row.managerNames.map((name) => ({ id: name, fullName: name, avatarUrl: undefined }))
              : value
              ? [{ id: value, fullName: value, avatarUrl: undefined }]
              : [];

          if (managers.length === 0) {
            return (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                Chưa gán
              </Typography>
            );
          }

          const isSingle = managers.length === 1;
          const hasMore = managers.length > 2;
          const maxChipWidth = isSingle ? 175 : (hasMore ? 130 : 140);

          return (
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, alignItems: 'center', minWidth: 0, width: '100%', overflow: 'hidden' }}>
              {managers.slice(0, 2).map((m: any) => (
                <Chip
                  key={m.id || m.fullName}
                  avatar={
                    <Avatar
                      src={getMediaUrl(m.avatarUrl)}
                      sx={{
                        width: 20,
                        height: 20,
                        fontSize: '0.65rem',
                        bgcolor: '#0284c7',
                        color: '#ffffff',
                        fontWeight: 700,
                      }}
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
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f8fafc',
                    color: 'text.primary',
                    border: `1px solid ${theme.palette.divider}`,
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
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                      color: 'text.secondary',
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
        header: 'Ngày Bắt Đầu',
        accessorKey: 'startDate',
        sortable: true,
        width: 100,
        minWidth: 100,
        cell: ({ value }) => (
          <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
            {formatDate(value)}
          </Typography>
        ),
      },
      {
        id: 'plannedEndDate',
        header: 'Hạn Dự Kiến',
        accessorKey: 'plannedEndDate',
        sortable: true,
        width: 100,
        minWidth: 100,
        cell: ({ value, row }) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8125rem',
              color: row.isOverdue ? (isDark ? '#f87171' : '#ef4444') : 'text.secondary',
              fontWeight: row.isOverdue ? 700 : 500,
            }}
          >
            {formatDate(value)}
          </Typography>
        ),
      },
      {
        id: 'progress',
        header: 'Tiến Độ',
        accessorKey: 'progress',
        sortable: true,
        width: 130,
        minWidth: 130,
        cell: ({ value }) => <ProgressBar value={value} />,
      },
      {
        id: 'actions',
        header: 'Thao Tác',
        align: 'center',
        width: 100,
        minWidth: 100,
        cell: ({ row }) => (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            {canEdit && onEditClick && (
              <Tooltip title="Chỉnh sửa dự án">
                <IconButton
                  size="small"
                  onClick={(e) => onEditClick(row, e)}
                  sx={{
                    color: isDark ? '#94a3b8' : '#64748b',
                    '&:hover': {
                      color: isDark ? '#38bdf8' : '#0284c7',
                      bgcolor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#f0f9ff',
                    },
                  }}
                >
                  <Edit size={16} />
                </IconButton>
              </Tooltip>
            )}
            {showDelete && onDeleteClick && (
              <Tooltip title="Xóa dự án">
                <IconButton
                  size="small"
                  onClick={(e) => onDeleteClick(row.id, e)}
                  sx={{
                    color: isDark ? '#f87171' : '#ef4444',
                    '&:hover': {
                      color: '#dc2626',
                      bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                    },
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [canEdit, showDelete, onEditClick, onDeleteClick, isDark, theme.palette.divider]
  );

  return (
    <CommonTable
      columns={columns}
      data={projects}
      loading={loading}
      showSTT
      sttConfig={{
        page,
        rowsPerPage,
        width: 60,
      }}
      sortBy={sortBy}
      isDescending={isDescending}
      onSort={onSort}
      onRowClick={(row) => onRowClick(row.id)}
      rowKey="id"
      density="compact"
      emptyMessage="Chưa có dự án nào."
      containerSx={{
        bgcolor: 'background.paper',
      }}
    />
  );
});
