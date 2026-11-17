import { BadgeRepository, DashboardBadges } from '@/domain/repositories/BadgeRepository';
import { KycRepository } from '@/domain/repositories/KycRepository';
import { NotificationRepository } from '@/domain/repositories/NotificationRepository';
import { AdminRepository } from '@/domain/repositories/AdminRepository';

export class StaticBadgeRepository implements BadgeRepository {
  constructor(
    private notificationRepo: NotificationRepository,
    private kycRepo?: KycRepository,
    private adminRepo?: AdminRepository,
    private rentalRequestRepo?: { getLandlordRequests?: () => Promise<any[]> },
    private billingRepo?: {
      getLandlordInvoices?: (filters?: any) => Promise<any[]>;
      getTenantInvoices?: (filters?: any) => Promise<any[]>;
    }
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
    let adminPendingRooms = 0;
    let adminPendingReports = 0;

    if (role === 'admin' || role === 'moderator') {
      if (this.kycRepo) {
        try {
          const res = await this.kycRepo.getModerationKycList({ status: 'PENDING', page: 0, size: 1 });
          adminPendingKyc = res.total || 0;
        } catch {
          adminPendingKyc = 0;
        }
      }

      if (this.adminRepo) {
        try {
          const [rooms, reports] = await Promise.all([
            this.adminRepo.getPendingRooms().catch(() => []),
            this.adminRepo.getReports().catch(() => []),
          ]);
          adminPendingRooms = (rooms || []).filter(
            (r: any) => (r.status === 'PENDING' || r.status === 'PENDING_REVIEW') && r.status !== 'REJECTED'
          ).length;
          adminPendingReports = (reports || []).filter(
            (rp: any) => (rp.status === 'PENDING' || rp.status === 'PENDING_REVIEW') && rp.status !== 'RESOLVED'
          ).length;
        } catch {
          adminPendingRooms = 0;
          adminPendingReports = 0;
        }
      }
    }

    let landlordRentalRequests = 0;
    let landlordUnpaidInvoices = 0;

    if (role === 'landlord') {
      if (this.rentalRequestRepo?.getLandlordRequests) {
        try {
          const reqs = await this.rentalRequestRepo.getLandlordRequests();
          landlordRentalRequests = (reqs || []).filter((rq: any) => rq.status === 'PENDING').length;
        } catch {
          landlordRentalRequests = 0;
        }
      }

      if (this.billingRepo?.getLandlordInvoices) {
        try {
          const invs = await this.billingRepo.getLandlordInvoices({ status: 'UNPAID' });
          landlordUnpaidInvoices = (invs || []).length;
        } catch {
          landlordUnpaidInvoices = 0;
        }
      }
    }

    let tenantUnpaidInvoices = 0;
    if (role === 'tenant') {
      if (this.billingRepo?.getTenantInvoices) {
        try {
          const invs = await this.billingRepo.getTenantInvoices({ status: 'UNPAID' });
          tenantUnpaidInvoices = (invs || []).length;
        } catch {
          tenantUnpaidInvoices = 0;
        }
      }
    }

    return {
      adminPendingRooms,
      adminPendingKyc,
      adminPendingReports,
      adminPendingDisputes: 0,
      adminPendingSupport: 0,
      landlordRentalRequests,
      landlordUnpaidInvoices,
      landlordMaintenanceRequests: 0,
      landlordUnreadMessages: role === 'landlord' ? unreadMessages : 0,
      tenantUnpaidInvoices,
      tenantUnreadMessages: role === 'tenant' ? unreadMessages : 0,
    };
  }
}
