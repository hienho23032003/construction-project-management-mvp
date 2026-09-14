import React, { memo, useState, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import { Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardSummary } from '../../types';
import { CommonTable, ColumnDef } from '../common/CommonTable';

interface DashboardActivitiesProps {
  data: DashboardSummary;
}

export const DashboardActivities: React.FC<DashboardActivitiesProps> = memo(({ data }) => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const activities = data.recentActivities || [];
  const paginatedActivities = useMemo(() => {
    return activities.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [activities, page, rowsPerPage]);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: 'createdAt',
        header: 'Thời Gian',
        width: 155,
        cell: ({ row }) => {
          let formattedTime = '-';
          try {
            if (row.createdAt) {
              formattedTime = format(new Date(row.createdAt), 'HH:mm dd/MM/yyyy');
            }
          } catch {
            formattedTime = row.createdAt || '-';
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#475569', fontSize: '0.8125rem' }}>
              <Clock size={13} color="#94a3b8" />
              <span>{formattedTime}</span>
            </Box>
          );
        },
      },
      {
        id: 'userName',
        header: 'Người Thực Hiện',
        width: 180,
        cell: ({ row }) => (
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
              {(row.userName || 'U').charAt(0).toUpperCase()}
            </Avatar>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}
            >
              {row.userName || '-'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'project',
        header: 'Dự Án / Công Trình',
        width: 170,
        cell: ({ row }) =>
          row.projectCode ? (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Chip
                label={row.projectCode}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 22,
                  bgcolor: '#e0f2fe',
                  color: '#0369a1',
                  width: 'fit-content',
                  mb: row.projectName ? 0.3 : 0,
                }}
              />
              {row.projectName && row.projectName !== row.projectCode && (
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
                  title={row.projectName}
                >
                  {row.projectName}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              -
            </Typography>
          ),
      },
      {
        id: 'task',
        header: 'Hạng Mục / Công Việc',
        width: 200,
        cell: ({ row }) =>
          row.taskName ? (
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
              title={row.taskName}
            >
              {row.taskName}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              -
            </Typography>
          ),
      },
      {
        id: 'details',
        header: 'Nội Dung & Biến Động',
        cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8125rem',
              color: '#1e293b',
              wordBreak: 'break-word',
            }}
          >
            {row.details || row.actionName || row.action || '-'}
          </Typography>
        ),
      },
    ],
    []
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

      {/* CommonTable */}
      <CommonTable
        data={paginatedActivities}
        columns={columns}
        showSTT
        sttConfig={{
          page,
          rowsPerPage,
          width: 60,
        }}
        rowKey={(r, idx) => r.id || `${r.userId}-${idx}`}
        density="compact"
        maxHeight={440}
        emptyMessage="Chưa có hoạt động nào được ghi nhận gần đây."
        pagination={{
          page,
          rowsPerPage,
          totalCount: activities.length,
          onPageChange: (newPage) => setPage(newPage),
          onRowsPerPageChange: (newRpp) => {
            setRowsPerPage(newRpp);
            setPage(0);
          },
          rowsPerPageOptions: [5, 10, 20, 50],
          isZeroIndexed: true,
        }}
      />
    </Paper>
  );
});
