import { AuthRepository } from '@/domain/repositories/AuthRepository';
import { User } from '@/domain/entities/User';

export class GetProfileUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<User> {
    return this.authRepository.getProfile();
  }
}

