import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { presenceApi } from '../services/api/endpoints';
import { useAuth } from '../contexts/AuthContext';

export const PRESENCE_KEYS = {
  all: ['presence'] as const,
  project: (projectId?: string) => [...PRESENCE_KEYS.all, 'project', projectId] as const,
  online: () => [...PRESENCE_KEYS.all, 'online'] as const,
};

export const useProjectPresenceQuery = (projectId?: string) => {
  return useQuery({
    queryKey: PRESENCE_KEYS.project(projectId),
    queryFn: async () => {
      if (!projectId) return null;
      const res = await presenceApi.getProjectPresence(projectId);
      return res.data.data;
    },
    enabled: Boolean(projectId),
    refetchInterval: 8000, // Poll every 8 seconds
    staleTime: 4000,
  });
};

export const useOnlineUsersQuery = () => {
  return useQuery({
    queryKey: PRESENCE_KEYS.online(),
    queryFn: async () => {
      const res = await presenceApi.getOnlineUsers();
      return res.data.data || [];
    },
    refetchInterval: 15000,
    staleTime: 8000,
  });
};

interface PresenceHeartbeatOptions {
  projectId?: string;
  taskId?: string;
  taskName?: string;
  isEditing?: boolean;
  enabled?: boolean;
}

export const usePresenceHeartbeat = ({
  projectId,
  taskId,
  taskName,
  isEditing = false,
  enabled = true,
}: PresenceHeartbeatOptions) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !enabled) return;

    const sendHeartbeat = () => {
      presenceApi
        .heartbeat({
          projectId,
          taskId,
          taskName,
          isEditing,
          avatarUrl: user?.avatarUrl,
        })
        .catch(() => {});
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Repeat every 10 seconds
    const interval = setInterval(sendHeartbeat, 10000);

    return () => {
      clearInterval(interval);
      if (isEditing) {
        presenceApi.clearEditingTask().catch(() => {});
      }
    };
  }, [user, projectId, taskId, taskName, isEditing, enabled]);
};
