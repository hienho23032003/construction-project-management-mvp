import React, { memo, useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Search,
  Clock,
  CheckSquare,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Calendar,
  FileEdit,
  PlusCircle,
  Trash2,
  Activity,
  ArrowRightLeft,
  FolderKanban,
  FolderTree,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ActivityLog, EmployeeActivityLog, PagedResult } from '../../../types';
import { activityLogApi } from '../../../services/api/endpoints';
import { useDebounce } from '../../../hooks/useDebounce';
import { CommonTable, ColumnDef } from '../../common/CommonTable';
import { getVietnameseStatus, getStatusConfig } from '../../common/StatusChip';
import { formatDateTime } from '../../../utils/dateUtils';

export interface EmployeeActivitiesTabProps {
  activities?: EmployeeActivityLog[] | ActivityLog[];
  userId?: string;
  onSelectTask?: (taskId: string) => void;
  onTotalCountChange?: (total: number) => void;
}

const getActionBadge = (action: string, isDark: boolean) => {
  const norm = (action || '').toLowerCase();

  if (norm.includes('status') || norm.includes('trạng thái')) {
    return {
      label: 'Đổi trạng thái',
      color: isDark ? '#c084fc' : '#7c3aed',
      bg: isDark ? 'rgba(168, 85, 247, 0.16)' : '#f3e8ff',
      border: isDark ? 'rgba(168, 85, 247, 0.35)' : '#ddd6fe',
      icon: <ArrowRightLeft size={13} />,
    };
  }
  if (norm.includes('progress') || norm.includes('tiến độ')) {
    return {
      label: 'Tiến độ',
      color: isDark ? '#fbbf24' : '#b45309',
      bg: isDark ? 'rgba(245, 158, 11, 0.16)' : '#fef3c7',
      border: isDark ? 'rgba(245, 158, 11, 0.35)' : '#fde68a',
      icon: <TrendingUp size={13} />,
    };
  }
  if (norm.includes('assign') || norm.includes('phân công') || norm.includes('nhân sự')) {
    return {
      label: 'Phân công',
      color: isDark ? '#22d3ee' : '#0e7490',
      bg: isDark ? 'rgba(6, 182, 212, 0.16)' : '#cffafe',
      border: isDark ? 'rgba(6, 182, 212, 0.35)' : '#a5f3fc',
      icon: <UserCheck size={13} />,
    };
  }
  if (norm.includes('deadline') || norm.includes('date') || norm.includes('thời gian') || norm.includes('hạn')) {
    return {
      label: 'Thời gian / Hạn chót',
      color: isDark ? '#fb923c' : '#c2410c',
      bg: isDark ? 'rgba(249, 115, 22, 0.16)' : '#ffedd5',
      border: isDark ? 'rgba(249, 115, 22, 0.35)' : '#fed7aa',
      icon: <Calendar size={13} />,
    };
  }
  if (norm.includes('created') || norm.includes('tạo')) {
    return {
      label: 'Tạo mới',
      color: isDark ? '#34d399' : '#047857',
      bg: isDark ? 'rgba(168, 185, 129, 0.16)' : '#d1fae5',
      border: isDark ? 'rgba(16, 185, 129, 0.35)' : '#a7f3d0',
      icon: <PlusCircle size={13} />,
    };
  }
  if (norm.includes('deleted') || norm.includes('xóa')) {
    return {
      label: 'Xóa',
      color: isDark ? '#f87171' : '#b91c1c',
      bg: isDark ? 'rgba(239, 68, 68, 0.16)' : '#fee2e2',
      border: isDark ? 'rgba(239, 68, 68, 0.35)' : '#fca5a5',
      icon: <Trash2 size={13} />,
    };
  }
  return {
    label: 'Cập nhật',
    color: isDark ? '#38bdf8' : '#0284c7',
    bg: isDark ? 'rgba(2, 132, 199, 0.16)' : '#e0f2fe',
    border: isDark ? 'rgba(56, 189, 248, 0.35)' : '#bae6fd',
    icon: <FileEdit size={13} />,
  };
};

