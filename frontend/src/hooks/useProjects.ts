import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../services/api/endpoints';
import { PaginationParams } from '../types';
import { useToast } from '../contexts/ToastContext';

export const useProjectsQuery = (params?: PaginationParams & { status?: string }) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const res = await projectApi.getAll(params);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải danh sách dự án');
      }
      return res.data.data;
    },
  });
};

export const useProjectsListQuery = () => {
  return useQuery({
    queryKey: ['projects-list'],
    queryFn: async () => {
      const res = await projectApi.getAllList();
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải danh mục dự án');
      }
      return res.data.data;
    },
  });
};

export const useProjectDetailQuery = (id?: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await projectApi.getById(id);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải thông tin dự án');
      }
      return res.data.data;
    },
    enabled: Boolean(id),
  });
};

export const useProjectMembersQuery = (projectId?: string) => {
  return useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await projectApi.getMembers(projectId);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải danh sách thành viên dự án');
      }
      return res.data.data;
    },
    enabled: Boolean(projectId),
  });
};

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: any) => projectApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Tạo công trình / dự án mới thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Tạo dự án thất bại');
    },
  });
};

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => projectApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Cập nhật thông tin dự án thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Cập nhật dự án thất bại');
    },
  });
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => projectApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Đã xóa dự án thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Xóa dự án thất bại');
    },
  });
};

export const useAddProjectMemberMutation = (projectId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: { userId: string; roleInProject?: string }) => {
      if (!projectId) throw new Error('Thiếu mã dự án');
      return projectApi.addMember(projectId, data);
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      }
      showSuccess('Thêm nhân sự vào ban quản lý dự án thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Thêm thành viên thất bại');
    },
  });
};

export const useRemoveProjectMemberMutation = (projectId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (userId: string) => {
      if (!projectId) throw new Error('Thiếu mã dự án');
      return projectApi.removeMember(projectId, userId);
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      }
      showSuccess('Đã xóa nhân sự khỏi dự án!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Xóa thành viên thất bại');
    },
  });
};
