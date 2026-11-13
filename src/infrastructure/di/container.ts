import { HttpAuthRepository } from '../repositories/http-auth.repository';
import { HttpListingRepository } from '../repositories/http-listing.repository';
import { HttpLandlordRoomRepository } from '../repositories/http-landlord-room.repository';
import { HttpAppointmentRepository } from '../repositories/http-appointment.repository';
import { HttpKycRepository } from '../repositories/http-kyc.repository';
import { HttpFaceVerificationRepository } from '../repositories/http-face-verification.repository';
import { HttpBookmarkRepository } from '../repositories/http-bookmark.repository';
import { ProfileUseCases } from '@/application/use-cases/profile/profile.use-cases';
import { LandlordKycUseCases } from '@/application/use-cases/kyc/landlord-kyc.use-cases';
import { KycModerationUseCases } from '@/application/use-cases/kyc/kyc-moderation.use-cases';
import { FaceVerificationUseCases } from '@/application/use-cases/kyc/face-verification.use-cases';
import { HttpAdminRepository } from '../repositories/http-admin.repository';
import { StaticSupportRepository } from '../static/StaticSupportRepository';
import { StaticMaintenanceRepository } from '../static/StaticMaintenanceRepository';
import { StaticDisputeRepository } from '../static/StaticDisputeRepository';
import { HttpTransactionRepository } from '../repositories/http-transaction.repository';
import { HttpRentalRequestRepository } from '../repositories/http-rental-request.repository';
import { HttpContractRepository } from '../repositories/http-contract.repository';
import { HttpBillingRepository } from '../repositories/http-billing.repository';
import { HttpOwnershipKycRepository } from '../repositories/http-ownership-kyc.repository';
import { HttpNotificationRepository } from '../repositories/http-notification.repository';
import { StaticBadgeRepository } from '../static/StaticBadgeRepository';
import { LoginUseCase } from '@/application/use-cases/auth/login.use-case';
import { RegisterUseCase } from '@/application/use-cases/auth/register.use-case';
import { GoogleAuthUseCase } from '@/application/use-cases/auth/google-auth.use-case';
import { GetProfileUseCase } from '@/application/use-cases/auth/get-profile.use-case';
import { GetRoomsUseCase } from '@/application/use-cases/listing/get-rooms.use-case';
import { GetRoomDetailUseCase } from '@/application/use-cases/listing/get-room-detail.use-case';
import { GetLocationsUseCase } from '@/application/use-cases/listing/get-locations.use-case';

// Singleton Repository Instances
const authRepository = new HttpAuthRepository();
const listingRepository = new HttpListingRepository();
const landlordRoomRepository = new HttpLandlordRoomRepository();
const appointmentRepository = new HttpAppointmentRepository();
const kycRepository = new HttpKycRepository();
const faceVerificationRepository = new HttpFaceVerificationRepository();
const faceVerificationUseCases = new FaceVerificationUseCases(faceVerificationRepository);
const bookmarkRepository = new HttpBookmarkRepository();
const adminRepository = new HttpAdminRepository();
const supportRepository = new StaticSupportRepository();
const maintenanceRepository = new StaticMaintenanceRepository();
const disputeRepository = new StaticDisputeRepository();
const transactionRepository = new HttpTransactionRepository();
const rentalRequestRepository = new HttpRentalRequestRepository();
const contractRepository = new HttpContractRepository();
const billingRepository = new HttpBillingRepository();
const ownershipKycRepository = new HttpOwnershipKycRepository();
const notificationRepository = new HttpNotificationRepository();
const badgeRepository = new StaticBadgeRepository(
  notificationRepository,
  kycRepository
);

// Use Cases & Repositories Container
export const container = {
  auth: {
    loginUseCase: new LoginUseCase(authRepository),
    registerUseCase: new RegisterUseCase(authRepository),
    googleAuthUseCase: new GoogleAuthUseCase(authRepository),
    getProfileUseCase: new GetProfileUseCase(authRepository),
    authRepository,
  },
  profile: {
    profileUseCases: new ProfileUseCases(authRepository),
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
    kycRepository,
    landlordKycUseCases: new LandlordKycUseCases(kycRepository),
  },
  kyc: {
    kycRepository,
    landlordKycUseCases: new LandlordKycUseCases(kycRepository),
    kycModerationUseCases: new KycModerationUseCases(kycRepository),
    faceVerificationRepository,
    faceVerificationUseCases,
  },
  appointment: {
    appointmentRepository,
  },
  bookmark: {
    bookmarkRepository,
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
  rentalRequest: {
    rentalRequestRepository,
  },
  contract: {
    contractRepository,
  },
  billing: {
    billingRepository,
  },
  ownershipKyc: {
    ownershipKycRepository,
  },
  notification: {
    notificationRepository,
  },
  badge: {
    badgeRepository,
  },
};
