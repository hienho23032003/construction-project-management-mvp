import React, { memo } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Project } from '../../types';
import { StatusChip } from '../common/StatusChip';
import { ProgressBar } from '../common/PriorityBadge';

interface ProjectTableProps {
  projects: Project[];
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
  return (
    <TableContainer
      sx={{
        overflow: 'auto',
        maxHeight: 'calc(100vh - 270px)',
      }}
    >
      <Table stickyHeader sx={{ minWidth: { xs: 720, md: '100%' } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '50px', textAlign: 'center', whiteSpace: 'nowrap', py: 1.5 }}>
              STT
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>
              <TableSortLabel
                active={sortBy === 'code'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('code')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Mã Dự Án
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              <TableSortLabel
                active={sortBy === 'name'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('name')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Tên Công Trình
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>Địa Điểm</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>Người Quản Lý (PM)</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              <TableSortLabel
                active={sortBy === 'plannedEndDate'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('plannedEndDate')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Hạn Hoàn Thành
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              <TableSortLabel
                active={sortBy === 'progress'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('progress')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Tiến Độ
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              <TableSortLabel
                active={sortBy === 'status'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('status')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Trạng Thái
              </TableSortLabel>
            </TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((p, idx) => (
            <TableRow
              key={p.id}
              hover
              onClick={() => onRowClick(p.id)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600, color: '#64748b' }}>
                {idx + 1}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <Chip
                  label={p.code}
                  size="small"
                  sx={{ bgcolor: '#0284c7', color: '#ffffff', fontWeight: 800 }}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', maxWidth: { xs: 180, sm: 280 } }}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontWeight: 700,
                    color: '#0f172a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                  title={p.name}
                >
                  {p.name}
                </Typography>
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 140 }}>
                <Typography variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.location || '-'}
                </Typography>
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 150 }}>
                <Typography variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.managerName || 'Chưa gán'}
                </Typography>
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: p.isOverdue ? '#ef4444' : '#334155', whiteSpace: 'nowrap' }}>
                  {format(new Date(p.plannedEndDate), 'dd/MM/yyyy')}
                </Typography>
              </TableCell>
              <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}>
                <ProgressBar value={p.progress} height={7} />
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <StatusChip status={p.status} isOverdue={p.isOverdue} />
              </TableCell>
              <TableCell align="right" onClick={(e) => e.stopPropagation()} sx={{ whiteSpace: 'nowrap' }}>
                {canEdit && onEditClick && (
                  <IconButton size="small" onClick={(e) => onEditClick(p, e)}>
                    <Edit size={16} color="#64748b" />
                  </IconButton>
                )}
                {isAdmin && onDeleteClick && (
                  <IconButton size="small" onClick={(e) => onDeleteClick(p.id, e)}>
                    <Trash2 size={16} color="#ef4444" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
