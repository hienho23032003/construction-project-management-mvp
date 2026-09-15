import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../services/api/endpoints';
import { PaginationParams } from '../types';
import { useToast } from '../contexts/ToastContext';

export const useUsersQuery = (params?: PaginationParams & { role?: string; department?: string }) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const res = await userApi.getAll(params);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải danh sách nhân viên');
      }
      return res.data.data;
    },
  });
};

export const useUsersListQuery = () => {
  return useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await userApi.getAllList();
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải danh sách nhân sự');
      }
      return res.data.data;
    },
  });
};

export const useUserWorkloadQuery = () => {
  return useQuery({
    queryKey: ['users-workload'],
    queryFn: async () => {
      const res = await userApi.getWorkload();
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải dữ liệu khối lượng công việc');
      }
      return res.data.data;
    },
  });
};

export const useUserProgressQuery = (userId?: string) => {
  return useQuery({
    queryKey: ['users-progress', userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await userApi.getProgressSummary(userId);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải thông tin tiến độ nhân viên');
      }
      return res.data.data;
    },
    enabled: !!userId,
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: any) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['users-workload'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Tạo tài khoản nhân sự mới thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Tạo nhân sự thất bại');
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['users-workload'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Cập nhật thông tin nhân sự thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Cập nhật thông tin thất bại');
    },
  });
};

export const useToggleUserStatusMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => userApi.toggleStatus(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['users-workload'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess(res.data.message || 'Thay đổi trạng thái nhân sự thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Thay đổi trạng thái thất bại');
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['users-workload'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Đã xóa tài khoản nhân sự thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Xóa nhân sự thất bại');
    },
  });
};

export const useResetUserPasswordMutation = () => {
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      userApi.resetPassword(id, newPassword),
    onSuccess: (res) => {
      showSuccess(res.data.message || 'Đặt lại mật khẩu thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Đặt lại mật khẩu thất bại');
    },
  });
};

