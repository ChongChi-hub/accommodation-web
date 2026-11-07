import { AuthRepository, AuthSession } from '@/domain/repositories/AuthRepository';
import { RegisterRequestDto } from '@/application/dto/auth.dto';

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(dto: RegisterRequestDto): Promise<AuthSession> {
    if (!dto.email || !dto.phone || !dto.password || !dto.fullName) {
      throw new Error('Vui lòng điền đầy đủ các trường thông tin bắt buộc');
    }
    return this.authRepository.register(dto);
  }
}

