import React, { useState, useMemo } from 'react';
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
import { ProjectProgressReport } from '../components/reports/ProjectProgressReport';
import { TaskDetailReport } from '../components/reports/TaskDetailReport';
import { OverdueReport } from '../components/reports/OverdueReport';
import { WorkloadReport } from '../components/reports/WorkloadReport';
import { TableSkeleton } from '../components/common/TableSkeleton';
import { CommonPagination } from '../components/common/CommonPagination';
import { useToast } from '../contexts/ToastContext';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter options queries
  const { data: projects = [] } = useProjectsListQuery();
  const { data: users = [] } = useUsersListQuery();

  // Active filter payload
  const filter = useMemo(
    () => ({
      projectId: selectedProjectId || undefined,
      userId: selectedUserId || undefined,
    }),
    [selectedProjectId, selectedUserId]
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
      const type =
        activeTab === 0 ? 'projects' : activeTab === 1 ? 'tasks' : activeTab === 2 ? 'overdue' : 'workload';
      const exportFilter: any = {};
      if (selectedProjectId) exportFilter.projectId = selectedProjectId;
      if (selectedUserId) exportFilter.userId = selectedUserId;

      await reportApi.downloadReportCsv(type, exportFilter);
      showSuccess('Xuất file báo cáo Excel/CSV thành công!');
    } catch (err) {
      console.error('Export error:', err);
      showError('Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử lại.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0f172a' }}>
            Trung Tâm Báo Cáo & Xuất Dữ Liệu
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25 }}>
            Báo cáo tổng hợp tiến độ, phân tích trễ hạn và khối lượng thực hiện
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Download size={18} />}
          onClick={handleExportCsv}
          disabled={exporting}
          sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 700 }}
        >
          {exporting ? 'Đang xuất dữ liệu...' : 'Xuất Báo Cáo Excel / CSV'}
        </Button>
      </Box>

      {/* Filter Toolbar */}
      <Paper sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Autocomplete
          size="small"
          sx={{ minWidth: 260 }}
          options={[{ id: '', code: 'ALL', name: 'Tất cả dự án' }, ...projects]}
          getOptionLabel={(p) => (p.id ? `${p.code} - ${p.name}` : p.name)}
          value={projects.find((p) => p.id === selectedProjectId) || { id: '', code: 'ALL', name: 'Tất cả dự án' }}
          onChange={(_, val) => {
            setSelectedProjectId(val?.id || '');
            setPage(0);
          }}
          renderInput={(params) => <TextField {...params} label="Lọc Theo Dự Án" />}
        />

        <Autocomplete
          size="small"
          sx={{ minWidth: 260 }}
          options={[{ id: '', fullName: 'Tất cả nhân sự', department: '' }, ...users]}
          getOptionLabel={(u) => (u.id ? `${u.fullName} (${u.department || 'Chưa phân ban'})` : u.fullName)}
          value={users.find((u) => u.id === selectedUserId) || { id: '', fullName: 'Tất cả nhân sự', department: '' }}
          onChange={(_, val) => {
            setSelectedUserId(val?.id || '');
            setPage(0);
          }}
          renderInput={(params) => <TextField {...params} label="Lọc Theo Nhân Sự" />}
        />
      </Paper>

      {/* Tab Navigation & Report Table */}
      <Paper sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            setPage(0);
          }}
          sx={{
            borderBottom: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            px: 2,
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.9rem', py: 1.5 },
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
              />
            )}
            {activeTab === 1 && (
              <TaskDetailReport
                data={taskReport}
                page={page}
                rowsPerPage={rowsPerPage}
                loading={isCurrentTabLoading}
              />
            )}
            {activeTab === 2 && (
              <OverdueReport
                data={overdueReport}
                page={page}
                rowsPerPage={rowsPerPage}
                loading={isCurrentTabLoading}
              />
            )}
            {activeTab === 3 && (
              <WorkloadReport
                data={workloadReport}
                page={page}
                rowsPerPage={rowsPerPage}
                loading={isCurrentTabLoading}
              />
            )}

            <CommonPagination
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={currentCount}
              onPageChange={(newPage) => setPage(newPage)}
              onRowsPerPageChange={(newRowsPerPage) => {
                setRowsPerPage(newRowsPerPage);
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
