import { NotificationRepository } from '@/domain/repositories/NotificationRepository';
import { Notification } from '@/domain/entities/Notification';

export class StaticNotificationRepository implements NotificationRepository {
  private landlordNotifications: Notification[] = [
    {
      id: 'notif-ll-1',
      title: 'Bạn có 1 lịch hẹn xem phòng mới',
      message: 'Khách thuê Lê Hữu Nhật Hảo vừa đặt lịch hẹn xem phòng "Phòng trọ cao cấp ngõ 82 Duy Tân" vào lúc 09:00 ngày 20/11/2026.',
      type: 'INFO',
      link: '/dashboard/landlord/appointments',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: 'notif-ll-2',
      title: 'Bạn có 1 yêu cầu thuê phòng mới từ Lê Hữu Nhật Hảo',
      message: 'Khách thuê đã gửi hồ sơ đề nghị thuê phòng "Studio gác lửng thông minh ngõ 165 Cầu Giấy". Vui lòng kiểm tra và duyệt yêu cầu.',
      type: 'INFO',
      link: '/dashboard/landlord/rental-requests',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 'notif-ll-3',
      title: 'Hợp đồng thuê phòng đã ký kết thành công',
      message: 'Khách thuê Lê Hữu Nhật Hảo đã hoàn tất ký số hợp đồng điện tử mã HD-2026-101.',
      type: 'SUCCESS',
      link: '/dashboard/landlord/contracts',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'notif-ll-4',
      title: 'Đã nhận thanh toán tiền phòng tháng 11',
      message: 'Bạn đã nhận được 4.500.000 đ tiền thuê phòng tháng 11 từ khách thuê Lê Hữu Nhật Hảo.',
      type: 'SUCCESS',
      link: '/dashboard/landlord/finance',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ];

  private tenantNotifications: Notification[] = [
    {
      id: 'notif-tn-1',
      title: 'Lịch hẹn xem phòng đã được xác nhận',
      message: 'Chủ trọ Đoàn Gia Huy đã xác nhận lịch hẹn xem phòng ngõ 82 Duy Tân lúc 09:00 ngày 20/11/2026.',
      type: 'SUCCESS',
      link: '/dashboard/tenant/appointments',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: 'notif-tn-2',
      title: 'Yêu cầu thuê phòng của bạn đã được chấp thuận',
      message: 'Chủ trọ Đoàn Gia Huy đã duyệt yêu cầu thuê phòng của bạn. Vui lòng tiến hành đặt cọc để giữ chỗ phòng trọ.',
      type: 'SUCCESS',
      link: '/dashboard/tenant/rental-requests',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'notif-tn-3',
      title: 'Bạn có hợp đồng thuê phòng mới cần ký số',
      message: 'Chủ trọ đã khởi tạo hợp đồng thuê phòng HD-2026-101. Vui lòng kiểm tra các điều khoản và ký hợp đồng điện tử.',
      type: 'INFO',
      link: '/dashboard/tenant/contracts',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
    {
      id: 'notif-tn-4',
      title: 'Hóa đơn tiền phòng kỳ tháng 11/2026',
      message: 'Hóa đơn tiền thuê phòng kỳ tháng 11 trị giá 4.500.000 đ đã được phát hành. Hạn thanh toán đến ngày 05/12/2026.',
      type: 'WARNING',
      link: '/dashboard/tenant/invoices',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];

  private adminNotifications: Notification[] = [
    {
      id: 'notif-ad-1',
      title: 'Có phòng mới chờ duyệt',
      message: 'Chủ trọ Đoàn Gia Huy vừa gửi tin đăng phòng trọ Phường Dịch Vọng Hậu cần kiểm duyệt.',
      type: 'WARNING',
      link: '/dashboard/admin/rooms',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: 'notif-ad-2',
      title: 'Báo cáo vi phạm mới cần xử lý',
      message: 'Có báo cáo vi phạm phòng trọ #104 chờ ban quản trị kiểm tra và giải quyết.',
      type: 'ALERT',
      link: '/dashboard/admin/reports',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ];

  private getPool(userId?: string): Notification[] {
    const id = (userId || '').toLowerCase();
    if (id.includes('huy') || id.includes('landlord')) {
      return this.landlordNotifications;
    }
    if (id.includes('admin') || id.includes('mod')) {
      return this.adminNotifications;
    }
    return this.tenantNotifications;
  }

  async getNotifications(userId?: string): Promise<Notification[]> {
    return [...this.getPool(userId)].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async markAsRead(id: string): Promise<void> {
    const all = [...this.landlordNotifications, ...this.tenantNotifications, ...this.adminNotifications];
    const item = all.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
    }
  }

  async markAllAsRead(userId?: string): Promise<void> {
    this.getPool(userId).forEach((n) => {
      n.isRead = true;
    });
  }

  async deleteNotification(id: string): Promise<void> {
    this.landlordNotifications = this.landlordNotifications.filter((n) => n.id !== id);
    this.tenantNotifications = this.tenantNotifications.filter((n) => n.id !== id);
    this.adminNotifications = this.adminNotifications.filter((n) => n.id !== id);
  }

  async deleteAllNotifications(userId?: string): Promise<void> {
    const pool = this.getPool(userId);
    pool.length = 0;
  }

  async getUnreadCount(userId?: string): Promise<number> {
    return this.getPool(userId).filter((n) => !n.isRead).length;
  }
}
