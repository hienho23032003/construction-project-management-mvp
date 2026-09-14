import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { ProgressBar } from '../common/ProgressBar';
import { StatusChip } from '../common/StatusChip';

interface ProjectProgressReportProps {
  data: any[];
  page: number;
  rowsPerPage: number;
}

export const ProjectProgressReport: React.FC<ProjectProgressReportProps> = memo(
  ({ data, page, rowsPerPage }) => {
    const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
      <Table stickyHeader sx={{ minWidth: { xs: 750, md: '100%' } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '50px', textAlign: 'center', whiteSpace: 'nowrap', py: 1.5 }}>STT</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Mã</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Tên Công Trình</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Người Quản Lý (PM)</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Ngày Khởi Công</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Hạn Dự Kiến</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Tiến Độ</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Trạng Thái</TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Tổng Task / Xong / Trễ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#64748b', whiteSpace: 'nowrap' }}>
                Không có dữ liệu dự án phù hợp
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((p, idx) => (
              <TableRow key={p.projectId} hover>
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
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', maxWidth: { xs: 180, sm: 260 } }}>
                  <span
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={p.name}
                  >
                    {p.name}
                  </span>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 160 }}>
                  <span
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={p.managerName || 'Chưa gán'}
                  >
                    {p.managerName || 'Chưa gán'}
                  </span>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(new Date(p.startDate), 'dd/MM/yyyy')}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(new Date(p.plannedEndDate), 'dd/MM/yyyy')}</TableCell>
                <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}>
                  <ProgressBar value={p.progress} height={7} />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <StatusChip status={p.status} isOverdue={p.isOverdue} />
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {p.totalTasks} / <span style={{ color: '#10b981', fontWeight: 700 }}>{p.completedTasks}</span> /{' '}
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{p.overdueTasks}</span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  }
);
