import apiClient, { API_BASE_URL } from './apiClient';
import {
  ApiResponse,
  PaginationParams,
  PagedResult,
  User,
  Project,
  ProjectMember,
  TaskItem,
  TaskTreeItem,
  GanttData,
  DashboardSummary,
  NotificationItem,
  ActivityLog,
  TaskComment,
  TaskDependency,
  RoleItem,
  PermissionModuleGroup,
  UserLoginSession,
  LoginSessionStats,
  UserPresence,
  ProjectPresence,
  PresenceHeartbeatRequest,
} from '../../types';

export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<{ token: string; user: User; expiresAt: string; sessionId?: string; permissions?: string[] }>>('/auth/login', data),
  logout: (sessionId?: string) => apiClient.post<ApiResponse<boolean>>('/auth/logout', { sessionId }),
  getMe: () => apiClient.get<ApiResponse<User>>('/auth/me'),
  updateProfile: (data: { fullName: string; phone?: string; department?: string; avatarUrl?: string }) =>
    apiClient.put<ApiResponse<User>>('/auth/profile', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ApiResponse<User>>('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post<ApiResponse<boolean>>('/auth/change-password', data),
};

export const roleApi = {
  getAll: () => apiClient.get<ApiResponse<RoleItem[]>>('/roles'),
  getById: (id: string) => apiClient.get<ApiResponse<RoleItem>>(`/roles/${id}`),
  create: (data: { name: string; code: string; description?: string; permissions: string[] }) =>
    apiClient.post<ApiResponse<RoleItem>>('/roles', data),
  update: (id: string, data: { name: string; code?: string; description?: string; permissions: string[] }) =>
    apiClient.put<ApiResponse<RoleItem>>(`/roles/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse<boolean>>(`/roles/${id}`),
  getPermissionsMatrix: () => apiClient.get<ApiResponse<PermissionModuleGroup[]>>('/roles/permissions-matrix'),
  getMyPermissions: () => apiClient.get<ApiResponse<string[]>>('/roles/my-permissions'),
};

export const sessionApi = {
  getHistory: (params?: PaginationParams & { userId?: string; status?: string; fromDate?: string; toDate?: string }) =>
    apiClient.get<ApiResponse<PagedResult<UserLoginSession>>>('/user-sessions/history', { params }),
  getStats: (params?: { fromDate?: string; toDate?: string }) =>
    apiClient.get<ApiResponse<LoginSessionStats>>('/user-sessions/stats', { params }),
  ping: (sessionId: string) =>
    apiClient.post<ApiResponse<boolean>>('/user-sessions/ping', { sessionId }),
  leave: (sessionId: string) =>
    apiClient.post<ApiResponse<boolean>>('/user-sessions/leave', { sessionId }),
};

export const userApi = {
  getAll: (params?: PaginationParams & { role?: string; department?: string }) =>
    apiClient.get<ApiResponse<PagedResult<User>>>('/users', { params }),
  getAllList: () => apiClient.get<ApiResponse<User[]>>('/users/all'),
  getById: (id: string) => apiClient.get<ApiResponse<User>>(`/users/${id}`),
  getProgressSummary: (id: string) => apiClient.get<ApiResponse<any>>(`/users/${id}/progress-summary`),
  create: (data: any) => apiClient.post<ApiResponse<User>>('/users', data),
  update: (id: string, data: any) => apiClient.put<ApiResponse<User>>(`/users/${id}`, data),
  uploadAvatar: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ApiResponse<User>>(`/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => apiClient.delete<ApiResponse<boolean>>(`/users/${id}`),
  toggleStatus: (id: string) => apiClient.patch<ApiResponse<boolean>>(`/users/${id}/toggle-status`),
  resetPassword: (id: string, newPassword: string) =>
    apiClient.post<ApiResponse<boolean>>(`/users/${id}/reset-password`, { newPassword }),
  getWorkload: () => apiClient.get<ApiResponse<any[]>>('/users/workload'),
};

const sanitizeProjectPayload = (data: any) => {
  if (!data || typeof data !== 'object') return data;
  const clean = { ...data };
  if ('actualEndDate' in clean && (!clean.actualEndDate || String(clean.actualEndDate).trim() === '')) {
    delete clean.actualEndDate;
  }
  if ('managerId' in clean && (!clean.managerId || clean.managerId === 'null' || clean.managerId === 'undefined')) {
    clean.managerId = null;
  }
  return clean;
};

const sanitizeTaskPayload = (data: any) => {
  if (!data || typeof data !== 'object') return data;
  const clean = { ...data };
  if ('actualEndDate' in clean && (!clean.actualEndDate || String(clean.actualEndDate).trim() === '')) {
    delete clean.actualEndDate;
  }
  if ('parentId' in clean && (!clean.parentId || clean.parentId === 'null' || clean.parentId === 'undefined')) {
    clean.parentId = null;
  }
  if ('assigneeUserIds' in clean && (!clean.assigneeUserIds || clean.assigneeUserIds.length === 0)) {
    delete clean.assigneeUserIds;
  }
  if ('assigneeIds' in clean && (!clean.assigneeIds || clean.assigneeIds.length === 0)) {
    delete clean.assigneeIds;
  }
  return clean;
};

export const projectApi = {
  getAll: (params?: PaginationParams & { status?: string }) =>
    apiClient.get<ApiResponse<PagedResult<Project>>>('/projects', { params }),
  getAllList: () => apiClient.get<ApiResponse<Project[]>>('/projects/all'),
  getById: (id: string) => apiClient.get<ApiResponse<Project & { members: ProjectMember[]; tasks: TaskItem[]; recentActivities: ActivityLog[] }>>(`/projects/${id}`),
  create: (data: any) => apiClient.post<ApiResponse<Project>>('/projects', sanitizeProjectPayload(data)),
  update: (id: string, data: any) => apiClient.put<ApiResponse<Project>>(`/projects/${id}`, sanitizeProjectPayload(data)),
  delete: (id: string) => apiClient.delete<ApiResponse<boolean>>(`/projects/${id}`),
  getTasks: (id: string) => apiClient.get<ApiResponse<TaskTreeItem[]>>(`/projects/${id}/tasks`),
  getMembers: (id: string) => apiClient.get<ApiResponse<ProjectMember[]>>(`/projects/${id}/members`),
  addMember: (id: string, data: { userId: string; roleInProject?: string }) =>
    apiClient.post<ApiResponse<ProjectMember>>(`/projects/${id}/members`, data),
  removeMember: (id: string, userId: string) =>
    apiClient.delete<ApiResponse<boolean>>(`/projects/${id}/members/${userId}`),
};

export const taskApi = {
  getAll: (params?: PaginationParams & { projectId?: string; assigneeId?: string; status?: string; priority?: string }) =>
    apiClient.get<ApiResponse<PagedResult<TaskItem>>>('/tasks', { params }),
  getById: (id: string) => apiClient.get<ApiResponse<TaskItem>>(`/tasks/${id}`),
  create: (data: any) => apiClient.post<ApiResponse<TaskItem>>('/tasks', sanitizeTaskPayload(data)),
  update: (id: string, data: any) => apiClient.put<ApiResponse<TaskItem>>(`/tasks/${id}`, sanitizeTaskPayload(data)),
  delete: (id: string) => apiClient.delete<ApiResponse<boolean>>(`/tasks/${id}`),
  updateStatus: (id: string, status: string) =>
    apiClient.patch<ApiResponse<TaskItem>>(`/tasks/${id}/status`, { status }),
  updateProgress: (id: string, progress: number) =>
    apiClient.patch<ApiResponse<TaskItem>>(`/tasks/${id}/progress`, { progress }),
  updateDates: (id: string, startDate: string, plannedEndDate: string) =>
    apiClient.patch<ApiResponse<TaskItem>>(`/tasks/${id}/dates`, { startDate, plannedEndDate }),
  getGanttData: (params?: {
    projectId?: string;
    status?: string;
    activeOnly?: boolean;
    fromDate?: string;
    toDate?: string;
  }) => apiClient.get<ApiResponse<GanttData>>('/tasks/gantt', { params }),
  getComments: (taskId: string) => apiClient.get<ApiResponse<TaskComment[]>>(`/tasks/${taskId}/comments`),
  addComment: (taskId: string, content: string) =>
    apiClient.post<ApiResponse<TaskComment>>(`/tasks/${taskId}/comments`, { content }),
  addCommentWithAttachments: (taskId: string, content: string, files?: File[]) => {
    if (!files || files.length === 0) {
      return apiClient.post<ApiResponse<TaskComment>>(`/tasks/${taskId}/comments`, { content });
    }
    const formData = new FormData();
    formData.append('content', content || '');
    files.forEach((f) => formData.append('files', f));
    return apiClient.post<ApiResponse<TaskComment>>(`/tasks/${taskId}/comments-with-attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteComment: (commentId: string) =>
    apiClient.delete<ApiResponse<boolean>>(`/tasks/comments/${commentId}`),
  getDependencies: (taskId: string) => apiClient.get<ApiResponse<TaskDependency[]>>(`/tasks/${taskId}/dependencies`),
  addDependency: (data: { predecessorTaskId: string; successorTaskId: string; dependencyType: string }) =>
    apiClient.post<ApiResponse<TaskDependency>>('/tasks/dependencies', data),
  deleteDependency: (dependencyId: string) =>
    apiClient.delete<ApiResponse<boolean>>(`/tasks/dependencies/${dependencyId}`),
};

export const dashboardApi = {
  getSummary: (params?: { fromDate?: string; toDate?: string }) =>
    apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary', { params }),
};

export const reportApi = {
  getProjectProgress: (filter: any) => apiClient.get<ApiResponse<any[]>>('/reports/project-progress', { params: filter }),
  getTasks: (filter: any) => apiClient.get<ApiResponse<any[]>>('/reports/tasks', { params: filter }),
  getOverdue: (filter: any) => apiClient.get<ApiResponse<any[]>>('/reports/overdue', { params: filter }),
  getWorkload: (filter: any) => apiClient.get<ApiResponse<any[]>>('/reports/workload', { params: filter }),
  getExportUrl: (type: string, filter: any) => {
    const params = new URLSearchParams(filter).toString();
    return `${API_BASE_URL}/reports/export?type=${type}&${params}`;
  },
  downloadReportCsv: async (type: string, filter: any = {}, customFileName?: string) => {
    const response = await apiClient.get('/reports/export', {
      params: { type, ...filter },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
    const defaultName = `BaoCao_${type}_${dateStr}.csv`;
    link.setAttribute('download', customFileName || defaultName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const notificationApi = {
  getMyNotifications: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<PagedResult<NotificationItem>>>('/notifications', { params }),
  markAsRead: (id: string) => apiClient.patch<ApiResponse<boolean>>(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.post<ApiResponse<boolean>>('/notifications/read-all'),
};

export const activityLogApi = {
  getLogs: (projectId?: string, taskId?: string, limit = 50) =>
    apiClient.get<ApiResponse<ActivityLog[]>>('/activity-logs', { params: { projectId, taskId, limit } }),
};

export const presenceApi = {
  heartbeat: (data: PresenceHeartbeatRequest) =>
    apiClient.post<ApiResponse<boolean>>('/presence/heartbeat', data),
  clearEditingTask: () =>
    apiClient.post<ApiResponse<boolean>>('/presence/clear-task'),
  leave: () =>
    apiClient.post<ApiResponse<boolean>>('/presence/leave'),
  getProjectPresence: (projectId: string) =>
    apiClient.get<ApiResponse<ProjectPresence>>(`/presence/project/${projectId}`),
  getOnlineUsers: () =>
    apiClient.get<ApiResponse<UserPresence[]>>('/presence/online'),
};

