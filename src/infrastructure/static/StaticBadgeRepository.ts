import { BadgeRepository, DashboardBadges } from '@/domain/repositories/BadgeRepository';
import { KycRepository } from '@/domain/repositories/KycRepository';
import { NotificationRepository } from '@/domain/repositories/NotificationRepository';

export class StaticBadgeRepository implements BadgeRepository {
  constructor(
    private notificationRepo: NotificationRepository,
    private kycRepo?: KycRepository
  ) {}

  async getBadges(role?: string, userId?: string): Promise<DashboardBadges> {
    let unreadMessages = 0;
    try {
      unreadMessages = this.notificationRepo.getUnreadMessageCount
        ? await this.notificationRepo.getUnreadMessageCount(userId)
        : 0;
    } catch {
      unreadMessages = 0;
    }

    let adminPendingKyc = 0;
    if ((role === 'admin' || role === 'moderator') && this.kycRepo) {
      try {
        const res = await this.kycRepo.getModerationKycList({ status: 'PENDING', page: 0, size: 1 });
        adminPendingKyc = res.total || 0;
      } catch {
        adminPendingKyc = 0;
      }
    }

    return {
      adminPendingRooms: 0,
      adminPendingKyc,
      adminPendingReports: 0,
      adminPendingDisputes: 0,
      adminPendingSupport: 0,
      landlordRentalRequests: 0,
      landlordUnpaidInvoices: 0,
      landlordMaintenanceRequests: 0,
      landlordUnreadMessages: role === 'landlord' ? unreadMessages : 0,
      tenantUnpaidInvoices: 0,
      tenantUnreadMessages: role === 'tenant' ? unreadMessages : 0,
    };
  }
}
