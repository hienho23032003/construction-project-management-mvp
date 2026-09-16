import React, { memo, useMemo } from 'react';
import {
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import { Edit, Trash2 } from 'lucide-react';
import { Project } from '../../types';
import { StatusChip } from '../common/StatusChip';
import { ProgressBar } from '../common/ProgressBar';
import { CommonTable, ColumnDef } from '../common/CommonTable';
import { formatDate } from '../../utils/dateUtils';

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
        minWidth: 150,
        cell: ({ value }) => (
          <Typography variant="body2" sx={{ color: '#334155' }}>
            {value || '—'}
          </Typography>
        ),
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
      {
        id: 'actions',
        header: 'Thao Tác',
        width: 90,
        minWidth: 90,
        align: 'right',
        cell: ({ row }) => (
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
