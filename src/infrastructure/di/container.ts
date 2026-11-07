import { HttpAuthRepository } from '../repositories/http-auth.repository';
import { LoginUseCase } from '@/application/use-cases/auth/login.use-case';
import { RegisterUseCase } from '@/application/use-cases/auth/register.use-case';
import { GetProfileUseCase } from '@/application/use-cases/auth/get-profile.use-case';

// Singleton Repository Instances
const authRepository = new HttpAuthRepository();

// Use Cases
export const container = {
  auth: {
    loginUseCase: new LoginUseCase(authRepository),
    registerUseCase: new RegisterUseCase(authRepository),
    getProfileUseCase: new GetProfileUseCase(authRepository),
    authRepository,
  },
};

