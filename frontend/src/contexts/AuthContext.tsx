import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authApi, sessionApi } from '../services/api/endpoints';
import { API_BASE_URL } from '../services/api/apiClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  sessionId: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isManager: boolean;
  isSupervisor: boolean;
  canEditProject: boolean;
  canEditTask: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem('sessionId'));
  const [permissions, setPermissions] = useState<string[]>(() => {
    const saved = localStorage.getItem('permissions');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedSessionId = localStorage.getItem('sessionId');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data.success && res.data.data) {
            const userData = res.data.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            if (userData.permissions && userData.permissions.length > 0) {
              setPermissions(userData.permissions);
              localStorage.setItem('permissions', JSON.stringify(userData.permissions));
            }

            // Immediately ping server to mark user as Active online
            if (savedSessionId) {
              sessionApi.ping(savedSessionId).catch((err) => {
                console.warn('Session ping error on startup:', err);
              });
            }
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Setup periodic Heartbeat (every 30 seconds) and pagehide beacon when user is active
  useEffect(() => {
    const currentSessionId = sessionId || localStorage.getItem('sessionId');
    if (!token || !user || !currentSessionId) return;

    // 1. Initial and recurring Heartbeat ping
    const sendPing = () => {
      const sId = sessionId || localStorage.getItem('sessionId');
      if (sId && localStorage.getItem('token')) {
        sessionApi.ping(sId).catch(() => {});
      }
    };

    sendPing();
    const interval = setInterval(sendPing, 30000);

    // 2. Handle tab close / browser exit with sendBeacon (without logging out token)
    const handleLeave = () => {
      const sId = sessionId || localStorage.getItem('sessionId');
      if (sId && localStorage.getItem('token')) {
        const url = `${API_BASE_URL}/user-sessions/leave`;
        const payload = JSON.stringify({ sessionId: sId });
        const blob = new Blob([payload], { type: 'application/json' });

        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, blob);
        } else {
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      }
    };

    window.addEventListener('pagehide', handleLeave);
    window.addEventListener('beforeunload', handleLeave);

    return () => {
      clearInterval(interval);
      window.removeEventListener('pagehide', handleLeave);
      window.removeEventListener('beforeunload', handleLeave);
    };
  }, [token, user, sessionId]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await authApi.login({ email, password });
      if (res.data.success && res.data.data) {
        const { token: jwtToken, user: userData, sessionId: sId, permissions: userPerms } = res.data.data;
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));

        if (sId) {
          setSessionId(sId);
          localStorage.setItem('sessionId', sId);
        }

        const perms = userPerms || userData.permissions || [];
        setPermissions(perms);
        localStorage.setItem('permissions', JSON.stringify(perms));

        return { success: true };
      }
      return { success: false, message: res.data.message || 'Đăng nhập không thành công.' };
    } catch (err: any) {
      console.error('Login error:', err);
      const apiMessage =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.join(', ') : undefined) ||
        err.message ||
        'Đã xảy ra lỗi khi đăng nhập.';
      return { success: false, message: apiMessage };
    }
  };

  const logout = async () => {
    const activeSessionId = sessionId || localStorage.getItem('sessionId');
    try {
      if (activeSessionId) {
        await authApi.logout(activeSessionId);
      }
    } catch (e) {
      console.error('Error closing session:', e);
    } finally {
      setUser(null);
      setToken(null);
      setSessionId(null);
      setPermissions([]);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('permissions');
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const role: UserRole = user?.role ?? 'Employee';
  const isAdmin = role === 'SuperAdmin' || (user?.roles?.includes('SuperAdmin') ?? false);
  const isManager = isAdmin || role === 'ProjectManager' || (user?.roles?.includes('ProjectManager') ?? false);
  const isSupervisor = isManager || role === 'Supervisor' || (user?.roles?.includes('Supervisor') ?? false);
  const canEditProject = isManager;
  const canEditTask = isSupervisor;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        sessionId,
        permissions,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
        isAdmin,
        isManager,
        isSupervisor,
        canEditProject,
        canEditTask,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
