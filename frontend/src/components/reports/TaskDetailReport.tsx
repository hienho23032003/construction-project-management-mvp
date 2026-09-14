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

interface TaskDetailReportProps {
  data: any[];
  page: number;
  rowsPerPage: number;
}

export const TaskDetailReport: React.FC<TaskDetailReportProps> = memo(
  ({ data, page, rowsPerPage }) => {
    const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
      <Table stickyHeader sx={{ minWidth: { xs: 720, md: '100%' } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '50px', textAlign: 'center', whiteSpace: 'nowrap', py: 1.5 }}>STT</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Dự Án</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Tên Công Việc</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Người Phụ Trách</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Thời Gian</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Tiến Độ</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Trạng Thái</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#64748b', whiteSpace: 'nowrap' }}>
                Không có dữ liệu công việc phù hợp
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((t, idx) => (
              <TableRow key={t.taskId} hover>
                <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600, color: '#64748b' }}>
                  {idx + 1}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Chip
                    label={t.projectCode}
                    size="small"
                    sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', maxWidth: { xs: 180, sm: 260 } }}>
                  <span
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={t.taskName}
                  >
                    {t.taskName}
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
                    title={t.assigneeNames || 'Chưa gán'}
                  >
                    {t.assigneeNames || 'Chưa gán'}
                  </span>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {format(new Date(t.startDate), 'dd/MM')} - {format(new Date(t.plannedEndDate), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}>
                  <ProgressBar value={t.progress} height={7} />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <StatusChip status={t.status} isOverdue={t.isOverdue} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  }
);
