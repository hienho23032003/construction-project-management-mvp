import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  CircularProgress,
} from '@mui/material';
import { CommonPagination } from '../components/common/CommonPagination';
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
import { format, parseISO } from 'date-fns';
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
    if (!minutes || minutes <= 0) return '< 1 phút';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} phút`;
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
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
              }}
            >
              <History size={26} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Lịch Sử Đăng Nhập & Đăng Xuất
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: '8px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Đang Trực Tuyến
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: '#22c55e',
                        boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.25)',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
                          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 6px rgba(34, 197, 94, 0)' },
                          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
                        },
                      }}
                    />
                    <Radio size={16} color="#22c55e" />
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803d' }}>
                  {stats?.activeOnlineUsers ?? 0}
                </Typography>
                <Typography variant="caption" sx={{ color: '#86efac', display: 'block', mt: 0.5, fontWeight: 500 }}>
                  Nhân sự đang có phiên hoạt động
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: '8px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Tổng Phiên Đăng Nhập
                  </Typography>
                  <ShieldCheck size={20} color="#0284c7" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {stats?.totalSessions ?? 0}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                  Tổng số lượt truy cập ghi nhận
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: '8px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Đăng Xuất Hôm Nay
                  </Typography>
                  <LogOut size={20} color="#f59e0b" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#b45309' }}>
                  {stats?.loggedOutToday ?? 0}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                  Phiên hoàn tất trong ngày
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: '8px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Thời Lượng Trung Bình
                  </Typography>
                  <Clock size={20} color="#8b5cf6" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#6d28d9' }}>
                  {stats?.avgSessionMinutes ? `${Math.round(stats.avgSessionMinutes)} phút` : '0 phút'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                  Thời gian làm việc mỗi phiên
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter Controls */}
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: '8px',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
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
        <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', bgcolor: '#ffffff' }}>
          <TableContainer
            sx={{
              overflow: 'auto',
              maxHeight: 'calc(100vh - 360px)',
            }}
          >
            <Table stickyHeader sx={{ minWidth: { xs: 780, md: '100%' } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '50px', textAlign: 'center', py: 1.5, whiteSpace: 'nowrap' }}>
                    STT
                  </TableCell>
                  <TableCell sx={{ py: 1.5, whiteSpace: 'nowrap' }}>
                    NHÂN SỰ
                  </TableCell>
                  <TableCell sx={{ py: 1.5, whiteSpace: 'nowrap' }}>
                    THỜI ĐIỂM ĐĂNG NHẬP
                  </TableCell>
                  <TableCell sx={{ py: 1.5, whiteSpace: 'nowrap' }}>
                    THỜI ĐIỂM ĐĂNG XUẤT
                  </TableCell>
                  <TableCell sx={{ py: 1.5, whiteSpace: 'nowrap' }}>
                    TỔNG THỜI LƯỢNG
                  </TableCell>
                  <TableCell sx={{ py: 1.5, whiteSpace: 'nowrap' }}>
                    ĐỊA CHỈ IP & THIẾT BỊ
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.5, whiteSpace: 'nowrap' }}>
                    TRẠNG THÁI
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingHistory ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, whiteSpace: 'nowrap' }}>
                      <CircularProgress size={32} color="primary" />
                      <Typography variant="body2" sx={{ color: '#64748b', mt: 1, whiteSpace: 'nowrap' }}>
                        Đang tải lịch sử phiên...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : !historyData || historyData.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, whiteSpace: 'nowrap' }}>
                      <History size={40} color="#cbd5e1" style={{ marginBottom: 8 }} />
                      <Typography variant="subtitle2" sx={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                        Không có bản ghi phiên đăng nhập nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  historyData.items.map((session: UserLoginSession, idx: number) => {
                    const isActive = session.status === 'Active';

                    return (
                      <TableRow
                        key={session.id}
                        hover
                        sx={{
                          bgcolor: isActive ? 'rgba(240, 253, 244, 0.4)' : 'inherit',
                        }}
                      >
                        <TableCell sx={{ textAlign: 'center', py: 1.5, whiteSpace: 'nowrap', fontWeight: 600, color: '#64748b' }}>
                          {(pageIndex - 1) * pageSize + idx + 1}
                        </TableCell>
                        {/* User Info */}
                        <TableCell sx={{ py: 1.5, whiteSpace: 'nowrap', maxWidth: { xs: 180, sm: 240 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: '#92400e', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700 }}>
                              {session.userName?.charAt(0) || 'U'}
                            </Avatar>
                            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                              <Typography
                                variant="subtitle2"
                                noWrap
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  color: '#2e251e',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {session.userName}
                              </Typography>
                              <Typography
                                variant="caption"
                                noWrap
                                sx={{
                                  color: '#66594d',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block',
                                }}
                              >
                                {session.userEmail} {session.roleName ? `• ${session.roleName}` : ''}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Login Time */}
                        <TableCell sx={{ py: 1.5, whiteSpace: 'nowrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e251e', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                            {session.loginTime ? format(parseISO(session.loginTime), 'HH:mm:ss') : '-'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#66594d', whiteSpace: 'nowrap' }}>
                            {session.loginTime ? format(parseISO(session.loginTime), 'dd/MM/yyyy') : '-'}
                          </Typography>
                        </TableCell>

                        {/* Logout Time */}
                        <TableCell sx={{ py: 1.5, whiteSpace: 'nowrap' }}>
                          {isActive ? (
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
                          ) : session.logoutTime ? (
                            <>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e251e', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                                {format(parseISO(session.logoutTime), 'HH:mm:ss')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#66594d', whiteSpace: 'nowrap' }}>
                                {format(parseISO(session.logoutTime), 'dd/MM/yyyy')}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#a39587', whiteSpace: 'nowrap' }}>-</Typography>
                          )}
                        </TableCell>

                        {/* Duration */}
                        <TableCell sx={{ py: 1.5, whiteSpace: 'nowrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Clock size={15} color={isActive ? '#16a34a' : '#786c60'} />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: isActive ? '#15803d' : '#2e251e',
                                fontSize: '0.8125rem',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {formatDuration(session.durationMinutes, isActive)}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* IP Address & User Agent */}
                        <TableCell sx={{ py: 1.5, whiteSpace: 'nowrap', maxWidth: 200 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                            <Globe size={14} color="#92400e" />
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#2e251e', whiteSpace: 'nowrap' }}>
                              {session.ipAddress || '127.0.0.1'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            {getDeviceIcon(session.userAgent)}
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{
                                color: '#66594d',
                                fontSize: '0.72rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                              }}
                              title={session.userAgent || ''}
                            >
                              {parseUserAgent(session.userAgent)}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Status */}
                        <TableCell align="center" sx={{ py: 1.5, whiteSpace: 'nowrap' }}>
                          {session.status === 'Active' ? (
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
                          ) : session.status === 'LoggedOut' ? (
                            <Chip
                              label="Đã Đăng Xuất"
                              size="small"
                              sx={{
                                bgcolor: '#f3ece1',
                                color: '#493e32',
                                fontWeight: 600,
                                fontSize: '0.72rem',
                                whiteSpace: 'nowrap',
                              }}
                            />
                          ) : (
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
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Common Pagination */}
          <CommonPagination
            page={pageIndex}
            rowsPerPage={pageSize}
            totalCount={historyData?.totalCount || 0}
            onPageChange={(newPage) => setPageIndex(newPage)}
            onRowsPerPageChange={(newSize) => {
              setPageSize(newSize);
              setPageIndex(1);
            }}
            rowsPerPageOptions={[10, 15, 30, 50]}
            isZeroIndexed={false}
          />
        </Box>
      </Box>
  );
};
