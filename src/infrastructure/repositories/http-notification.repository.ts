import { Notification } from '@/domain/entities/Notification';
import { NotificationRepository } from '@/domain/repositories/NotificationRepository';
import { ApiClient } from '../http/api-client';

interface RawNotificationDto {
  id: string;
  userId?: string;
  title: string;
  message?: string;
  content?: string;
  type: string;
  link?: string | null;
  linkUrl?: string | null;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
}

function mapNotificationType(raw: string): Notification['type'] {
  const upper = (raw || '').toUpperCase();
  if (upper.includes('ALERT') || upper.includes('REJECT') || upper.includes('CANCEL')) return 'ALERT';
  if (upper.includes('WARN') || upper.includes('INVOICE') || upper.includes('MAINT')) return 'WARNING';
  if (upper.includes('SUCCESS') || upper.includes('APPROV') || upper.includes('PAY') || upper.includes('CONFIRM')) {
    return 'SUCCESS';
  }
  return 'INFO';
}

export class HttpNotificationRepository implements NotificationRepository {
  async getNotifications(_userId?: string, limit = 20): Promise<Notification[]> {
    if (!ApiClient.getToken()) return [];
    const data = await ApiClient.get<RawNotificationDto[]>(`/notifications?limit=${limit}`);
    return (Array.isArray(data) ? data : []).map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      message: n.message ?? n.content ?? '',
      type: mapNotificationType(n.type),
      link: n.link ?? n.linkUrl ?? '',
      isRead: Boolean(n.isRead ?? n.read ?? false),
      createdAt: n.createdAt,
    }));
  }

  async markAsRead(id: string): Promise<void> {
    if (!ApiClient.getToken()) return;
    await ApiClient.patch(`/notifications/${encodeURIComponent(id)}/read`);
  }

  async markAllAsRead(_userId?: string): Promise<void> {
    if (!ApiClient.getToken()) return;
    await ApiClient.patch('/notifications/read-all');
  }

  async getUnreadCount(_userId?: string): Promise<number> {
    if (!ApiClient.getToken()) return 0;
    const res = await ApiClient.get<{ count: number }>('/notifications/unread-count');
    return typeof res?.count === 'number' ? res.count : 0;
  }

  async getUnreadMessageCount(_userId?: string): Promise<number> {
    if (!ApiClient.getToken()) return 0;
    const res = await ApiClient.get<{ count: number }>('/chat/unread-count');
    return typeof res?.count === 'number' ? res.count : 0;
  }
}

