import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationItem } from '../types';
import { notificationApi } from '../services/api/endpoints';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  totalCount: number;
  hasMore: boolean;
  loadingMore: boolean;
  fetchNotifications: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationApi.getMyNotifications({ pageIndex: 1, pageSize: 15 });
      if (res.data.success && res.data.data) {
        setNotifications(res.data.data.items);
        setTotalCount(res.data.data.totalCount);
        setPageIndex(1);
        setHasMore(res.data.data.items.length < res.data.data.totalCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const loadMore = async () => {
    if (!isAuthenticated || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = pageIndex + 1;
      const res = await notificationApi.getMyNotifications({ pageIndex: nextPage, pageSize: 15 });
      if (res.data.success && res.data.data) {
        const newItems = res.data.data.items;
        setNotifications((prev) => [...prev, ...newItems]);
        setPageIndex(nextPage);
        setTotalCount(res.data.data.totalCount);
        setHasMore(notifications.length + newItems.length < res.data.data.totalCount);
      }
    } catch (err) {
      console.error('Failed to load more notifications:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // 30s poll
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        totalCount,
        hasMore,
        loadingMore,
        fetchNotifications,
        loadMore,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
