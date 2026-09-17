import React, { memo, useState, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import { Activity, Clock } from 'lucide-react';
import { DashboardSummary } from '../../types';
import { CommonTable, ColumnDef } from '../common/CommonTable';
import { formatDateTime } from '../../utils/dateUtils';
import { getMediaUrl } from '../../utils/fileUtils';

interface DashboardActivitiesProps {
  data: DashboardSummary;
  canViewAll?: boolean;
  canViewProject?: boolean;
  onSelectTask?: (taskId: string) => void;
}

export const DashboardActivities: React.FC<DashboardActivitiesProps> = memo(({ data, canViewAll = false, canViewProject = false, onSelectTask }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
        minWidth: 150,
        cell: ({ row }) => {
          const formattedTime = formatDateTime(row.createdAt);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: 'text.secondary', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
              <Clock size={13} color={isDark ? '#94a3b8' : '#94a3b8'} />
              <span>{formattedTime}</span>
            </Box>
          );
        },
      },
      {
        id: 'userName',
        header: 'Người Thực Hiện',
        minWidth: 160,
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap' }}>
            <Avatar
              src={getMediaUrl(row.userAvatarUrl)}
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
              sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.primary', whiteSpace: 'nowrap' }}
            >
              {row.userName || '-'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'project',
        header: 'Dự Án / Công Trình',
        minWidth: 180,
        cell: ({ row }) =>
          row.projectCode ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
              <Chip
                label={row.projectCode}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 22,
                  bgcolor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                  color: isDark ? '#38bdf8' : '#0369a1',
                  border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : 'none',
                  width: 'fit-content',
                  mb: row.projectName ? 0.3 : 0,
                }}
              />
              {row.projectName && row.projectName !== row.projectCode && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    maxWidth: 180,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={row.projectName}
                >
                  {row.projectName}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              -
            </Typography>
          ),
      },
      {
        id: 'taskName',
        header: 'Hạng Mục / Công Việc',
        minWidth: 200,
        cell: ({ row }) =>
          row.taskName ? (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: row.taskId && onSelectTask ? (isDark ? '#38bdf8' : '#0284c7') : 'text.primary',
                whiteSpace: 'nowrap',
                maxWidth: 220,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: row.taskId && onSelectTask ? 'pointer' : 'default',
                '&:hover': {
                  textDecoration: row.taskId && onSelectTask ? 'underline' : 'none',
                },
              }}
              title={row.taskName}
            >
              {row.taskName}
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              -
            </Typography>
          ),
      },
      {
        id: 'content',
        header: 'Nội Dung & Biến Động',
        minWidth: 250,
        cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 320,
            }}
            title={row.content || row.title}
          >
            {row.content || row.title || 'Cập nhật tiến độ / trạng thái công việc'}
          </Typography>
        ),
      },
    ],
    [onSelectTask, isDark]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '8px',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: isDark
          ? '0 4px 20px -2px rgba(0, 0, 0, 0.4)'
          : '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          p: { xs: 1.75, sm: 2 },
          px: { xs: 2, sm: 2.5 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.75,
              borderRadius: '8px',
              bgcolor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#f0f9ff',
              color: isDark ? '#38bdf8' : '#0284c7',
            }}
          >
            <Activity size={18} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}>
            {canViewAll
              ? 'Nhật Ký Hoạt Động & Biến Động Toàn Hệ Thống'
              : canViewProject
              ? 'Nhật Ký Hoạt Động Các Dự Án Tham Gia'
              : 'Nhật Ký Hoạt Động Của Bạn Gần Đây'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={canViewAll ? 'Toàn hệ thống' : 'Cá nhân'}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: canViewAll
                ? isDark
                  ? 'rgba(56, 189, 248, 0.15)'
                  : '#eff6ff'
                : isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : '#f8fafc',
              color: canViewAll ? (isDark ? '#38bdf8' : '#1d4ed8') : 'text.secondary',
              border: '1px solid',
              borderColor: canViewAll ? (isDark ? 'rgba(56, 189, 248, 0.3)' : '#bfdbfe') : theme.palette.divider,
              fontSize: '0.72rem',
            }}
          />
          <Chip
            label={`${activities.length} hoạt động`}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#f0f9ff',
              color: isDark ? '#38bdf8' : '#0284c7',
              border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.3)' : '#bae6fd'}`,
              fontSize: '0.75rem',
            }}
          />
        </Box>
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
        onRowClick={(row: any) => {
          if (row.taskId && onSelectTask) {
            onSelectTask(row.taskId);
          }
        }}
        rowSx={(row: any) => ({
          cursor: row.taskId && onSelectTask ? 'pointer' : 'default',
          '&:hover': {
            bgcolor: row.taskId && onSelectTask ? (isDark ? 'rgba(56, 189, 248, 0.1) !important' : '#f0f9ff !important') : undefined,
          },
        })}
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