const cleanLogDescription = (details?: string) => {
  if (!details) return '';
  return details
    .replace(/:\s*['"]?[\w\d_-]+['"]?\s*(->|→|➔|-->)\s*['"]?[\w\d_-]+['"]?/gi, '')
    .trim();
};

export const EmployeeActivitiesTab: React.FC<EmployeeActivitiesTabProps> = memo(({
  activities: initialActivities = [],
  userId,
  onSelectTask,
  onTotalCountChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Server-side paginated query
  const {
    data: pagedData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['employee-activity-logs', userId, page, rowsPerPage, debouncedSearch, actionFilter],
    queryFn: async () => {
      if (!userId) return null;
      const res = await activityLogApi.getLogs({
        userId,
        pageIndex: page + 1,
        pageSize: rowsPerPage,
        search: debouncedSearch.trim() || undefined,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
      });
      const data: any = res.data?.data;
      if (data && typeof data === 'object' && Array.isArray(data.items)) {
        return data as PagedResult<ActivityLog>;
      }
      if (Array.isArray(data)) {
        const total = data.length;
        const sliced = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
        return {
          items: sliced,
          totalCount: total,
          pageIndex: page + 1,
          pageSize: rowsPerPage,
          totalPages: Math.ceil(total / rowsPerPage),
          hasPreviousPage: page > 0,
          hasNextPage: (page + 1) * rowsPerPage < total,
        } as PagedResult<ActivityLog>;
      }
      return null;
    },
    enabled: Boolean(userId),
    staleTime: 15_000,
  });

  const totalCount = pagedData?.totalCount ?? initialActivities.length;

  useEffect(() => {
    if (typeof totalCount === 'number' && onTotalCountChange) {
      onTotalCountChange(totalCount);
    }
  }, [totalCount, onTotalCountChange]);
  const tableData: ActivityLog[] = useMemo(() => {
    if (pagedData?.items) {
      return pagedData.items;
    }
    if (initialActivities.length > 0) {
      return (initialActivities as ActivityLog[]).slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    }
    return [];
  }, [pagedData, initialActivities, page, rowsPerPage]);

  // Columns definition for CommonTable
  const columns: ColumnDef<ActivityLog>[] = useMemo(
    () => [
      {
        id: 'createdAt',
        header: 'Thời Gian',
        width: 115,
        minWidth: 105,
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.primary', fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
            <Clock size={14} color="#64748b" style={{ flexShrink: 0 }} />
            <span>{formatDateTime(row.createdAt)}</span>
          </Box>
        ),
      },
      {
        id: 'projectName',
        header: 'Dự Án',
        width: '20%',
        minWidth: 140,
        cellSx: { whiteSpace: 'normal', wordBreak: 'break-word' },
        cell: ({ row }) => {
          return row.projectName ? (
            <Box sx={{ display: 'inline-flex', alignItems: 'flex-start', gap: 0.75 }}>
              <FolderKanban size={14} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: 'text.primary',
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                }}
              >
                {row.projectName}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <FolderTree size={14} color="#64748b" />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Hệ thống chung
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'taskName',
        header: 'Hạng Mục / Công Việc',
        width: '26%',
        minWidth: 160,
        cellSx: { whiteSpace: 'normal', wordBreak: 'break-word' },
        cell: ({ row }) => {
          const hasTask = Boolean(row.taskId && onSelectTask);
          return row.taskName ? (
            <Box
              onClick={() => {
                if (hasTask && row.taskId && onSelectTask) {
                  onSelectTask(row.taskId);
                }
              }}
              sx={{
                display: 'inline-flex',
                alignItems: 'flex-start',
                gap: 0.75,
                maxWidth: '100%',
                cursor: hasTask ? 'pointer' : 'default',
                borderRadius: '6px',
                p: '2px 4px',
                ml: '-4px',
                transition: 'all 0.15s ease',
                '&:hover': hasTask
                  ? {
                      bgcolor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#e0f2fe',
                    }
                  : {},
              }}
              title={hasTask ? `Xem chi tiết: ${row.taskName}` : row.taskName}
            >
              <CheckSquare
                size={14}
                color={hasTask ? '#0284c7' : '#64748b'}
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: hasTask ? (isDark ? '#38bdf8' : '#0284c7') : 'text.primary',
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                }}
              >
                {row.taskName}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <FolderTree size={14} color="#64748b" />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Cấp dự án
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'action',
        header: 'Loại Biến Động',
        width: 145,
        minWidth: 135,
        cell: ({ row }) => {
          const badge = getActionBadge(row.action, isDark);
          return (
            <Chip
              icon={badge.icon}
              label={badge.label}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 600,
                bgcolor: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.border}`,
                '& .MuiChip-icon': {
                  color: 'inherit',
                  ml: 0.75,
                },
              }}
            />
          );
        },
      },
      {
        id: 'details',
        header: 'Chi Tiết Thay Đổi & Giá Trị Cũ ➔ Mới',
        minWidth: 260,
        cellSx: { whiteSpace: 'normal', wordBreak: 'break-word' },
        cell: ({ row }) => {
          const isStatusAction = row.action?.toLowerCase().includes('status');
          const isProgressAction = row.action?.toLowerCase().includes('progress');
          const hasOldNew = Boolean(row.oldValue && row.newValue && row.oldValue !== row.newValue);

          const desc = cleanLogDescription(row.details);

          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.25, width: '100%' }}>
              {/* If old and new values exist, show rich visual diff */}
              {hasOldNew ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                  {isStatusAction ? (
                    <>
                      <Chip
                        label={getVietnameseStatus(row.oldValue)}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.72rem',
                          textDecoration: 'line-through',
                          opacity: 0.75,
                          bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                          color: 'text.secondary',
                        }}
                      />
                      <ArrowRight size={13} color={isDark ? '#94a3b8' : '#64748b'} style={{ flexShrink: 0 }} />
                      {(() => {
                        const cfg = getStatusConfig(row.newValue || '', isDark);
                        return (
                          <Chip
                            label={getVietnameseStatus(row.newValue)}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              bgcolor: cfg.bg,
                              color: cfg.color,
                              border: `1px solid ${cfg.border}`,
                            }}
                          />
                        );
                      })()}
                    </>
                  ) : isProgressAction ? (
                    <>
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          textDecoration: 'line-through',
                          color: 'text.secondary',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      >
                        {row.oldValue}
                      </Typography>
                      <ArrowRight size={13} color="#f59e0b" style={{ flexShrink: 0 }} />
                      <Chip
                        label={row.newValue}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          bgcolor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7',
                          color: isDark ? '#fbbf24' : '#b45309',
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          textDecoration: 'line-through',
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          wordBreak: 'break-word',
                        }}
                        title={row.oldValue}
                      >
                        {row.oldValue}
                      </Typography>
                      <ArrowRight size={13} color="#0284c7" style={{ flexShrink: 0 }} />
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: '0.75rem',
                          wordBreak: 'break-word',
                        }}
                        title={row.newValue}
                      >
                        {row.newValue}
                      </Typography>
                    </>
                  )}
                </Box>
              ) : null}

              {/* Description text */}
              {desc && (
                <Typography
                  variant="body2"
                  sx={{
                    color: hasOldNew ? 'text.secondary' : 'text.primary',
                    fontSize: hasOldNew ? '0.75rem' : '0.8125rem',
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                  }}
                >
                  {desc}
                </Typography>
              )}
            </Box>
          );
        },
      },
    ],
    [isDark, onSelectTask]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header & Filter Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#18191a' : '#ffffff'),
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Activity size={20} color="#0284c7" />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.975rem' }}>
              Nhật Ký & Lịch Sử Hoạt Động Nhân Viên
            </Typography>
          </Box>
          <Chip
            label={`${totalCount} bản ghi`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              bgcolor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
              color: isDark ? '#38bdf8' : '#0369a1',
            }}
          />
        </Box>

        {/* Filter inputs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Tìm theo dự án, tên việc, chi tiết..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color="#94a3b8" />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: '100%', sm: 340 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '0.8125rem',
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 230 }}>
            <Select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(0);
              }}
              displayEmpty
              sx={{
                borderRadius: '8px',
                fontSize: '0.8125rem',
              }}
            >
              <MenuItem value="ALL">Tất cả loại biến động</MenuItem>
              <MenuItem value="STATUS">Đổi trạng thái</MenuItem>
              <MenuItem value="PROGRESS">Cập nhật tiến độ</MenuItem>
              <MenuItem value="ASSIGN">Phân công nhân sự</MenuItem>
              <MenuItem value="DATE">Thời gian / Hạn chót</MenuItem>
              <MenuItem value="CREATE">Tạo mới công việc</MenuItem>
              <MenuItem value="DELETE">Xóa công việc</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Làm mới dữ liệu">
            <span>
              <IconButton
                size="small"
                onClick={() => refetch()}
                disabled={isFetching}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px',
                  p: 0.8,
                }}
              >
                <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Paper>

      {/* Paginated Data Table */}
      <CommonTable
        columns={columns}
        data={tableData}
        loading={isLoading}
        showSTT={true}
        sttConfig={{
          title: 'STT',
          page,
          rowsPerPage,
          align: 'center',
          width: 56,
        }}
        bordered={true}
        density="standard"
        tableLayout="fixed"
        tableSx={{ width: '100%' }}
        minWidth={{ xs: 720, md: '100%' }}
        pagination={{
          page,
          rowsPerPage,
          totalCount,
          onPageChange: (newPage) => setPage(newPage),
          onRowsPerPageChange: (newRows) => {
            setRowsPerPage(newRows);
            setPage(0);
          },
          rowsPerPageOptions: [10, 20, 50, 100],
          isZeroIndexed: true,
        }}
        emptyMessage="Chưa có dữ liệu hoạt động nào phù hợp với bộ lọc."
      />
    </Box>
  );
});

EmployeeActivitiesTab.displayName = 'EmployeeActivitiesTab';
