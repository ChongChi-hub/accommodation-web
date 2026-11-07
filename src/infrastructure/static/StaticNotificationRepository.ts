import { NotificationRepository } from '@/domain/repositories/NotificationRepository';
import { Notification } from '@/domain/entities/Notification';

export class StaticNotificationRepository implements NotificationRepository {
  private notifications: Notification[] = [
    {
      id: 'notif-1',
      title: 'Có 3 phòng mới chờ duyệt',
      message: 'Chủ trọ Nguyễn Văn An vừa gửi tin đăng phòng trọ Quận Cầu Giấy cần kiểm duyệt.',
      type: 'WARNING',
      link: '/dashboard/admin/rooms',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    },
    {
      id: 'notif-2',
      title: 'Yêu cầu định danh eKYC mới',
      message: 'Người dùng Trần Minh vừa tải lên CCCD gắn chip chờ thẩm định.',
      type: 'INFO',
      link: '/dashboard/admin/kyc',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: 'notif-3',
      title: 'Hóa đơn tiền phòng tháng 11',
      message: 'Hóa đơn tiền thuê phòng P.302 trị giá 4.250.000đ đã được phát hành.',
      type: 'SUCCESS',
      link: '/dashboard/tenant/invoices',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
      id: 'notif-4',
      title: 'Báo cáo vi phạm #RP-104 đã xử lý',
      message: 'Báo cáo phòng ảo tại Quận 10 đã được ban kiểm duyệt giải quyết và gỡ bỏ bài đăng.',
      type: 'ALERT',
      link: '/dashboard/admin/reports',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: 'notif-5',
      title: 'Hợp đồng thuê phòng đã ký thành công',
      message: 'Bên thuê đã xác nhận ký số hợp đồng điện tử căn hộ mini Bạch Đằng.',
      type: 'SUCCESS',
      link: '/dashboard/landlord/contracts',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
  ];

  async getNotifications(userId?: string): Promise<Notification[]> {
    return [...this.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async markAsRead(id: string): Promise<void> {
    const item = this.notifications.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
    }
  }

  async markAllAsRead(userId?: string): Promise<void> {
    this.notifications.forEach((n) => {
      n.isRead = true;
    });
  }

  async getUnreadCount(userId?: string): Promise<number> {
    return this.notifications.filter((n) => !n.isRead).length;
  }
}

