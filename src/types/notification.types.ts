export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'assignment' | 'deadline' | 'certification' | 'expense' | 'system';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  projectUpdates: boolean;
  assignmentAlerts: boolean;
  expenseAlerts: boolean;
  certReminders: boolean;
  systemNotices: boolean;
}
