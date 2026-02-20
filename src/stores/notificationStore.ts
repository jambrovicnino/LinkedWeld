import { create } from 'zustand';
import type { Notification } from '@/types';
import api from '@/lib/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/notifications');
      set({ notifications: data.data ?? [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      set({ unreadCount: data.data?.count ?? 0 });
    } catch {}
  },

  markAsRead: async (id) => {
    await api.put(`/notifications/${id}/read`);
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    await api.put('/notifications/read-all');
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: async (id) => {
    await api.delete(`/notifications/${id}`);
    const wasUnread = get().notifications.find((n) => n.id === id && !n.isRead);
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
      unreadCount: wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
    }));
  },
}));
