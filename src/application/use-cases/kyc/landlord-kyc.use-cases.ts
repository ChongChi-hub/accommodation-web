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
    phone?: string;
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

    let frontImageUrl: string | undefined;
    let backImageUrl: string | undefined;

    try {
      const uploadToCloudinary = async (file: File) => {
        const cfd = new FormData();
        cfd.append('file', file);
        cfd.append('folder', 'cozynest/kyc');
        const res = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          body: cfd,
        });
        if (!res.ok) return undefined;
        const json = await res.json();
        return json?.data?.url as string | undefined;
      };

      const [fUrl, bUrl] = await Promise.all([
        uploadToCloudinary(data.frontImage),
        uploadToCloudinary(data.backImage),
      ]);
      frontImageUrl = fUrl;
      backImageUrl = bUrl;
    } catch {
      // Fallback: Proceed with multipart upload to identity-service
    }

    const formData = new FormData();
    formData.append('front', data.frontImage);
    formData.append('back', data.backImage);
    formData.append('frontImage', data.frontImage);
    formData.append('backImage', data.backImage);
    if (frontImageUrl) formData.append('frontImageUrl', frontImageUrl);
    if (backImageUrl) formData.append('backImageUrl', backImageUrl);
    formData.append('fullNameOnId', data.fullNameOnId.trim());
    formData.append('idNumber', data.idNumber.trim());
    if (data.phone) formData.append('phone', data.phone.trim());
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

