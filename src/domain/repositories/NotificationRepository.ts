import { Notification } from '../entities/Notification';

export interface NotificationRepository {
  getNotifications(userId?: string, limit?: number): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId?: string): Promise<void>;
  getUnreadCount(userId?: string): Promise<number>;
  getUnreadMessageCount?(userId?: string): Promise<number>;
}
