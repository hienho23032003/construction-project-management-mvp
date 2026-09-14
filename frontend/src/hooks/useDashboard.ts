import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api/endpoints';

export const useDashboardQuery = (params?: { fromDate?: string; toDate?: string }) => {
  return useQuery({
    queryKey: ['dashboard', params],
    queryFn: async () => {
      const res = await dashboardApi.getSummary(params);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải dữ liệu Dashboard');
      }
      return res.data.data;
    },
  });
};
