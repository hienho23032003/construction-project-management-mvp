import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  InputAdornment,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  ListTodo,
  Activity,
  Search,
  Mail,
  Phone,
  Building2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useUserProgressQuery } from '../hooks/useEmployees';
import { useTaskDetailQuery, useTaskCommentsQuery, useTaskDependenciesQuery, useAddCommentMutation } from '../hooks/useTasks';
import { CommonTable, ColumnDef } from '../components/common/CommonTable';
import { CommonSelect } from '../components/common/CommonSelect';
import { StatusChip } from '../components/common/StatusChip';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import { roleLabels } from './EmployeesPage';
import { EmployeeTaskItem, EmployeeProjectParticipation, EmployeeActivityLog } from '../types';
import { formatDate, formatShortDateTime } from '../utils/dateUtils';
import { getMediaUrl } from '../utils/fileUtils';

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');
  const [taskProjectFilter, setTaskProjectFilter] = useState('ALL');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Queries
  const { data: progressData, isLoading, error } = useUserProgressQuery(id);
  const { data: taskDetail } = useTaskDetailQuery(selectedTaskId);
  const { data: taskComments = [], isLoading: isLoadingComments } = useTaskCommentsQuery(selectedTaskId || undefined);
  const { data: taskDependencies = [] } = useTaskDependenciesQuery(selectedTaskId || undefined);
  const addCommentMutation = useAddCommentMutation(selectedTaskId || undefined);

  const user = progressData?.user;
  const stats = progressData?.stats;
  const projects: EmployeeProjectParticipation[] = progressData?.projects || [];
  const tasks: EmployeeTaskItem[] = progressData?.tasks || [];
  const activities: EmployeeActivityLog[] = progressData?.recentActivities || [];

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t: EmployeeTaskItem) => {
      const matchSearch =
        !taskSearch.trim() ||
        t.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.projectCode.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.projectName.toLowerCase().includes(taskSearch.toLowerCase());

      const matchStatus =
        taskStatusFilter === 'ALL' ||
        (taskStatusFilter === 'OVERDUE' ? t.isOverdue : t.status === taskStatusFilter);

      const matchProject =
        taskProjectFilter === 'ALL' || t.projectId === taskProjectFilter;

      return matchSearch && matchStatus && matchProject;
    });
  }, [tasks, taskSearch, taskStatusFilter, taskProjectFilter]);

  // Project Filter Options
  const projectOptions = useMemo(() => {
    const opts = [{ value: 'ALL', label: 'Tất cả dự án' }];
    projects.forEach((p: EmployeeProjectParticipation) => {
      opts.push({ value: p.projectId, label: `[${p.projectCode}] ${p.projectName}` });
    });
    return opts;
  }, [projects]);

  const handleAddComment = async (content: string, files?: File[]) => {
    if (selectedTaskId) {
      await addCommentMutation.mutateAsync({ content, files });
    }
  };

  // Task Columns
  const taskColumns: ColumnDef<EmployeeTaskItem>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Hạng Mục / Công Việc',
        accessorKey: 'name',
        minWidth: 260,
        cell: ({ row }) => (
          <Box
            onClick={() => setSelectedTaskId(row.taskId)}
            sx={{
              cursor: 'pointer',
              '&:hover': { color: '#0284c7' },
              transition: 'color 0.15s ease',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit' }}>
              {row.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FolderKanban size={13} color="#0284c7" />
              [{row.projectCode}] {row.projectName}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'priority',
        header: 'Ưu Tiên',
        accessorKey: 'priority',
        minWidth: 110,
        cell: ({ value }) => <PriorityBadge priority={value} size="small" />,
      },
      {
        id: 'status',
        header: 'Trạng Thái',
        accessorKey: 'status',
        minWidth: 150,
        cell: ({ row }) => {
          const isDone = row.status === 'Completed';
          const isCompletedLate = isDone && row.actualEndDate && new Date(row.actualEndDate.split('T')[0]).getTime() > new Date(row.plannedEndDate.split('T')[0]).getTime();
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <StatusChip status={row.status} size="small" />
              {row.isOverdue && !isDone && (
                <Chip
                  label="Trễ hạn"
                  size="small"
                  sx={{ bgcolor: '#fee2e2', color: '#ef4444', fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                />
              )}
              {isCompletedLate && (
                <Chip
                  label="Xong trễ"
                  size="small"
                  sx={{ bgcolor: '#fee2e2', color: '#ef4444', fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                />
              )}
            </Box>
          );
        },
      },
      {
        id: 'progress',
        header: 'Tiến Độ',
        accessorKey: 'progress',
        minWidth: 150,
        cell: ({ value, row }) => (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {Math.round(value)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, value))}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  bgcolor:
                    row.status === 'Completed'
                      ? '#10b981'
                      : row.isOverdue
                      ? '#ef4444'
                      : '#0284c7',
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        ),
      },
      {
        id: 'plannedEndDate',
        header: 'Hạn Chót',
        accessorKey: 'plannedEndDate',
        minWidth: 150,
        cell: ({ row }) => {
          const isDone = row.status === 'Completed';
          const isCompletedLate = isDone && row.actualEndDate && new Date(row.actualEndDate.split('T')[0]).getTime() > new Date(row.plannedEndDate.split('T')[0]).getTime();
          return (
            <Box>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {formatDate(row.plannedEndDate)}
              </Typography>
              {!isDone ? (
                <Typography
                  variant="caption"
                  sx={{
                    color: row.isOverdue ? '#ef4444' : row.daysRemaining <= 3 ? '#f59e0b' : '#64748b',
                    fontWeight: row.isOverdue || row.daysRemaining <= 3 ? 700 : 500,
                  }}
                >
                  {row.isOverdue
                    ? `Quá hạn ${Math.abs(row.daysRemaining)} ngày`
                    : row.daysRemaining === 0
                    ? 'Hạn hôm nay'
                    : `Còn ${row.daysRemaining} ngày`}
                </Typography>
              ) : isCompletedLate ? (
                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, display: 'block' }}>
                  Xong: {formatDate(row.actualEndDate!)} (Trễ hạn)
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, display: 'block' }}>
                  {row.actualEndDate ? `Xong: ${formatDate(row.actualEndDate)} (Đúng hạn)` : 'Hoàn thành đúng hạn'}
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        id: 'actions',
        header: 'Thao Tác',
        minWidth: 90,
        cell: ({ row }) => (
          <Tooltip title="Xem chi tiết công việc">
            <IconButton
              size="small"
              onClick={() => setSelectedTaskId(row.taskId)}
              sx={{ color: '#0284c7', '&:hover': { bgcolor: '#e0f2fe' } }}
            >
              <ExternalLink size={17} />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Đang tải dữ liệu tiến độ và hồ sơ nhân viên...
        </Typography>
      </Box>
    );
  }

  if (error || !progressData || !user) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
          Không thể tìm thấy thông tin nhân viên hoặc đã có lỗi xảy ra.
        </Typography>
        <Button variant="outlined" startIcon={<ArrowLeft size={18} />} onClick={() => navigate('/employees')}>
          Quay lại danh sách nhân sự
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: '100%', minWidth: 0 }}>
      {/* Top Breadcrumb & Back */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="text"
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/employees')}
          sx={{ color: '#64748b', fontWeight: 600, '&:hover': { color: '#0284c7' } }}
        >
          Quản Lý Nhân Sự
        </Button>
        <ChevronRight size={16} color="#94a3b8" />
        <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 700 }}>
          Hồ Sơ & Tiến Độ: {user.fullName}
        </Typography>
      </Box>

      {/* Employee Profile Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            src={getMediaUrl(user.avatarUrl)}
            sx={{
              width: { xs: 60, sm: 72 },
              height: { xs: 60, sm: 72 },
              bgcolor: '#0284c7',
              fontSize: { xs: '1.5rem', sm: '1.8rem' },
              fontWeight: 800,
              border: '3px solid #e0f2fe',
            }}
          >
            {user.fullName.charAt(0)}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.25rem', sm: '1.5rem' }, color: '#0f172a' }}>
                {user.fullName}
              </Typography>
              <Chip
                label={roleLabels[user.role] || user.roleName || user.role}
                size="small"
                sx={{
                  bgcolor: '#e0f2fe',
                  color: '#0369a1',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  border: '1px solid #bae6fd',
                }}
              />
              <Chip
                label={user.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                size="small"
                sx={{
                  bgcolor: user.isActive ? '#ecfdf5' : '#fef2f2',
                  color: user.isActive ? '#10b981' : '#ef4444',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 3 }, flexWrap: 'wrap', color: '#64748b', fontSize: '0.8125rem' }}>
              {user.department && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Building2 size={15} color="#0284c7" />
                  <span>{user.department}</span>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Mail size={15} color="#0284c7" />
                <span>{user.email}</span>
              </Box>
              {user.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Phone size={15} color="#0284c7" />
                  <span>{user.phone}</span>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Button
            variant="outlined"
            size="small"
            component={RouterLink}
            to="/gantt"
            startIcon={<TrendingUp size={16} />}
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
          >
            Xem trên Gantt
          </Button>
          <Button
            variant="contained"
            size="small"
            component={RouterLink}
            to="/tasks"
            startIcon={<ListTodo size={16} />}
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
          >
            Tất Cả Công Việc
          </Button>
        </Box>
      </Paper>

      {/* KPI Stats Cards */}
      <Grid container spacing={2}>
        {/* Total Projects */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem' }}>
                Dự Án Tham Gia
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                {stats?.totalProjects || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600, display: 'block', mt: 0.25 }}>
                {projects.filter((p: EmployeeProjectParticipation) => p.projectStatus === 'InProgress').length} công trình đang thi công
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f0f9ff', color: '#0284c7' }}>
              <FolderKanban size={26} />
            </Box>
          </Paper>
        </Grid>

        {/* Total Tasks */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem' }}>
                Việc Được Giao
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                {stats?.totalTasks || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, display: 'block', mt: 0.25 }}>
                {stats?.completedTasks || 0} đã xong • {stats?.inProgressTasks || 0} đang làm
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#ecfdf5', color: '#10b981' }}>
              <CheckCircle2 size={26} />
            </Box>
          </Paper>
        </Grid>

        {/* Overdue Tasks */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem' }}>
                Việc Quá Hạn
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: (stats?.overdueTasks || 0) > 0 ? '#ef4444' : '#0f172a', mt: 0.5 }}>
                {stats?.overdueTasks || 0}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: (stats?.overdueTasks || 0) > 0 ? '#ef4444' : '#64748b',
                  fontWeight: 600,
                  display: 'block',
                  mt: 0.25,
                }}
              >
                {(stats?.overdueTasks || 0) > 0 ? 'Cần xử lý gấp' : 'Đúng tiến độ'}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: (stats?.overdueTasks || 0) > 0 ? '#fef2f2' : '#f1f5f9',
                color: (stats?.overdueTasks || 0) > 0 ? '#ef4444' : '#64748b',
              }}
            >
              <AlertTriangle size={26} />
            </Box>
          </Paper>
        </Grid>

        {/* On-Time Rate & Avg Progress */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem' }}>
                Tỷ Lệ Đúng Hạn
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: (stats?.totalTasks ?? 0) === 0
                    ? '#0284c7'
                    : (stats?.onTimeCompletionRate ?? 100) >= 80
                    ? '#10b981'
                    : (stats?.onTimeCompletionRate ?? 100) >= 50
                    ? '#f59e0b'
                    : '#ef4444',
                  mt: 0.5,
                }}
              >
                {(stats?.totalTasks ?? 0) === 0 ? 100 : (stats?.onTimeCompletionRate ?? 0)}%
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mt: 0.25 }}>
                Tiến độ TB: {stats?.averageTaskProgress || 0}%
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: (stats?.totalTasks ?? 0) === 0
                  ? '#f0f9ff'
                  : (stats?.onTimeCompletionRate ?? 100) >= 80
                  ? '#ecfdf5'
                  : (stats?.onTimeCompletionRate ?? 100) >= 50
                  ? '#fffbeb'
                  : '#fef2f2',
                color: (stats?.totalTasks ?? 0) === 0
                  ? '#0284c7'
                  : (stats?.onTimeCompletionRate ?? 100) >= 80
                  ? '#10b981'
                  : (stats?.onTimeCompletionRate ?? 100) >= 50
                  ? '#f59e0b'
                  : '#ef4444',
              }}
            >
              <TrendingUp size={26} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs Layout */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: '1px solid #e2e8f0', px: { xs: 1, sm: 2 } }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.8125rem', sm: '0.9rem' },
                minHeight: 48,
                px: { xs: 1.5, sm: 2 },
                minWidth: 'auto',
                whiteSpace: 'nowrap',
              },
            }}
          >
            <Tab
              label={`Công Việc & Tiến Độ (${tasks.length})`}
              icon={<ListTodo size={17} />}
              iconPosition="start"
            />
            <Tab
              label={`Dự Án Tham Gia (${projects.length})`}
              icon={<FolderKanban size={17} />}
              iconPosition="start"
            />
            <Tab
              label={`Lịch Sử Hoạt Động (${activities.length})`}
              icon={<Activity size={17} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* TAB 0: TASKS */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Task Filters */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
                <TextField
                  size="small"
                  placeholder="Tìm kiếm công việc, mã dự án..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={17} color="#94a3b8" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: { xs: '100%', sm: 280, md: 340 } }}
                />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
                  <CommonSelect
                    label="Dự Án"
                    value={taskProjectFilter}
                    onChange={(val) => setTaskProjectFilter(val as string)}
                    options={projectOptions}
                    size="small"
                    sx={{ minWidth: 180 }}
                  />

                  <CommonSelect
                    label="Trạng Thái"
                    value={taskStatusFilter}
                    onChange={(val) => setTaskStatusFilter(val as string)}
                    options={[
                      { value: 'ALL', label: 'Tất cả trạng thái' },
                      { value: 'InProgress', label: 'Đang thực hiện' },
                      { value: 'Completed', label: 'Đã hoàn thành' },
                      { value: 'OVERDUE', label: 'Quá hạn (Overdue)' },
                      { value: 'NotStarted', label: 'Chưa bắt đầu' },
                      { value: 'OnHold', label: 'Tạm dừng' },
                    ]}
                    size="small"
                    sx={{ minWidth: 170 }}
                  />
                </Box>
              </Box>

              {/* Tasks Table */}
              <CommonTable<EmployeeTaskItem>
                data={filteredTasks}
                columns={taskColumns}
                emptyMessage={
                  tasks.length === 0
                    ? 'Nhân viên này chưa được phân công công việc nào.'
                    : 'Không tìm thấy công việc phù hợp với bộ lọc.'
                }
              />
            </Box>
          )}

          {/* TAB 1: PROJECTS */}
          {activeTab === 1 && (
            <Box>
              {projects.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>
                  <FolderKanban size={40} color="#94a3b8" style={{ marginBottom: 8 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Chưa tham gia dự án nào
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                    Nhân viên chưa được phân công vào danh sách thành viên dự án nào.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2.5}>
                  {projects.map((p: EmployeeProjectParticipation) => (
                    <Grid item xs={12} sm={6} md={4} key={p.projectId}>
                      <Card
                        elevation={0}
                        sx={{
                          border: '1px solid #e2e8f0',
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            borderColor: '#0284c7',
                            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Chip
                              label={p.projectCode}
                              size="small"
                              sx={{ bgcolor: '#f0f9ff', color: '#0284c7', fontWeight: 800, fontSize: '0.75rem' }}
                            />
                            <StatusChip status={p.projectStatus} size="small" />
                          </Box>

                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5, lineHeight: 1.3 }}>
                            {p.projectName}
                          </Typography>

                          {p.roleInProject && (
                            <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600, mb: 1, display: 'block' }}>
                              Vai trò: {p.roleInProject}
                            </Typography>
                          )}

                          {p.projectLocation && (
                            <Typography variant="caption" sx={{ color: '#64748b', mb: 1.5, display: 'block' }} noWrap>
                              {p.projectLocation}
                            </Typography>
                          )}

                          <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                Tiến độ công trình
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                {Math.round(p.projectProgress)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={p.projectProgress}
                              sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0', mb: 1.5 }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                <strong>{p.totalTasks}</strong> việc ({p.completedTasks} xong)
                              </Typography>
                              <Button
                                size="small"
                                component={RouterLink}
                                to={`/projects/${p.projectId}`}
                                endIcon={<ChevronRight size={14} />}
                                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', p: 0 }}
                              >
                                Xem Dự Án
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* TAB 2: ACTIVITIES */}
          {activeTab === 2 && (
            <Box>
              {activities.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>
                  <Activity size={40} color="#94a3b8" style={{ marginBottom: 8 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Chưa có nhật ký hoạt động nào
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Các thao tác cập nhật tiến độ, hoàn thành công việc của nhân viên sẽ hiển thị tại đây.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {activities.map((act: EmployeeActivityLog) => (
                    <Paper
                      key={act.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        border: '1px solid #f1f5f9',
                        bgcolor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: '50%',
                          bgcolor: '#e0f2fe',
                          color: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Activity size={16} />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {act.details || act.action}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            {formatShortDateTime(act.createdAt)}
                          </Typography>
                        </Box>
                        {(act.projectName || act.taskName) && (
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                            {act.projectName && <span>Dự án: <strong>{act.projectName}</strong></span>}
                            {act.projectName && act.taskName && ' • '}
                            {act.taskName && <span>Công việc: <strong>{act.taskName}</strong></span>}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={taskDetail || null}
        onClose={() => setSelectedTaskId(null)}
        comments={taskComments}
        dependencies={taskDependencies}
        loadingComments={isLoadingComments}
        onAddComment={handleAddComment}
      />
    </Box>
  );
};
