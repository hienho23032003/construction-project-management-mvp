import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  ArrowLeft,
  Plus,
  Users,
  Layers,
  BarChart3,
  Activity,
  FolderTree,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../services/api/endpoints';
import { TaskStatus, TaskTreeItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAppSearchParams } from '../hooks/useAppSearchParams';
import { StatusChip } from '../components/common/StatusChip';
import { InteractiveGantt } from '../components/gantt/InteractiveGantt';
import { GanttSkeleton } from '../components/common/GanttSkeleton';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ProjectOverviewTab } from '../components/projects/ProjectOverviewTab';
import { ProjectTaskTreeTab } from '../components/projects/ProjectTaskTreeTab';
import { ProjectMembersTab } from '../components/projects/ProjectMembersTab';
import { ProjectActivitiesTab } from '../components/projects/ProjectActivitiesTab';
import { ProjectMemberModal, ProjectMemberFormData } from '../components/projects/ProjectMemberModal';
import { TaskFormModal, TaskFormData } from '../components/tasks/TaskFormModal';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import {
  useProjectDetailQuery,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
} from '../hooks/useProjects';
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskProgressMutation,
  useUpdateTaskPriorityMutation,
  useUpdateTaskDatesMutation,
  useDeleteTaskMutation,
  useGanttDataQuery,
  useTaskDetailQuery,
  useTaskCommentsQuery,
  useTaskDependenciesQuery,
  useAddCommentMutation,
} from '../hooks/useTasks';
import { useUsersListQuery } from '../hooks/useEmployees';
import { usePresenceHeartbeat } from '../hooks/usePresence';
import { ProjectPresenceAvatars } from '../components/presence/ProjectPresenceAvatars';

import { usePermission } from '../hooks/usePermission';
import { PERMISSIONS } from '../constants/permissions';

const TAB_NAME_MAP: Record<string, number> = {
  overview: 0,
  tasks: 1,
  gantt: 2,
  members: 3,
  activities: 4,
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
};

