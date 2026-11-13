import {
  AddOccupantPayload,
  Contract,
  ContractAmendment,
  ContractOccupant,
  CreateAmendmentPayload,
  CreateContractPayload,
} from '@/domain/entities/Contract';
import { ApiClient } from '../http/api-client';

export class HttpContractRepository {
  async createContract(payload: CreateContractPayload): Promise<Contract> {
    return ApiClient.post<Contract>('/booking/contracts', payload);
  }

  async getContract(id: string): Promise<Contract> {
    return ApiClient.get<Contract>(`/booking/contracts/${encodeURIComponent(id)}`);
  }

  async getTenantContracts(): Promise<Contract[]> {
    const res = await ApiClient.get<Contract[]>('/booking/contracts/tenant');
    return Array.isArray(res) ? res : [];
  }

  async getLandlordContracts(): Promise<Contract[]> {
    const res = await ApiClient.get<Contract[]>('/booking/contracts/landlord');
    return Array.isArray(res) ? res : [];
  }

  async signTenant(id: string, otpCode: string, signatureText?: string): Promise<Contract> {
    return ApiClient.post<Contract>(`/booking/contracts/${encodeURIComponent(id)}/sign-tenant`, {
      otpCode,
      signatureText,
    });
  }

  async signLandlord(id: string, otpCode: string, signatureText?: string): Promise<Contract> {
    return ApiClient.post<Contract>(`/booking/contracts/${encodeURIComponent(id)}/sign-landlord`, {
      otpCode,
      signatureText,
    });
  }

  async getSignedPdfUrl(id: string): Promise<{ signedUrl: string }> {
    return ApiClient.get<{ signedUrl: string }>(`/booking/contracts/${encodeURIComponent(id)}/pdf/signed-url`);
  }

  async downloadDirectPdfBlob(id: string): Promise<Blob> {
    return ApiClient.getBlob(`/booking/contracts/${encodeURIComponent(id)}/pdf/download`);
  }

  async uploadPhysicalScan(id: string, scanUrl: string): Promise<Contract> {
    return ApiClient.post<Contract>(`/booking/contracts/${encodeURIComponent(id)}/upload-scan`, {
      scanUrl,
    });
  }

  async tenantConfirmPhysical(id: string): Promise<Contract> {
    return ApiClient.post<Contract>(`/booking/contracts/${encodeURIComponent(id)}/tenant-confirm`, {});
  }

  async tenantRejectPhysical(id: string, reason?: string): Promise<Contract> {
    return ApiClient.post<Contract>(`/booking/contracts/${encodeURIComponent(id)}/tenant-reject`, {
      reason,
    });
  }

  async downloadPdfBlob(signedUrlOrPath: string): Promise<Blob> {
    if (signedUrlOrPath.startsWith('http://') || signedUrlOrPath.startsWith('https://')) {
      return ApiClient.getBlob(signedUrlOrPath);
    }
    const clean = signedUrlOrPath.replace(/^\/api\/v1/, '');
    return ApiClient.getBlob(clean.startsWith('/') ? clean : `/${clean}`);
  }

  async getOccupants(contractId: string): Promise<ContractOccupant[]> {
    const res = await ApiClient.get<ContractOccupant[]>(
      `/booking/contracts/${encodeURIComponent(contractId)}/occupants`
    );
    return Array.isArray(res) ? res : [];
  }

  async addOccupant(contractId: string, payload: AddOccupantPayload): Promise<ContractOccupant> {
    return ApiClient.post<ContractOccupant>(
      `/booking/contracts/${encodeURIComponent(contractId)}/occupants`,
      payload
    );
  }

  async removeOccupant(contractId: string, occupantId: string): Promise<void> {
    await ApiClient.delete(
      `/booking/contracts/${encodeURIComponent(contractId)}/occupants/${encodeURIComponent(occupantId)}`
    );
  }

  async getAmendments(contractId: string): Promise<ContractAmendment[]> {
    const res = await ApiClient.get<ContractAmendment[]>(
      `/booking/contracts/${encodeURIComponent(contractId)}/amendments`
    );
    return Array.isArray(res) ? res : [];
  }

  async createAmendment(contractId: string, payload: CreateAmendmentPayload): Promise<ContractAmendment> {
    return ApiClient.post<ContractAmendment>(
      `/booking/contracts/${encodeURIComponent(contractId)}/amendments`,
      payload
    );
  }

  async signAmendmentTenant(
    amendmentId: string,
    otpCode: string,
    signatureText?: string
  ): Promise<ContractAmendment> {
    return ApiClient.post<ContractAmendment>(
      `/booking/contracts/amendments/${encodeURIComponent(amendmentId)}/sign-tenant`,
      { otpCode, signatureText }
    );
  }

  async signAmendmentLandlord(
    amendmentId: string,
    otpCode: string,
    signatureText?: string
  ): Promise<ContractAmendment> {
    return ApiClient.post<ContractAmendment>(
      `/booking/contracts/amendments/${encodeURIComponent(amendmentId)}/sign-landlord`,
      { otpCode, signatureText }
    );
  }
}

