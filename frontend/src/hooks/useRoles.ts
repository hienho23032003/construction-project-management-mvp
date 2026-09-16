import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi } from '../services/api/endpoints';
import { useToast } from '../contexts/ToastContext';

export const useRolesQuery = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await roleApi.getAll();
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải danh sách vai trò');
      }
      return res.data.data;
    },
  });
};

export const useRoleQuery = (id?: string) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await roleApi.getById(id);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải chi tiết vai trò');
      }
      return res.data.data;
    },
    enabled: !!id,
  });
};

export const usePermissionsMatrixQuery = () => {
  return useQuery({
    queryKey: ['permissions-matrix'],
    queryFn: async () => {
      const res = await roleApi.getPermissionsMatrix();
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải ma trận quyền');
      }
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyPermissionsQuery = () => {
  return useQuery({
    queryKey: ['my-permissions'],
    queryFn: async () => {
      const res = await roleApi.getMyPermissions();
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải quyền người dùng');
      }
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: { name: string; code: string; description?: string; color?: string; permissions: string[] }) =>
      roleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['my-permissions'] });
      showSuccess('Tạo vai trò & phân quyền thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Tạo vai trò thất bại');
    },
  });
};

export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; code?: string; description?: string; color?: string; permissions: string[] } }) =>
      roleApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['my-permissions'] });
      showSuccess('Cập nhật vai trò & ma trận quyền thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Cập nhật vai trò thất bại');
    },
  });
};

export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => roleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showSuccess('Xóa vai trò thành công!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.message || 'Xóa vai trò thất bại');
    },
  });
};
