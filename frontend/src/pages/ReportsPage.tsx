import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  TableContainer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Autocomplete,
  TextField,
  Chip,
} from '@mui/material';
import {
  Download,
  BarChart3,
  AlertTriangle,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { reportApi } from '../services/api/endpoints';
import { useProjectsListQuery } from '../hooks/useProjects';
import { useUsersListQuery } from '../hooks/useEmployees';
import {
  useProjectProgressReportQuery,
  useTaskReportQuery,
  useOverdueReportQuery,
  useWorkloadReportQuery,
} from '../hooks/useReports';
import {
  useTaskDetailQuery,
  useTaskCommentsQuery,
  useTaskDependenciesQuery,
  useAddCommentMutation,
} from '../hooks/useTasks';
import { useAppSearchParams } from '../hooks/useAppSearchParams';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { CommonDateRangePicker } from '../components/common/CommonDateRangePicker';
import { ProjectProgressReport } from '../components/reports/ProjectProgressReport';
import { TaskDetailReport } from '../components/reports/TaskDetailReport';
import { OverdueReport } from '../components/reports/OverdueReport';
import { WorkloadReport } from '../components/reports/WorkloadReport';
import { TableSkeleton } from '../components/common/TableSkeleton';
import { CommonPagination } from '../components/common/CommonPagination';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import { ScopeChip } from '../components/common/ScopeChip';
import { useToast } from '../contexts/ToastContext';

import { usePermission } from '../hooks/usePermission';
import { PERMISSIONS } from '../constants/permissions';

const TAB_NAME_MAP: Record<string, number> = {
  progress: 0,
  projects: 0,
  tasks: 1,
  detail: 1,
  overdue: 2,
  workload: 3,
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
};

const TAB_INDEX_MAP: Record<number, string> = {
  0: 'progress',
  1: 'tasks',
  2: 'overdue',
  3: 'workload',
};

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { can, isSuperAdmin } = usePermission();
  const canExport = isSuperAdmin || can(PERMISSIONS.REPORTS_EXPORT);
  const canViewAll = isSuperAdmin || can(PERMISSIONS.REPORTS_VIEW_ALL);
  const canViewProject = canViewAll || can(PERMISSIONS.REPORTS_VIEW_PROJECT);
  const { getParam, getNumberParam, setParam, setParams, removeParams } = useAppSearchParams();

  const tabParam = getParam('tab');
  const projectIdParam = getParam('projectId');
  const userIdParam = getParam('userId');
  const fromDateParam = getParam('fromDate');
  const toDateParam = getParam('toDate');
  const taskIdParam = getParam('taskId');
  const pageParam = Math.max(0, getNumberParam('page', 1) - 1);

  const resolvedInitialTab = tabParam && TAB_NAME_MAP[tabParam.toLowerCase()] !== undefined
    ? TAB_NAME_MAP[tabParam.toLowerCase()]
    : 0;

  const [activeTab, setActiveTab] = useState(resolvedInitialTab);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdParam);
  const [selectedUserId, setSelectedUserId] = useState<string>(userIdParam);
  const [fromDate, setFromDate] = useState<Date | null>(() => {
    if (fromDateParam === 'ALL') return null;
    if (fromDateParam) return new Date(fromDateParam);
    return startOfYear(new Date());
  });
  const [toDate, setToDate] = useState<Date | null>(() => {
    if (toDateParam === 'ALL') return null;
    if (toDateParam) return new Date(toDateParam);
    return endOfYear(new Date());
  });

  // Selected task for detail drawer
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(taskIdParam || null);
  const { data: selectedTask } = useTaskDetailQuery(selectedTaskId || undefined);
  const { data: comments = [], isLoading: loadingComments } = useTaskCommentsQuery(selectedTaskId || undefined);
  const { data: dependencies = [] } = useTaskDependenciesQuery(selectedTaskId || undefined);
  const addCommentMutation = useAddCommentMutation(selectedTaskId || undefined);

  // Pagination
  const [page, setPage] = useState(pageParam);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sync tab with URL
  useEffect(() => {
    if (tabParam && TAB_NAME_MAP[tabParam.toLowerCase()] !== undefined) {
      setActiveTab(TAB_NAME_MAP[tabParam.toLowerCase()]);
    }
  }, [tabParam]);

  // Sync taskId with URL
  useEffect(() => {
    if (taskIdParam && taskIdParam !== selectedTaskId) {
      setSelectedTaskId(taskIdParam);
    }
  }, [taskIdParam, selectedTaskId]);

  // Filter options queries
  const { data: projects = [] } = useProjectsListQuery();
  const { data: users = [] } = useUsersListQuery();

  // Active filter payload
  const filter = useMemo(
    () => ({
      projectId: selectedProjectId || undefined,
      userId: selectedUserId || undefined,
      fromDate: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
      toDate: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
    }),
    [selectedProjectId, selectedUserId, fromDate, toDate]
  );

  // Queries for each tab
  const { data: projectReport = [], isLoading: loadingProjects, isFetching: fetchingProjects } = useProjectProgressReportQuery(
    activeTab === 0 ? filter : null
  );
  const { data: taskReport = [], isLoading: loadingTasks, isFetching: fetchingTasks } = useTaskReportQuery(
    activeTab === 1 ? filter : null
  );
  const { data: overdueReport = [], isLoading: loadingOverdue, isFetching: fetchingOverdue } = useOverdueReportQuery(
    activeTab === 2 ? filter : null
  );
  const { data: workloadReport = [], isLoading: loadingWorkload, isFetching: fetchingWorkload } = useWorkloadReportQuery(
    activeTab === 3 ? filter : null
  );

  const isCurrentTabLoading =
    activeTab === 0
      ? loadingProjects || fetchingProjects
      : activeTab === 1
      ? loadingTasks || fetchingTasks
      : activeTab === 2
      ? loadingOverdue || fetchingOverdue
      : loadingWorkload || fetchingWorkload;

  const currentCount =
    activeTab === 0
      ? projectReport.length
      : activeTab === 1
      ? taskReport.length
      : activeTab === 2
      ? overdueReport.length
      : workloadReport.length;

  const { showSuccess, showError } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const tabName = TAB_INDEX_MAP[activeTab] || 'tasks';
      await reportApi.downloadReportCsv(tabName, {
        projectId: selectedProjectId || undefined,
        userId: selectedUserId || undefined,
        fromDate: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
        toDate: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
      });
      showSuccess('Xuất báo cáo thành công.');
    } catch (err) {
      console.error('Export error:', err);
      showError('Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử lại.');
    } finally {
      setExporting(false);
    }
  };

  const handleViewTasksFromProject = (projectId: string, filterType: 'all' | 'completed' | 'overdue') => {
    if (filterType === 'overdue') {
      setActiveTab(2);
      setSelectedProjectId(projectId);
      setPage(0);
      setParams({ tab: 'overdue', projectId, page: null });
    } else if (filterType === 'completed') {
      navigate(`/tasks?projectId=${projectId}&status=Completed`);
    } else {
      setActiveTab(1);
      setSelectedProjectId(projectId);
      setPage(0);
      setParams({ tab: 'tasks', projectId, page: null });
    }
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setParam('taskId', taskId);
  };

  const handleCloseTaskDrawer = () => {
    setSelectedTaskId(null);
    removeParams('taskId', 'taskTab');
  };

  const handleSelectUser = (userId: string) => {
    navigate(`/employees/${userId}`);
  };

  const handleAddComment = async (content: string, files?: File[]) => {
    if (!selectedTaskId) return;
    await addCommentMutation.mutateAsync({ content, files });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 }, width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, width: '100%' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.35rem' }, color: '#0f172a' }}>
              Trung Tâm Báo Cáo & Xuất Dữ Liệu
            </Typography>
            <ScopeChip canViewAll={canViewAll} canViewProject={canViewProject} />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {canViewAll
              ? 'Báo cáo tổng hợp tiến độ, phân tích trễ hạn và khối lượng thực hiện toàn công ty'
              : canViewProject
              ? 'Báo cáo tổng hợp tiến độ và các công việc trong các dự án bạn tham gia hoặc quản lý'
              : 'Báo cáo tổng hợp tiến độ và các công việc do bạn quản lý hoặc được phân công'}
          </Typography>
        </Box>

        {canExport && (
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            onClick={handleExportCsv}
            disabled={exporting}
            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 700 }}
          >
            {exporting ? 'Đang xuất dữ liệu...' : 'Xuất Báo Cáo Excel / CSV'}
          </Button>
        )}
      </Box>

      {/* Filter Toolbar */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', width: '100%', maxWidth: '100%' }}>
        <Box sx={{ width: { xs: '100%', sm: 340 } }}>
          <CommonDateRangePicker
            fromDate={fromDate}
            toDate={toDate}
            onChange={(from, to) => {
              setFromDate(from);
              setToDate(to);
              setPage(0);
              setParams({
                fromDate: from ? format(from, 'yyyy-MM-dd') : 'ALL',
                toDate: to ? format(to, 'yyyy-MM-dd') : 'ALL',
                page: null,
              });
            }}
            placeholder="Lọc theo khoảng ngày..."
            fullWidth
          />
        </Box>

        <Autocomplete
          size="small"
          sx={{ width: { xs: '100%', sm: 260 } }}
          options={[{ id: '', code: 'ALL', name: 'Tất cả dự án' }, ...projects]}
          getOptionLabel={(p) => (p.id ? `${p.code} - ${p.name}` : p.name)}
          value={projects.find((p) => p.id === selectedProjectId) || { id: '', code: 'ALL', name: 'Tất cả dự án' }}
          onChange={(_, val) => {
            const nextProj = val?.id || '';
            setSelectedProjectId(nextProj);
            setPage(0);
            setParams({ projectId: nextProj || null, page: null });
          }}
          renderInput={(params) => <TextField {...params} label="Lọc Theo Dự Án" />}
        />

        {(canViewAll || canViewProject) && (
          <Autocomplete
            size="small"
            sx={{ width: { xs: '100%', sm: 260 } }}
            options={[{ id: '', fullName: 'Tất cả nhân sự', department: '' }, ...users]}
            getOptionLabel={(u) => (u.id ? `${u.fullName} (${u.department || 'Chưa phân ban'})` : u.fullName)}
            value={users.find((u) => u.id === selectedUserId) || { id: '', fullName: 'Tất cả nhân sự', department: '' }}
            onChange={(_, val) => {
              const nextUser = val?.id || '';
              setSelectedUserId(nextUser);
              setPage(0);
              setParams({ userId: nextUser || null, page: null });
            }}
            renderInput={(params) => <TextField {...params} label="Lọc Theo Nhân Sự" />}
          />
        )}
      </Paper>

      {/* Tab Navigation & Report Table */}
      <Paper sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            setPage(0);
            setParams({ tab: TAB_INDEX_MAP[val] || 'progress', page: null });
          }}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            px: { xs: 1, sm: 2 },
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: { xs: '0.8125rem', sm: '0.9rem' }, py: 1.5, minWidth: 'auto', px: { xs: 1.5, sm: 2 } },
          }}
        >
          <Tab label="1. Báo Cáo Tiến Độ Công Trình" icon={<BarChart3 size={17} />} iconPosition="start" />
          <Tab label="2. Báo Cáo Chi Tiết Công Việc" icon={<CheckCircle2 size={17} />} iconPosition="start" />
          <Tab label="3. Báo Cáo Công Việc Quá Hạn" icon={<AlertTriangle size={17} />} iconPosition="start" />
          <Tab label="4. Báo Cáo Tải Công Nhân Sự" icon={<Users size={17} />} iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', bgcolor: '#ffffff' }}>
            {activeTab === 0 && (
              <ProjectProgressReport
                data={projectReport}
                page={page}
                rowsPerPage={rowsPerPage}
                loading={isCurrentTabLoading}
                onViewTasks={handleViewTasksFromProject}
              />
            )}
            {activeTab === 1 && (
              <TaskDetailReport
                data={taskReport}
                page={page}
                rowsPerPage={rowsPerPage}
                loading={isCurrentTabLoading}
                onSelectTask={handleSelectTask}
              />
            )}
            {activeTab === 2 && (
              <OverdueReport
                data={overdueReport}
                page={page}
                rowsPerPage={rowsPerPage}
                loading={isCurrentTabLoading}
                onSelectTask={handleSelectTask}
              />
            )}
            {activeTab === 3 && (
              <WorkloadReport
                data={workloadReport}
                page={page}
                rowsPerPage={rowsPerPage}
                loading={isCurrentTabLoading}
                onSelectUser={handleSelectUser}
              />
            )}

            <CommonPagination
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={currentCount}
              onPageChange={(newPage) => {
                setPage(newPage);
                setParam('page', newPage > 0 ? newPage + 1 : null);
              }}
              onRowsPerPageChange={(newRowsPerPage) => {
                setRowsPerPage(newRowsPerPage);
                setPage(0);
                setParam('page', null);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Box>
        </Box>
      </Paper>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask || null}
        onClose={handleCloseTaskDrawer}
        comments={comments}
        dependencies={dependencies}
        loadingComments={loadingComments}
        onAddComment={handleAddComment}
      />
    </Box>
  );
};
