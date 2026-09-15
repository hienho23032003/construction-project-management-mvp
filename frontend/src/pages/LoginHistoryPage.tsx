import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { CommonTable, ColumnDef } from '../components/common/CommonTable';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  History,
  Search,
  RefreshCw,
  Radio,
  Clock,
  LogOut,
  ShieldCheck,
  Monitor,
  Smartphone,
  Globe,
} from 'lucide-react';
import { format } from 'date-fns';
import { formatDateTime as formatLocalDateTime } from '../utils/dateUtils';
import { useLoginHistoryQuery, useSessionStatsQuery } from '../hooks/useUserSessions';
import { useUsersListQuery } from '../hooks/useEmployees';
import { useDebounce } from '../hooks/useDebounce';
import { UserLoginSession } from '../types';

export const LoginHistoryPage: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const formattedFromDate = fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined;
  const formattedToDate = toDate ? format(toDate, 'yyyy-MM-dd') : undefined;

  const {
    data: historyData,
    isLoading: loadingHistory,
    refetch: refetchHistory,
    isFetching,
  } = useLoginHistoryQuery({
    pageIndex,
    pageSize,
    search: debouncedSearch,
    userId: selectedUser || undefined,
    status: status || undefined,
    fromDate: formattedFromDate,
    toDate: formattedToDate,
  });

  const { data: stats, refetch: refetchStats } = useSessionStatsQuery({
    fromDate: formattedFromDate,
    toDate: formattedToDate,
  });

  const { data: userList = [] } = useUsersListQuery();

  const handleRefresh = () => {
    refetchHistory();
    refetchStats();
  };

  const formatDuration = (minutes?: number, isActive?: boolean) => {
    if (isActive) return 'Đang trực tuyến';
    if (minutes === undefined || minutes === null || minutes <= 0) return '< 1 phút';
    const hours = Math.floor(minutes / 60);
    if (hours === 0) {
      const mins = Math.round(minutes * 10) / 10;
      return `${mins} phút`;
    }
    const mins = Math.round(minutes % 60);
    if (mins === 0) return `${hours} giờ`;
    return `${hours} giờ ${mins} phút`;
  };

  const getDeviceIcon = (ua?: string) => {
    if (!ua) return <Monitor size={16} color="#64748b" />;
    const lower = ua.toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
      return <Smartphone size={16} color="#0284c7" />;
    }
    return <Monitor size={16} color="#0284c7" />;
  };

  const parseUserAgent = (ua?: string) => {
    if (!ua) return 'Không xác định';
    if (ua.includes('Edg/')) return 'Microsoft Edge';
    if (ua.includes('Chrome/')) return 'Google Chrome';
    if (ua.includes('Firefox/')) return 'Mozilla Firefox';
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Apple Safari';
    return ua.length > 25 ? `${ua.substring(0, 25)}...` : ua;
  };

  const formatDateTime = (dateStr?: string, pattern: string = 'HH:mm:ss') => {
    return formatLocalDateTime(dateStr, pattern);
  };

  const columns: ColumnDef<UserLoginSession>[] = useMemo(
    () => [
      {
        id: 'user',
        header: 'NHÂN SỰ',
        minWidth: 200,
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, whiteSpace: 'nowrap' }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: '#0284c7',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              {row.userName?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.userName}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontSize: '0.75rem',
                  display: 'block',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.userEmail}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        id: 'loginTime',
        header: 'THỜI ĐIỂM ĐĂNG NHẬP',
        minWidth: 150,
        cell: ({ row }) => (
          <Box sx={{ whiteSpace: 'nowrap' }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
            >
              {formatDateTime(row.loginTime, 'HH:mm:ss')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', whiteSpace: 'nowrap' }}>
              {formatDateTime(row.loginTime, 'dd/MM/yyyy')}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'logoutTime',
        header: 'THỜI ĐIỂM ĐĂNG XUẤT',
        minWidth: 150,
        cell: ({ row }) => {
          const isActive = row.status === 'Active';
          if (isActive) {
            return (
              <Chip
                label="Đang trực tuyến"
                size="small"
                sx={{
                  bgcolor: '#dcfce7',
                  color: '#15803d',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  whiteSpace: 'nowrap',
                }}
              />
            );
          }
          if (row.logoutTime) {
            return (
              <Box sx={{ whiteSpace: 'nowrap' }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
                >
                  {formatDateTime(row.logoutTime, 'HH:mm:ss')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                  {formatDateTime(row.logoutTime, 'dd/MM/yyyy')}
                </Typography>
              </Box>
            );
          }
          return <Typography variant="caption" sx={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>-</Typography>;
        },
      },
      {
        id: 'duration',
        header: 'TỔNG THỜI LƯỢNG',
        minWidth: 140,
        cell: ({ row }) => {
          const isActive = row.status === 'Active';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, whiteSpace: 'nowrap' }}>
              <Clock size={15} color={isActive ? '#16a34a' : '#64748b'} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: isActive ? '#15803d' : '#0f172a',
                  fontSize: '0.8125rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatDuration(row.durationMinutes, isActive)}
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'device',
        header: 'ĐỊA CHỈ IP & THIẾT BỊ',
        minWidth: 180,
        cell: ({ row }) => (
          <Box sx={{ whiteSpace: 'nowrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
              <Globe size={14} color="#0284c7" />
              <Typography
                variant="body2"
                sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#0f172a', whiteSpace: 'nowrap' }}
              >
                {row.ipAddress || '127.0.0.1'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              {getDeviceIcon(row.userAgent)}
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontSize: '0.72rem',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
                title={row.userAgent || ''}
              >
                {parseUserAgent(row.userAgent)}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        id: 'status',
        header: 'TRẠNG THÁI',
        align: 'center',
        minWidth: 120,
        cell: ({ row }) => {
          if (row.status === 'Active') {
            return (
              <Chip
                label="Hoạt Động"
                size="small"
                sx={{
                  bgcolor: '#dcfce7',
                  color: '#166534',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  whiteSpace: 'nowrap',
                }}
              />
            );
          }
          if (row.status === 'LoggedOut') {
            return (
              <Chip
                label="Đã Đăng Xuất"
                size="small"
                sx={{
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  whiteSpace: 'nowrap',
                }}
              />
            );
          }
          return (
            <Chip
              label="Hết Hạn"
              size="small"
              sx={{
                bgcolor: '#fef3c7',
                color: '#b45309',
                fontWeight: 600,
                fontSize: '0.72rem',
                whiteSpace: 'nowrap',
              }}
            />
          );
        },
      },
    ],
    []
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 }, width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: '8px',
                bgcolor: 'rgba(2, 132, 199, 0.1)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <History size={26} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.15rem', sm: '1.35rem' } }}>
                Lịch Sử Đăng Nhập & Đăng Xuất
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Theo dõi phiên làm việc, thời gian truy cập thực tế, trạng thái trực tuyến và bảo mật đăng nhập
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Làm mới dữ liệu">
            <IconButton
              onClick={handleRefresh}
              disabled={isFetching}
              sx={{
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                '&:hover': { bgcolor: '#f1f5f9' },
              }}
            >
              <RefreshCw size={18} color="#0284c7" className={isFetching ? 'animate-spin' : ''} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Top 4 KPI Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: { xs: 1.5, sm: 2 },
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: '8px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: { xs: '0.68rem', sm: '0.75rem' } }} noWrap>
                  Đang Trực Tuyến
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#22c55e',
                      boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.25)',
                    }}
                  />
                  <Radio size={14} color="#22c55e" />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803d', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {stats?.activeOnlineUsers ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#16a34a', display: 'block', mt: 0.5, fontWeight: 500, fontSize: '0.7rem' }} noWrap>
                Đang có phiên hoạt động
              </Typography>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{
              borderRadius: '8px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: { xs: '0.68rem', sm: '0.75rem' } }} noWrap>
                  Tổng Phiên Đăng Nhập
                </Typography>
                <ShieldCheck size={18} color="#0284c7" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {stats?.totalSessions ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, fontSize: '0.7rem' }} noWrap>
                Lượt truy cập ghi nhận
              </Typography>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{
              borderRadius: '8px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: { xs: '0.68rem', sm: '0.75rem' } }} noWrap>
                  Đăng Xuất Hôm Nay
                </Typography>
                <LogOut size={18} color="#f59e0b" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#b45309', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {stats?.loggedOutToday ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, fontSize: '0.7rem' }} noWrap>
                Phiên hoàn tất trong ngày
              </Typography>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{
              borderRadius: '8px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: { xs: '0.68rem', sm: '0.75rem' } }} noWrap>
                  Thời Lượng TB
                </Typography>
                <Clock size={18} color="#8b5cf6" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#6d28d9', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {stats?.avgSessionMinutes ? `${Math.round(stats.avgSessionMinutes)}m` : '0m'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, fontSize: '0.7rem' }} noWrap>
                Thời gian mỗi phiên
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filter Controls */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: '8px',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            width: '100%',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm nhân sự, email, IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} color="#94a3b8" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Nhân Viên</InputLabel>
                <Select
                  value={selectedUser}
                  label="Nhân Viên"
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <MenuItem value="">Tất cả nhân viên</MenuItem>
                  {userList.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.fullName} ({u.roleName || u.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng Thái</InputLabel>
                <Select
                  value={status}
                  label="Trạng Thái"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  <MenuItem value="Active">Đang hoạt động</MenuItem>
                  <MenuItem value="LoggedOut">Đã đăng xuất</MenuItem>
                  <MenuItem value="Expired">Hết hạn phiên</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2.25}>
              <DatePicker
                label="Từ Ngày"
                value={fromDate}
                onChange={(newVal) => setFromDate(newVal)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.25}>
              <DatePicker
                label="Đến Ngày"
                value={toDate}
                onChange={(newVal) => setToDate(newVal)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Sessions Table */}
        <CommonTable<UserLoginSession>
          data={historyData?.items || []}
          columns={columns}
          loading={loadingHistory}
          showSTT
          sttConfig={{
            page: pageIndex - 1,
            rowsPerPage: pageSize,
          }}
          rowKey="id"
          rowSx={(session: UserLoginSession) => ({
            bgcolor: session.status === 'Active' ? 'rgba(240, 253, 244, 0.4)' : 'inherit',
          })}
          maxHeight="calc(100vh - 360px)"
          minWidth={{ xs: 780, md: '100%' }}
          emptyMessage="Không có bản ghi phiên đăng nhập nào"
          emptyIcon={<History size={40} color="#cbd5e1" style={{ marginBottom: 8 }} />}
          bordered
          pagination={{
            page: pageIndex,
            rowsPerPage: pageSize,
            totalCount: historyData?.totalCount || 0,
            onPageChange: (newPage) => setPageIndex(newPage),
            onRowsPerPageChange: (newSize) => {
              setPageSize(newSize);
              setPageIndex(1);
            },
            rowsPerPageOptions: [10, 15, 30, 50],
            isZeroIndexed: false,
          }}
        />
      </Box>
  );
};
