import React, { useState } from 'react';
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
  useDeleteTaskMutation,
  useGanttDataQuery,
  useTaskDetailQuery,
  useTaskCommentsQuery,
  useTaskDependenciesQuery,
  useAddCommentMutation,
} from '../hooks/useTasks';
import { useUsersListQuery } from '../hooks/useEmployees';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEditTask = user?.role === 'SuperAdmin' || user?.role === 'ProjectManager' || user?.role === 'Supervisor';

  const [activeTab, setActiveTab] = useState(0);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskTreeItem | null>(null);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [removeMemberUserId, setRemoveMemberUserId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Queries
  const { data: project, isLoading: isProjectLoading } = useProjectDetailQuery(id);
  const { data: users = [] } = useUsersListQuery();
  const { data: ganttData, isLoading: isGanttLoading } = useGanttDataQuery(id);
  const { data: selectedTask } = useTaskDetailQuery(selectedTaskId || undefined);
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

  // Mutations
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const updateStatusMutation = useUpdateTaskStatusMutation();
  const updateProgressMutation = useUpdateTaskProgressMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const addMemberMutation = useAddProjectMemberMutation(id);
  const removeMemberMutation = useRemoveProjectMemberMutation(id);

  const handleOpenCreateTask = (parentId?: string | null) => {
    setEditingTask(null);
    setParentTaskId(parentId || null);
    setOpenTaskModal(true);
  };

  const handleOpenEditTask = (task: TaskTreeItem) => {
    setEditingTask(task);
    setParentTaskId(task.parentId || null);
    setOpenTaskModal(true);
  };

  const handleSaveTask = async (formData: TaskFormData) => {
    if (!id) return;
    if (editingTask) {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        data: {
          ...formData,
          projectId: id,
          parentId: editingTask.parentId || null,
        },
      });
    } else {
      await createTaskMutation.mutateAsync({
        ...formData,
        projectId: id,
        parentId: parentTaskId || null,
      });
    }
    setOpenTaskModal(false);
    setEditingTask(null);
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

  if (isProjectLoading || !project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/projects')}
            sx={{ fontWeight: 600, color: '#475569', borderColor: '#cbd5e1' }}
          >
            Quay Lại
          </Button>
          <Chip label={project.code} sx={{ bgcolor: '#0284c7', color: '#ffffff', fontWeight: 800 }} />
          <Typography variant="h2" sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#0f172a' }}>
            {project.name}
          </Typography>
          <StatusChip status={project.status} isOverdue={project.isOverdue} />
        </Box>

        {canEditTask && (
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => handleOpenCreateTask()}
            sx={{ bgcolor: '#0284c7', fontWeight: 700 }}
          >
            Thêm Hạng Mục / Task Mới
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            borderBottom: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            px: 2,
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.9rem', py: 1.5 },
          }}
        >
          <Tab label="1. Tổng Quan" icon={<Layers size={17} />} iconPosition="start" />
          <Tab label={`2. Cây Công Việc (${project.tasks.length})`} icon={<FolderTree size={17} />} iconPosition="start" />
          <Tab label="3. Tiến Độ Gantt" icon={<BarChart3 size={17} />} iconPosition="start" />
          <Tab label={`4. Thành Viên (${project.members.length})`} icon={<Users size={17} />} iconPosition="start" />
          <Tab label="5. Nhật Ký Hoạt Động" icon={<Activity size={17} />} iconPosition="start" />
        </Tabs>

        {activeTab === 0 && <ProjectOverviewTab project={project} />}
        {activeTab === 1 && (
          <ProjectTaskTreeTab
            tasks={taskTree}
            canEditTask={canEditTask}
            onStatusChange={(taskId, status) => updateStatusMutation.mutate({ id: taskId, status })}
            onProgressChange={(taskId, progress) => updateProgressMutation.mutate({ id: taskId, progress })}
            onCreateSubTask={handleOpenCreateTask}
            onEditTask={handleOpenEditTask}
            onDeleteTask={(taskId) => setDeleteTaskId(taskId)}
            onOpenCreateModal={() => handleOpenCreateTask()}
          />
        )}
        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            {isGanttLoading ? (
              <GanttSkeleton />
            ) : (
              <InteractiveGantt
                tasks={ganttData?.tasks || []}
                links={ganttData?.links || []}
                canEdit={canEditTask}
                onTaskUpdated={refetchTasks}
              />
            )}
          </Box>
        )}
        {activeTab === 3 && (
          <ProjectMembersTab
            members={project.members}
            canEditTask={canEditTask}
            onOpenAddMember={() => setOpenMemberModal(true)}
            onRemoveMember={(userId) => setRemoveMemberUserId(userId)}
          />
        )}
        {activeTab === 4 && (
          <ProjectActivitiesTab
            activities={project.recentActivities}
            onSelectTask={(taskId) => setSelectedTaskId(taskId)}
          />
        )}
      </Paper>

      {/* Modals */}
      <TaskFormModal
        open={openTaskModal}
        onClose={() => {
          setOpenTaskModal(false);
          setEditingTask(null);
        }}
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
        onClose={() => setSelectedTaskId(null)}
        comments={comments}
        dependencies={dependencies}
        loadingComments={loadingComments}
        onAddComment={async (content: string) => {
          await addCommentMutation.mutateAsync(content);
        }}
      />
    </Box>
  );
};
