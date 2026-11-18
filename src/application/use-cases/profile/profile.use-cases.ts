import { AuthRepository } from '@/domain/repositories/AuthRepository';
import { UserProfile, UpdateUserProfileDto } from '@/domain/entities/UserProfile';

export class ProfileUseCases {
  constructor(private readonly authRepo: AuthRepository) {}

  async getProfile(): Promise<UserProfile> {
    return this.authRepo.getUserProfile();
  }

  async updateProfile(dto: UpdateUserProfileDto): Promise<UserProfile> {
    if (!dto.fullName || !dto.fullName.trim()) {
      throw new Error('Họ và tên không được để trống');
    }
    if (!dto.phone || !/^(0|\+84)[0-9]{9,10}$/.test(dto.phone.trim())) {
      throw new Error('Số điện thoại không hợp lệ');
    }
    return this.authRepo.updateUserProfile(dto);
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    if (!file) throw new Error('Vui lòng chọn tập tin hình ảnh');
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Dung lượng ảnh đại diện không được vượt quá 5MB');
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Chỉ chấp nhận định dạng JPG, PNG hoặc WebP');
    }
    return this.authRepo.uploadAvatar(file);
  }

  async deleteAvatar(): Promise<void> {
    return this.authRepo.deleteAvatar();
  }

  async sendChangePasswordOtp(): Promise<void> {
    if (this.authRepo.sendChangePasswordOtp) {
      return this.authRepo.sendChangePasswordOtp();
    }
  }

  async changePassword(current: string, next: string, confirmNext: string, otp?: string): Promise<void> {
    if (!current) throw new Error('Vui lòng nhập mật khẩu hiện tại');
    if (!next || next.length < 8) {
      throw new Error('Mật khẩu mới phải có ít nhất 8 ký tự');
    }
    if (next !== confirmNext) {
      throw new Error('Mật khẩu xác nhận không khớp');
    }
    if (otp !== undefined && otp !== null) {
      if (otp.trim().length !== 6) {
        throw new Error('Vui lòng nhập mã OTP xác thực gồm 6 chữ số gửi về email');
      }
      return this.authRepo.changePassword(current, next, otp.trim());
    }
    return this.authRepo.changePassword(current, next);
  }
}

