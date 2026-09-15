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
  isAdmin = false,
}) => {
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
        header: 'Tên Công Trình',
        accessorKey: 'name',
        sortable: true,
        width: '20%',
        minWidth: 180,
        ellipsis: true,
        cellSx: { fontWeight: 700, color: '#0f172a' },
      },
      {
        id: 'location',
        header: 'Địa Điểm',
        accessorKey: 'location',
        width: '18%',
        minWidth: 140,
        ellipsis: true,
        cell: ({ value }) => value || '-',
      },
      {
        id: 'managerName',
        header: 'Người Quản Lý (PM)',
        accessorKey: 'managerName',
        width: '15%',
        minWidth: 100,
        ellipsis: true,
        cell: ({ value }) => value || 'Chưa gán',
      },
      {
        id: 'plannedEndDate',
        header: 'Hạn Hoàn Thành',
        accessorKey: 'plannedEndDate',
        sortable: true,
        width: 130,
        minWidth: 120,
        cell: ({ row }) => (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: row.isOverdue ? '#ef4444' : '#334155',
              whiteSpace: 'nowrap',
            }}
          >
            {formatDate(row.plannedEndDate)}
          </Typography>
        ),
      },
      {
        id: 'progress',
        header: 'Tiến Độ',
        accessorKey: 'progress',
        sortable: true,
        width: 130,
        minWidth: 120,
        cell: ({ value }) => <ProgressBar value={value} height={7} />,
      },
      {
        id: 'status',
        header: 'Trạng Thái',
        accessorKey: 'status',
        sortable: true,
        width: 130,
        minWidth: 120,
        cell: ({ row }) => <StatusChip status={row.status} isOverdue={row.isOverdue} />,
      },
      {
        id: 'actions',
        header: 'Thao Tác',
        align: 'right',
        width: 100,
        minWidth: 100,
        cell: ({ row }) => (
          <span onClick={(e) => e.stopPropagation()}>
            {canEdit && onEditClick && (
              <IconButton size="small" onClick={(e) => onEditClick(row, e)}>
                <Edit size={16} color="#64748b" />
              </IconButton>
            )}
            {isAdmin && onDeleteClick && (
              <IconButton size="small" onClick={(e) => onDeleteClick(row.id, e)}>
                <Trash2 size={16} color="#ef4444" />
              </IconButton>
            )}
          </span>
        ),
      },
    ],
    [canEdit, isAdmin, onDeleteClick, onEditClick]
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
