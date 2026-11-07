import { AuthRepository, AuthSession } from '@/domain/repositories/AuthRepository';
import { LoginRequestDto } from '@/application/dto/auth.dto';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(dto: LoginRequestDto): Promise<AuthSession> {
    if (!dto.email || !dto.password) {
      throw new Error('Vui lòng nhập đầy đủ email và mật khẩu');
    }
    return this.authRepository.login(dto.email, dto.password);
  }
}

