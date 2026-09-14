import React, { memo, useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Avatar,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Divider,
} from '@mui/material';
import { Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardSummary } from '../../types';
import { CommonPagination } from '../common/CommonPagination';

interface DashboardActivitiesProps {
  data: DashboardSummary;
}

export const DashboardActivities: React.FC<DashboardActivitiesProps> = memo(({ data }) => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const activities = data.recentActivities || [];
  const paginatedActivities = activities.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <Paper
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7',
            }}
          >
            <Activity size={18} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
            Nhật Ký Hoạt Động & Biến Động Công Trường Gần Đây
          </Typography>
        </Box>
        <Chip
          label={`${activities.length} hoạt động`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: '#f0f9ff',
            color: '#0284c7',
            border: '1px solid #bae6fd',
            fontSize: '0.75rem',
          }}
        />
      </Box>

      {/* Table Content */}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ width: 60, fontWeight: 700 }}>
                STT
              </TableCell>
              <TableCell sx={{ width: 155, fontWeight: 700 }}>Thời Gian</TableCell>
              <TableCell sx={{ width: 180, fontWeight: 700 }}>Người Thực Hiện</TableCell>
              <TableCell sx={{ width: 170, fontWeight: 700 }}>Dự Án / Công Trình</TableCell>
              <TableCell sx={{ width: 200, fontWeight: 700 }}>Hạng Mục / Công Việc</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Nội Dung & Biến Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748b' }}>
                  Chưa có hoạt động nào được ghi nhận gần đây.
                </TableCell>
              </TableRow>
            ) : (
              paginatedActivities.map((act, index) => {
                const stt = page * rowsPerPage + index + 1;
                let formattedTime = '-';
                try {
                  if (act.createdAt) {
                    formattedTime = format(new Date(act.createdAt), 'HH:mm dd/MM/yyyy');
                  }
                } catch {
                  formattedTime = act.createdAt || '-';
                }

                return (
                  <TableRow
                    key={act.id || `${act.userId}-${index}`}
                    hover
                    sx={{
                      '&:nth-of-type(even)': { bgcolor: '#f8fafc' },
                      '&:hover': { bgcolor: '#f1f5f9 !important' },
                    }}
                  >
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b' }}>
                      {stt}
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.8125rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Clock size={13} color="#94a3b8" />
                        <span>{formattedTime}</span>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 26,
                            height: 26,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            bgcolor: '#0284c7',
                          }}
                        >
                          {(act.userName || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}
                        >
                          {act.userName || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {act.projectCode ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Chip
                            label={act.projectCode}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              height: 22,
                              bgcolor: '#e0f2fe',
                              color: '#0369a1',
                              width: 'fit-content',
                              mb: act.projectName ? 0.3 : 0,
                            }}
                          />
                          {act.projectName && act.projectName !== act.projectCode && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#64748b',
                                fontSize: '0.75rem',
                                maxWidth: 160,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={act.projectName}
                            >
                              {act.projectName}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {act.taskName ? (
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            fontSize: '0.8125rem',
                            color: '#334155',
                            maxWidth: 220,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={act.taskName}
                        >
                          {act.taskName}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.8125rem',
                          color: '#1e293b',
                          wordBreak: 'break-word',
                        }}
                      >
                        {act.details || act.actionName || act.action || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {activities.length > 0 && (
        <>
          <Divider />
          <CommonPagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={activities.length}
            onPageChange={(newPage) => setPage(newPage)}
            onRowsPerPageChange={(newRpp) => {
              setRowsPerPage(newRpp);
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20, 50]}
            isZeroIndexed={true}
          />
        </>
      )}
    </Paper>
  );
});
