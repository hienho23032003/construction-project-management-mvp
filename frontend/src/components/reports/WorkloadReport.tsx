import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { ProgressBar } from '../common/ProgressBar';

interface WorkloadReportProps {
  data: any[];
  page: number;
  rowsPerPage: number;
}

export const WorkloadReport: React.FC<WorkloadReportProps> = memo(
  ({ data, page, rowsPerPage }) => {
    const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
      <Table stickyHeader sx={{ minWidth: { xs: 720, md: '100%' } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '50px', textAlign: 'center', whiteSpace: 'nowrap', py: 1.5 }}>STT</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Họ Và Tên</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Phòng Ban</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Email</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Tổng Task</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Đang Thực Hiện</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Đã Hoàn Thành</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Quá Hạn</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>Tiến Độ TB</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#64748b', whiteSpace: 'nowrap' }}>
                Không có dữ liệu nhân sự phù hợp
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((w, idx) => (
              <TableRow key={w.userId} hover>
                <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600, color: '#64748b' }}>
                  {idx + 1}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', maxWidth: { xs: 140, sm: 200 } }}>
                  <span
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={w.fullName}
                  >
                    {w.fullName}
                  </span>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{w.department || '-'}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: { xs: 150, sm: 220 } }}>
                  <span
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={w.email}
                  >
                    {w.email}
                  </span>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {w.totalTasks}
                </TableCell>
                <TableCell align="center" sx={{ color: '#0284c7', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {w.activeTasks}
                </TableCell>
                <TableCell align="center" sx={{ color: '#10b981', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {w.completedTasks}
                </TableCell>
                <TableCell align="center" sx={{ color: '#ef4444', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {w.overdueTasks}
                </TableCell>
                <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}>
                  <ProgressBar value={w.averageProgress} height={7} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  }
);
