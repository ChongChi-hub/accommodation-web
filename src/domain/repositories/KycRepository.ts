import {
  LandlordKycStatus,
  KycModerationListItem,
  KycModerationDetail,
} from '../entities/LandlordKyc';

export interface KycModerationListParams {
  status?: string;
  page?: number;
  size?: number;
}

export interface KycModerationPageResult {
  items: KycModerationListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface KycRepository {
  getLandlordKyc(): Promise<LandlordKycStatus>;
  submitLandlordKyc(formData: FormData): Promise<LandlordKycStatus>;
  getKycImage(side: 'front' | 'back'): Promise<Blob>;
  getModerationKycList(params?: KycModerationListParams): Promise<KycModerationPageResult>;
  getModerationKycDetail(id: string): Promise<KycModerationDetail>;
  getModerationKycImage(id: string, side: 'front' | 'back'): Promise<Blob>;
  approveKyc(id: string, version: number): Promise<void>;
  rejectKyc(id: string, reasonCode: string, reasonNote: string, version: number): Promise<void>;
}

