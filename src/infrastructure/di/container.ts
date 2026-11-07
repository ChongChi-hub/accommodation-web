import { HttpAuthRepository } from '../repositories/http-auth.repository';
import { HttpListingRepository } from '../repositories/http-listing.repository';
import { LoginUseCase } from '@/application/use-cases/auth/login.use-case';
import { RegisterUseCase } from '@/application/use-cases/auth/register.use-case';
import { GetProfileUseCase } from '@/application/use-cases/auth/get-profile.use-case';
import { GetRoomsUseCase } from '@/application/use-cases/listing/get-rooms.use-case';
import { GetRoomDetailUseCase } from '@/application/use-cases/listing/get-room-detail.use-case';
import { GetLocationsUseCase } from '@/application/use-cases/listing/get-locations.use-case';

// Singleton Repository Instances
const authRepository = new HttpAuthRepository();
const listingRepository = new HttpListingRepository();

// Use Cases
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
};
