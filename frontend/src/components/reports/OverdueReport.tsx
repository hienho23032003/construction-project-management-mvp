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

interface OverdueReportProps {
  data: any[];
  page: number;
  rowsPerPage: number;
}

export const OverdueReport: React.FC<OverdueReportProps> = memo(
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
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Hạn Ban Đầu</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Số Ngày Quá Hạn</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Tiến Độ Hiện Tại</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#10b981', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Tuyệt vời! Không có công việc nào bị quá hạn.
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((o, idx) => (
              <TableRow key={o.taskId} hover sx={{ bgcolor: '#fff5f5' }}>
                <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600, color: '#64748b' }}>
                  {idx + 1}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Chip
                    label={o.projectCode}
                    size="small"
                    sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 800 }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', maxWidth: { xs: 180, sm: 260 } }}>
                  <span
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={o.taskName}
                  >
                    {o.taskName}
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
                    title={o.assigneeNames || 'Chưa gán'}
                  >
                    {o.assigneeNames || 'Chưa gán'}
                  </span>
                </TableCell>
                <TableCell sx={{ color: '#b91c1c', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {format(new Date(o.plannedEndDate), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Chip
                    label={`Trễ ${o.overdueDays} ngày`}
                    size="small"
                    sx={{ bgcolor: '#ef4444', color: '#ffffff', fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}>
                  <ProgressBar value={o.progress} height={7} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  }
);
