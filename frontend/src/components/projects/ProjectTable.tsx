import React, { memo, useMemo } from 'react';
import {
  Chip,
  IconButton,
  Typography,
  Avatar,
  Box,
  Tooltip,
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
            sx={{ bgcolor: '#0284c7', color: '#ffffff', fontWeight: 800 }}
          />
        ),
      },
      {
        id: 'name',
        header: 'Tên Công Trình / Dự Án',
        accessorKey: 'name',
        sortable: true,
        minWidth: 220,
        cell: ({ value, row }) => (
          <div>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
              {value}
            </Typography>
            {row.location && (
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {row.location}
              </Typography>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Trạng Thái',
        accessorKey: 'status',
        sortable: true,
        width: 130,
        minWidth: 130,
        cell: ({ value, row }) => (
          <StatusChip status={value} isOverdue={row.isOverdue} />
        ),
      },
      {
        id: 'managerName',
        header: 'Quản Lý (PM)',
        accessorKey: 'managerName',
        sortable: true,
        minWidth: 180,
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
        header: 'Ngày Bắt Đầu',
        accessorKey: 'startDate',
        sortable: true,
        width: 110,
        minWidth: 110,
        cell: ({ value }) => (
          <Typography variant="body2" sx={{ color: '#475569' }}>
            {formatDate(value)}
          </Typography>
        ),
      },
      {
        id: 'plannedEndDate',
        header: 'Hạn Dự Kiến',
        accessorKey: 'plannedEndDate',
        sortable: true,
        width: 110,
        minWidth: 110,
        cell: ({ value }) => (
          <Typography variant="body2" sx={{ color: '#475569' }}>
            {formatDate(value)}
          </Typography>
        ),
      },
      {
        id: 'progress',
        header: 'Tiến Độ',
        accessorKey: 'progress',
        sortable: true,
        width: 160,
        minWidth: 140,
        cell: ({ value }) => (
          <ProgressBar value={value} showText={true} height={8} />
        ),
      },
      ...((canEdit && onEditClick) || (showDelete && onDeleteClick)
        ? [
            {
              id: 'actions',
              header: 'Thao Tác',
              width: 90,
              minWidth: 90,
              align: 'right' as const,
              cell: ({ row }: { row: Project }) => (
                <span onClick={(e) => e.stopPropagation()}>
                  {canEdit && onEditClick && (
                    <IconButton size="small" onClick={(e) => onEditClick(row, e)}>
                      <Edit size={16} color="#64748b" />
                    </IconButton>
                  )}
                  {showDelete && onDeleteClick && (
                    <IconButton size="small" onClick={(e) => onDeleteClick(row.id, e)}>
                      <Trash2 size={16} color="#ef4444" />
                    </IconButton>
                  )}
                </span>
              ),
            },
          ]
        : []),
    ],
    [canEdit, showDelete, onDeleteClick, onEditClick]
  );

  return (
    <CommonTable<Project>
      data={projects}
      columns={columns}
      loading={loading}
      showSTT
      sttConfig={{
        page,
        rowsPerPage,
      }}
      sortBy={sortBy}
      isDescending={isDescending}
      onSort={onSort}
      rowKey="id"
      onRowClick={(row) => onRowClick(row.id)}
      emptyMessage="Không tìm thấy dự án nào"
    />
  );
});
