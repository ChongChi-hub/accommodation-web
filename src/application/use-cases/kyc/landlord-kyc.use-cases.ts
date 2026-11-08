import { KycRepository } from '@/domain/repositories/KycRepository';
import { LandlordKycStatus } from '@/domain/entities/LandlordKyc';

export class LandlordKycUseCases {
  constructor(private readonly kycRepo: KycRepository) {}

  async getKycStatus(): Promise<LandlordKycStatus> {
    return this.kycRepo.getLandlordKyc();
  }

  async submitKyc(data: {
    fullNameOnId: string;
    idNumber: string;
    dateOfBirth: string;
    issueDate: string;
    issuePlace: string;
    frontImage: File;
    backImage: File;
    consent: boolean;
  }): Promise<LandlordKycStatus> {
    if (!data.consent) {
      throw new Error('Bạn cần đồng ý với điều khoản xử lý dữ liệu cá nhân');
    }
    if (!data.idNumber || !/^[0-9]{12}$/.test(data.idNumber.trim())) {
      throw new Error('Số Căn cước công dân phải đúng 12 chữ số');
    }
    if (!data.fullNameOnId || !data.fullNameOnId.trim()) {
      throw new Error('Họ tên trên CCCD không được để trống');
    }
    if (!data.frontImage || !data.backImage) {
      throw new Error('Vui lòng chụp và tải lên cả 2 mặt CCCD');
    }

    const formData = new FormData();
    formData.append('frontImage', data.frontImage);
    formData.append('backImage', data.backImage);
    formData.append('fullNameOnId', data.fullNameOnId.trim());
    formData.append('idNumber', data.idNumber.trim());
    formData.append('dateOfBirth', data.dateOfBirth);
    formData.append('issueDate', data.issueDate);
    formData.append('issuePlace', data.issuePlace.trim());
    formData.append('consent', String(data.consent));

    return this.kycRepo.submitLandlordKyc(formData);
  }

  async getImage(side: 'front' | 'back'): Promise<Blob> {
    return this.kycRepo.getKycImage(side);
  }
}

