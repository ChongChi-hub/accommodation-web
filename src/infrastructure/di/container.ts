import { HttpAuthRepository } from '../repositories/http-auth.repository';
import { HttpListingRepository } from '../repositories/http-listing.repository';
import { HttpLandlordRoomRepository } from '../repositories/http-landlord-room.repository';
import { HttpAppointmentRepository } from '../repositories/http-appointment.repository';
import { StaticAdminRepository } from '../static/StaticAdminRepository';
import { StaticSupportRepository } from '../static/StaticSupportRepository';
import { StaticMaintenanceRepository } from '../static/StaticMaintenanceRepository';
import { StaticDisputeRepository } from '../static/StaticDisputeRepository';
import { StaticTransactionRepository } from '../static/StaticTransactionRepository';
import { StaticNotificationRepository } from '../static/StaticNotificationRepository';
import { StaticBadgeRepository } from '../static/StaticBadgeRepository';
import { LoginUseCase } from '@/application/use-cases/auth/login.use-case';
import { RegisterUseCase } from '@/application/use-cases/auth/register.use-case';
import { GetProfileUseCase } from '@/application/use-cases/auth/get-profile.use-case';
import { GetRoomsUseCase } from '@/application/use-cases/listing/get-rooms.use-case';
import { GetRoomDetailUseCase } from '@/application/use-cases/listing/get-room-detail.use-case';
import { GetLocationsUseCase } from '@/application/use-cases/listing/get-locations.use-case';

// Singleton Repository Instances
const authRepository = new HttpAuthRepository();
const listingRepository = new HttpListingRepository();
const landlordRoomRepository = new HttpLandlordRoomRepository();
const appointmentRepository = new HttpAppointmentRepository();
const adminRepository = new StaticAdminRepository();
const supportRepository = new StaticSupportRepository();
const maintenanceRepository = new StaticMaintenanceRepository();
const disputeRepository = new StaticDisputeRepository();
const transactionRepository = new StaticTransactionRepository();
const notificationRepository = new StaticNotificationRepository();
const badgeRepository = new StaticBadgeRepository(
  adminRepository,
  supportRepository,
  maintenanceRepository,
  disputeRepository
);

// Use Cases & Repositories Container
export const container = {
  auth: {
    loginUseCase: new LoginUseCase(authRepository),
    registerUseCase: new RegisterUseCase(authRepository),
    getProfileUseCase: new GetProfileUseCase(authRepository),
    authRepository,
  },
  listing: {
    getRoomsUseCase: new GetRoomsUseCase(listingRepository),
    getRoomDetailUseCase: new GetRoomDetailUseCase(listingRepository),
    getLocationsUseCase: new GetLocationsUseCase(listingRepository),
    listingRepository,
  },
  landlord: {
    landlordRoomRepository,
    appointmentRepository,
  },
  appointment: {
    appointmentRepository,
  },
  admin: {
    adminRepository,
  },
  support: {
    supportRepository,
  },
  maintenance: {
    maintenanceRepository,
  },
  dispute: {
    disputeRepository,
  },
  transaction: {
    transactionRepository,
  },
  notification: {
    notificationRepository,
  },
  badge: {
    badgeRepository,
  },
};
