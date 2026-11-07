import { BadgeRepository, DashboardBadges } from '@/domain/repositories/BadgeRepository';
import { AdminRepository } from '@/domain/repositories/AdminRepository';
import { SupportRepository } from '@/domain/repositories/SupportRepository';
import { MaintenanceRepository } from '@/domain/repositories/MaintenanceRepository';
import { DisputeRepository } from '@/domain/repositories/DisputeRepository';
import { Dispute } from '@/domain/entities/Dispute';
import { MaintenanceRequest } from '@/domain/entities/MaintenanceRequest';

export class StaticBadgeRepository implements BadgeRepository {
  constructor(
    private adminRepo: AdminRepository,
    private supportRepo: SupportRepository,
    private maintenanceRepo: MaintenanceRepository,
    private disputeRepo: DisputeRepository
  ) {}

  async getBadges(role?: string, userId?: string): Promise<DashboardBadges> {
    const [rooms, kycList, reports, tickets, maintenanceList, disputes] = await Promise.all([
      this.adminRepo.getPendingRooms(),
      this.adminRepo.getPendingKyc(),
      this.adminRepo.getReports(),
      this.supportRepo.getTickets({ status: 'OPEN' }),
      this.maintenanceRepo.getRequests(),
      this.disputeRepo.getDisputes(),
    ]);

    const pendingReports = reports.filter((r) => r.status === 'PENDING').length;
    const pendingDisputes = disputes.filter((d: Dispute) => d.status === 'PENDING' || d.status === 'MEDIATING').length;
    const pendingMaintenance = maintenanceList.filter((m: MaintenanceRequest) => m.status === 'PENDING' || m.status === 'IN_PROGRESS').length;

    return {
      adminPendingRooms: rooms.length,
      adminPendingKyc: kycList.length,
      adminPendingReports: pendingReports,
      adminPendingDisputes: pendingDisputes,
      adminPendingSupport: tickets.length,
      landlordRentalRequests: 2,
      landlordUnpaidInvoices: 3,
      landlordMaintenanceRequests: pendingMaintenance,
      landlordUnreadMessages: 4,
      tenantUnpaidInvoices: 1,
      tenantUnreadMessages: 2,
    };
  }
}
