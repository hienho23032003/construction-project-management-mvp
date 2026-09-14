import { useQuery } from '@tanstack/react-query';
import { sessionApi } from '../services/api/endpoints';
import { PaginationParams } from '../types';

export const useLoginHistoryQuery = (
  params?: PaginationParams & {
    userId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }
) => {
  return useQuery({
    queryKey: ['login-history', params],
    queryFn: async () => {
      const res = await sessionApi.getHistory(params);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải lịch sử đăng nhập');
      }
      return res.data.data;
    },
    refetchInterval: 30000, // auto refresh every 30s for live session tracking
  });
};

export const useSessionStatsQuery = (params?: { fromDate?: string; toDate?: string }) => {
  return useQuery({
    queryKey: ['session-stats', params],
    queryFn: async () => {
      const res = await sessionApi.getStats(params);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải thống kê phiên');
      }
      return res.data.data;
    },
    refetchInterval: 30000,
  });
};