const TAB_INDEX_MAP: Record<number, string> = {
  0: 'overview',
  1: 'tasks',
  2: 'gantt',
  3: 'members',
  4: 'activities',
};

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getParam, getBooleanParam, setParam, setParams, removeParams } = useAppSearchParams();
  const { can, isSuperAdmin } = usePermission();

  const canCreateTask = isSuperAdmin || can(PERMISSIONS.TASKS_CREATE);
  const canEditTask = isSuperAdmin || can(PERMISSIONS.TASKS_EDIT);
  const canDeleteTask = isSuperAdmin || can(PERMISSIONS.TASKS_DELETE);
  const canUpdateStatus = isSuperAdmin || can(PERMISSIONS.TASKS_UPDATE_STATUS);
  const canUpdateProgress = isSuperAdmin || can(PERMISSIONS.TASKS_UPDATE_PROGRESS);
  const canManageMembers = isSuperAdmin || can(PERMISSIONS.PROJECTS_MANAGE_MEMBERS);

  const tabParam = getParam('tab');
  const taskIdParam = getParam('taskId');
  const editTaskIdParam = getParam('editTaskId');
  const createTaskParam = getBooleanParam('createTask');
  const parentIdParam = getParam('parentId');

  const resolvedInitialTab = tabParam && TAB_NAME_MAP[tabParam.toLowerCase()] !== undefined
    ? TAB_NAME_MAP[tabParam.toLowerCase()]
    : 0;

  const [activeTab, setActiveTab] = useState(resolvedInitialTab);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskTreeItem | null>(null);
  const [parentTaskId, setParentTaskId] = useState<string | null>(parentIdParam || null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [removeMemberUserId, setRemoveMemberUserId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(taskIdParam || null);

  // Queries
  const { data: project, isLoading: isProjectLoading } = useProjectDetailQuery(id);
  const { data: users = [] } = useUsersListQuery();
  const { data: ganttData, isLoading: isGanttLoading } = useGanttDataQuery(id);
  const { data: selectedTask } = useTaskDetailQuery(selectedTaskId || undefined);
  const { data: taskToEditFromUrl } = useTaskDetailQuery(editTaskIdParam || undefined);
  const { data: comments = [], isLoading: loadingComments } = useTaskCommentsQuery(selectedTaskId || undefined);
  const { data: dependencies = [] } = useTaskDependenciesQuery(selectedTaskId || undefined);
  const addCommentMutation = useAddCommentMutation(selectedTaskId || undefined);

  const { data: taskTree = [], refetch: refetchTasks } = useQuery<TaskTreeItem[]>({
    queryKey: ['project-task-tree', id],
    queryFn: async () => {
      if (!id) return [];
      const res = await projectApi.getTasks(id);
      return res.data.success && res.data.data ? res.data.data : [];
    },
    enabled: Boolean(id),
  });

  // Sync tab with URL parameter
  useEffect(() => {
    if (tabParam && TAB_NAME_MAP[tabParam.toLowerCase()] !== undefined) {
      setActiveTab(TAB_NAME_MAP[tabParam.toLowerCase()]);
    }
  }, [tabParam]);

  // Sync taskId with URL parameter
  useEffect(() => {
    if (taskIdParam && taskIdParam !== selectedTaskId) {
      setSelectedTaskId(taskIdParam);
    }
  }, [taskIdParam, selectedTaskId]);

  // Sync editTaskId or createTask with URL parameter
  useEffect(() => {
    if (editTaskIdParam) {
      if (taskToEditFromUrl) {
        setEditingTask(taskToEditFromUrl as unknown as TaskTreeItem);
        setParentTaskId(taskToEditFromUrl.parentId || null);
        setOpenTaskModal(true);
      }
    } else if (createTaskParam) {
      setEditingTask(null);
      setParentTaskId(parentIdParam || null);
      setOpenTaskModal(true);
    }
  }, [editTaskIdParam, createTaskParam, parentIdParam, taskToEditFromUrl]);

  // Mutations
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const updateStatusMutation = useUpdateTaskStatusMutation();
  const updateProgressMutation = useUpdateTaskProgressMutation();
  const updatePriorityMutation = useUpdateTaskPriorityMutation();
  const updateDatesMutation = useUpdateTaskDatesMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const addMemberMutation = useAddProjectMemberMutation(id);
  const removeMemberMutation = useRemoveProjectMemberMutation(id);

  const handleTabChange = (_: any, newTab: number) => {
    setActiveTab(newTab);
    setParam('tab', TAB_INDEX_MAP[newTab] || 'overview');
  };

  const handleOpenCreateTask = (parentId?: string | null) => {
    setEditingTask(null);
    setParentTaskId(parentId || null);
    setOpenTaskModal(true);
    setParams({
      createTask: 'true',
      parentId: parentId || null,
      editTaskId: null,
    });
  };

  const handleOpenEditTask = (task: TaskTreeItem) => {
    setEditingTask(task);
    setParentTaskId(task.parentId || null);
    setOpenTaskModal(true);
    setParams({
      editTaskId: task.id,
      createTask: null,
      parentId: null,
    });
  };

  const handleCloseTaskModal = () => {
    setOpenTaskModal(false);
    setEditingTask(null);
    setParentTaskId(null);
    removeParams('editTaskId', 'createTask', 'parentId');
  };

  const handleSelectTask = (taskId: string | null) => {
    setSelectedTaskId(taskId);
    if (taskId) {
      setParam('taskId', taskId);
    } else {
      removeParams('taskId', 'taskTab');
    }
  };

  const handleSaveTask = async (formData: TaskFormData) => {
    if (!id) return;
    const cleanActualEndDate = formData.actualEndDate && formData.actualEndDate.trim() !== '' ? formData.actualEndDate : undefined;
    if (editingTask) {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        data: {
          ...formData,
          actualEndDate: cleanActualEndDate,
          projectId: id,
          parentId: editingTask.parentId || null,
        },
      });
    } else {
      await createTaskMutation.mutateAsync({
        ...formData,
        actualEndDate: cleanActualEndDate,
        projectId: id,
        parentId: parentTaskId || null,
      });
    }
    handleCloseTaskModal();
    refetchTasks();
  };

  const handleSaveMember = async (data: ProjectMemberFormData) => {
    await addMemberMutation.mutateAsync(data);
    setOpenMemberModal(false);
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    await deleteTaskMutation.mutateAsync(deleteTaskId);
    setDeleteTaskId(null);
    refetchTasks();
  };

  const handleConfirmRemoveMember = async () => {
    if (!removeMemberUserId) return;
    await removeMemberMutation.mutateAsync(removeMemberUserId);
    setRemoveMemberUserId(null);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/projects');
    }
  };

  usePresenceHeartbeat({
    projectId: id,
    enabled: Boolean(id),
  });

  if (isProjectLoading || !project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 }, width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 1.5,
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowLeft size={16} />}
            onClick={handleBack}
            sx={{ fontWeight: 600, color: 'text.secondary', borderColor: 'divider', flexShrink: 0 }}
          >
            Quay Lại
          </Button>
          <Chip label={project.code} sx={{ bgcolor: '#0284c7', color: '#ffffff', fontWeight: 800, flexShrink: 0 }} />
          <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.3rem' }, color: 'text.primary', lineHeight: 1.3 }}>
            {project.name}
          </Typography>
          <StatusChip status={project.status} isOverdue={project.isOverdue} />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'space-between', sm: 'flex-start', md: 'flex-end' },
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <ProjectPresenceAvatars projectId={id} />
          {canCreateTask && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={() => handleOpenCreateTask()}
              sx={{
                bgcolor: '#0284c7',
                fontWeight: 700,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                whiteSpace: 'nowrap',
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 0.85 },
                flexShrink: 0,
              }}
            >
              Thêm Hạng Mục / Task Mới
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', bgcolor: 'background.paper', overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#242526' : '#f8fafc',
            px: { xs: 1, sm: 1.5 },
            minHeight: 40,
            '& .MuiTabs-flexContainer': {
              minHeight: 40,
            },
            '& .MuiTab-root': {
              fontWeight: 700,
              textTransform: 'none',
              fontSize: { xs: '0.78rem', sm: '0.84rem' },
              py: 0.75,
              minHeight: 40,
              minWidth: 'auto',
              px: { xs: 1.25, sm: 1.75 },
              gap: 0.75,
            },
          }}
        >
          <Tab label="1. Tổng Quan" icon={<Layers size={15} />} iconPosition="start" />
          <Tab label={`2. Cây Công Việc (${project.tasks.length})`} icon={<FolderTree size={15} />} iconPosition="start" />
          <Tab label="3. Tiến Độ Gantt" icon={<BarChart3 size={15} />} iconPosition="start" />
          <Tab label={`4. Thành Viên (${project.members.length})`} icon={<Users size={15} />} iconPosition="start" />
          <Tab label="5. Nhật Ký Hoạt Động" icon={<Activity size={15} />} iconPosition="start" />
        </Tabs>

        {activeTab === 0 && <ProjectOverviewTab project={project} />}
        {activeTab === 1 && (
          <ProjectTaskTreeTab
            tasks={taskTree}
            canCreateTask={canCreateTask}
            canEditTask={canEditTask}
            canDeleteTask={canDeleteTask}
            canUpdateStatus={canUpdateStatus}
            canUpdateProgress={canUpdateProgress}
            canUpdatePriority={canEditTask || canUpdateStatus}
            onTaskNameChange={(taskId, name) => updateTaskMutation.mutate({ id: taskId, data: { name } })}
            onStatusChange={(taskId, status) => updateStatusMutation.mutate({ id: taskId, status })}
            onProgressChange={(taskId, progress) => updateProgressMutation.mutate({ id: taskId, progress })}
            onPriorityChange={(taskId, priority) => updatePriorityMutation.mutate({ id: taskId, priority })}
            onAssigneesChange={(taskId, assigneeUserIds) => updateTaskMutation.mutate({ id: taskId, data: { assigneeUserIds } })}
            onDatesChange={(taskId, startDate, plannedEndDate) => updateDatesMutation.mutate({ id: taskId, startDate, plannedEndDate })}
            onCreateSubTask={handleOpenCreateTask}
            onEditTask={handleOpenEditTask}
            onDeleteTask={(taskId) => setDeleteTaskId(taskId)}
            onOpenCreateModal={() => handleOpenCreateTask()}
          />
        )}
        {activeTab === 2 && (
          <Box
            sx={{
              p: { xs: 1, sm: 1.5 },
              height: {
                xs: 'calc(100vh - 270px)',
                sm: 'calc(100vh - 240px)',
                md: 'calc(100vh - 215px)',
              },
              minHeight: 520,
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {isGanttLoading ? (
              <GanttSkeleton />
            ) : (
              <Box sx={{ flexGrow: 1, minHeight: 0, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <InteractiveGantt
                  tasks={ganttData?.tasks || []}
                  links={ganttData?.links || []}
                  canEdit={false}
                  onTaskClick={(task) => handleSelectTask(task.realTaskId || task.id)}
                  onTaskUpdated={refetchTasks}
                />
              </Box>
            )}
          </Box>
        )}
        {activeTab === 3 && (
          <ProjectMembersTab
            members={project.members}
            canManageMembers={canManageMembers}
            onOpenAddMember={() => setOpenMemberModal(true)}
            onRemoveMember={(userId) => setRemoveMemberUserId(userId)}
          />
        )}
        {activeTab === 4 && (
          <ProjectActivitiesTab
            projectId={project.id}
            activities={project.recentActivities}
            onSelectTask={(taskId) => handleSelectTask(taskId)}
          />
        )}
      </Paper>

      {/* Modals */}
      <TaskFormModal
        open={openTaskModal}
        onClose={handleCloseTaskModal}
        onSubmit={handleSaveTask}
        editingTask={editingTask}
        parentTaskId={parentTaskId}
        projectId={id}
        users={users}
        isSubmitting={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      <ProjectMemberModal
        open={openMemberModal}
        onClose={() => setOpenMemberModal(false)}
        onSubmit={handleSaveMember}
        users={users}
        isSubmitting={addMemberMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleteTaskId)}
        title="Xác Nhận Xóa Công Việc"
        message="Hành động này sẽ xóa công việc và các công việc con bên dưới nó. Bạn có chắc chắn muốn xóa?"
        confirmText="Xóa Công Việc"
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteTaskId(null)}
      />

      <ConfirmDialog
        open={Boolean(removeMemberUserId)}
        title="Xác Nhận Xóa Thành Viên"
        message="Bạn có chắc chắn muốn xóa nhân sự này khỏi ban quản lý dự án?"
        confirmText="Xác Nhận Xóa"
        onConfirm={handleConfirmRemoveMember}
        onCancel={() => setRemoveMemberUserId(null)}
      />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask || null}
        onClose={() => handleSelectTask(null)}
        comments={comments}
        dependencies={dependencies}
        loadingComments={loadingComments}
        onAddComment={async (content: string, files?: File[]) => {
          await addCommentMutation.mutateAsync({ content, files });
        }}
      />
    </Box>
  );
};
