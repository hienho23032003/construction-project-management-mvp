import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { taskApi, activityLogApi } from '../services/api/endpoints';
import { PaginationParams, TaskStatus } from '../types';
import { useToast } from '../contexts/ToastContext';

export const useTasksQuery = (
  params?: PaginationParams & {
    projectId?: string;
    assigneeId?: string;
    status?: string;
    priority?: string;
  }
) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const res = await taskApi.getAll(params);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải danh sách công việc');
      }
      return res.data.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};

export const useGanttDataQuery = (
  paramsOrProjectId?:
    | string
    | {
        projectId?: string;
        status?: string;
        activeOnly?: boolean;
        fromDate?: string;
        toDate?: string;
      }
) => {
  const normalizedParams =
    typeof paramsOrProjectId === 'string'
      ? { projectId: paramsOrProjectId }
      : paramsOrProjectId;

  return useQuery({
    queryKey: ['gantt-data', normalizedParams],
    queryFn: async () => {
      const res = await taskApi.getGanttData(normalizedParams);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải dữ liệu biểu đồ Gantt');
      }
      return res.data.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};

export const useTaskDetailQuery = (taskId?: string | null) => {
  return useQuery({
    queryKey: ['task-detail', taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const res = await taskApi.getById(taskId);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải thông tin công việc');
      }
      return res.data.data;
    },
    enabled: Boolean(taskId),
    staleTime: 0,
  });
};

export const useTaskCommentsQuery = (taskId?: string) => {
  return useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const res = await taskApi.getComments(taskId);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải bình luận');
      }
      return res.data.data;
    },
    enabled: Boolean(taskId),
    staleTime: 10_000,
    refetchInterval: 30_000, // 30s poll instead of 15s
  });
};

export const useTaskDependenciesQuery = (taskId?: string) => {
  return useQuery({
    queryKey: ['task-dependencies', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const res = await taskApi.getDependencies(taskId);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải liên kết phụ thuộc');
      }
      return res.data.data;
    },
    enabled: Boolean(taskId),
  });
};

export const useTaskActivitiesQuery = (taskId?: string) => {
  return useQuery({
    queryKey: ['task-activities', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const res = await activityLogApi.getLogs(undefined, taskId, 100);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải lịch sử biến động');
      }
      return res.data.data;
    },
    enabled: Boolean(taskId),
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: any) => taskApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-detail'] });
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] });
      queryClient.invalidateQueries({ queryKey: ['task-activities'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['project-task-tree'] });
      if (variables?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
        queryClient.invalidateQueries({ queryKey: ['project-task-tree', variables.projectId] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['users-workload'] });
      showSuccess('Tạo công việc mới thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Tạo công việc thất bại');
    },
  });
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => taskApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-detail'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['task-detail', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] });
      queryClient.invalidateQueries({ queryKey: ['task-activities'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['project-task-tree'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['users-workload'] });
      showSuccess('Cập nhật thông tin công việc thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Cập nhật công việc thất bại');
    },
  });
};

export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-detail'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['task-detail', variables.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] });
      queryClient.invalidateQueries({ queryKey: ['task-activities'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['project-task-tree'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Cập nhật trạng thái công việc thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Cập nhật trạng thái thất bại');
    },
  });
};

export const useUpdateTaskProgressMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      taskApi.updateProgress(id, progress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-detail'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['task-detail', variables.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] });
      queryClient.invalidateQueries({ queryKey: ['task-activities'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['project-task-tree'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Cập nhật tiến độ công việc thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Cập nhật tiến độ thất bại');
    },
  });
};

export const useUpdateTaskDatesMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, startDate, plannedEndDate }: { id: string; startDate: string; plannedEndDate: string }) =>
      taskApi.updateDates(id, startDate, plannedEndDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-detail'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['task-detail', variables.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] });
      queryClient.invalidateQueries({ queryKey: ['task-activities'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['project-task-tree'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Điều chỉnh hạn ngày công việc thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Cập nhật hạn ngày thất bại');
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-detail'] });
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] });
      queryClient.invalidateQueries({ queryKey: ['task-activities'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['project-task-tree'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Đã xóa công việc thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Xóa công việc thất bại');
    },
  });
};

export const useAddCommentMutation = (taskId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (param: string | { content: string; files?: File[] }) => {
      if (!taskId) throw new Error('Thiếu mã công việc');
      if (typeof param === 'string') {
        return taskApi.addComment(taskId, param);
      }
      return taskApi.addCommentWithAttachments(taskId, param.content, param.files);
    },
    onSuccess: () => {
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
        queryClient.invalidateQueries({ queryKey: ['task-activities', taskId] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
      queryClient.invalidateQueries({ queryKey: ['task-activities'] });
      showSuccess('Đã gửi trao đổi thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Gửi trao đổi thất bại');
    },
  });
};
