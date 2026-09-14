import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../services/api/endpoints';

export const useProjectProgressReportQuery = (filter: any) => {
  return useQuery({
    queryKey: ['report-project-progress', filter],
    queryFn: async () => {
      const res = await reportApi.getProjectProgress(filter);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải báo cáo tiến độ');
      }
      return res.data.data;
    },
  });
};

export const useTaskReportQuery = (filter: any) => {
  return useQuery({
    queryKey: ['report-tasks', filter],
    queryFn: async () => {
      const res = await reportApi.getTasks(filter);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải báo cáo công việc');
      }
      return res.data.data;
    },
  });
};

export const useOverdueReportQuery = (filter: any) => {
  return useQuery({
    queryKey: ['report-overdue', filter],
    queryFn: async () => {
      const res = await reportApi.getOverdue(filter);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải báo cáo quá hạn');
      }
      return res.data.data;
    },
  });
};

export const useWorkloadReportQuery = (filter: any) => {
  return useQuery({
    queryKey: ['report-workload', filter],
    queryFn: async () => {
      const res = await reportApi.getWorkload(filter);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Không thể tải báo cáo tải công việc');
      }
      return res.data.data;
    },
  });
};
