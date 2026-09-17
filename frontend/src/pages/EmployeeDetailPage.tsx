import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  ArrowLeft,
  FolderKanban,
  ListTodo,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { usePermission } from '../hooks/usePermission';
import { PERMISSIONS } from '../constants/permissions';
import { useUserProgressQuery, useResetUserPasswordMutation } from '../hooks/useEmployees';
import {
  useTaskDetailQuery,
  useTaskCommentsQuery,
  useTaskDependenciesQuery,
  useAddCommentMutation,
} from '../hooks/useTasks';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import { ResetPasswordModal } from '../components/employees/ResetPasswordModal';
import { EmployeeHeader } from '../components/employees/detail/EmployeeHeader';
import { EmployeeStatsCards } from '../components/employees/detail/EmployeeStatsCards';
import { EmployeeTasksTab } from '../components/employees/detail/EmployeeTasksTab';
import { EmployeeProjectsTab } from '../components/employees/detail/EmployeeProjectsTab';
import { EmployeeActivitiesTab } from '../components/employees/detail/EmployeeActivitiesTab';
import { EmployeeTaskItem, EmployeeProjectParticipation, EmployeeActivityLog } from '../types';

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can, isSuperAdmin } = usePermission();
  const canResetPassword = isSuperAdmin || can(PERMISSIONS.EMPLOYEES_RESET_PASSWORD);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [openResetPassword, setOpenResetPassword] = useState(false);

  // Queries & Mutations
  const { data: progressData, isLoading, error } = useUserProgressQuery(id);
  const { data: taskDetail } = useTaskDetailQuery(selectedTaskId);
  const { data: taskComments = [], isLoading: isLoadingComments } = useTaskCommentsQuery(selectedTaskId || undefined);
  const { data: taskDependencies = [] } = useTaskDependenciesQuery(selectedTaskId || undefined);
  const addCommentMutation = useAddCommentMutation(selectedTaskId || undefined);
  const resetPasswordMutation = useResetUserPasswordMutation();

  const user = progressData?.user;
  const stats = progressData?.stats;
  const projects: EmployeeProjectParticipation[] = progressData?.projects || [];
  const tasks: EmployeeTaskItem[] = progressData?.tasks || [];
  const activities: EmployeeActivityLog[] = progressData?.recentActivities || [];

  const handleResetPassword = async (userId: string, newPassword: string) => {
    await resetPasswordMutation.mutateAsync({ id: userId, newPassword });
    setOpenResetPassword(false);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/employees');
    }
  };

  const handleAddComment = async (content: string, files?: File[]) => {
    if (selectedTaskId) {
      await addCommentMutation.mutateAsync({ content, files });
    }
  };

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
        <Button variant="outlined" startIcon={<ArrowLeft size={18} />} onClick={handleBack}>
          Quay lại
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
          onClick={handleBack}
          sx={{ color: 'text.secondary', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
        >
          Quay Lại
        </Button>
        <ChevronRight size={16} color="#7b7b7b" />
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 700 }}>
          Hồ Sơ & Tiến Độ: {user.fullName}
        </Typography>
      </Box>

      {/* Employee Profile Banner */}
      <EmployeeHeader
        user={user}
        canResetPassword={canResetPassword}
        onOpenResetPassword={() => setOpenResetPassword(true)}
      />

      {/* KPI Stats Cards */}
      <EmployeeStatsCards stats={stats} projects={projects} />

      {/* Tabs Layout */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: { xs: 1, sm: 2 } }}>
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
          {activeTab === 0 && (
            <EmployeeTasksTab
              tasks={tasks}
              projects={projects}
              onSelectTask={(taskId) => setSelectedTaskId(taskId)}
            />
          )}

          {activeTab === 1 && <EmployeeProjectsTab projects={projects} />}

          {activeTab === 2 && <EmployeeActivitiesTab activities={activities} />}
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

      {/* Reset Password Modal */}
      <ResetPasswordModal
        open={openResetPassword}
        onClose={() => setOpenResetPassword(false)}
        onSubmit={handleResetPassword}
        user={user || null}
        isSubmitting={resetPasswordMutation.isPending}
      />
    </Box>
  );
};
