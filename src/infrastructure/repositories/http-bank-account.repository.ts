import { SaveBankAccountDto, UserBankAccount } from '@/domain/entities/BankAccount';
import { ApiClient } from '../http/api-client';

export class HttpBankAccountRepository {
  async getMyBankAccount(): Promise<UserBankAccount | null> {
    try {
      const res = await ApiClient.get<UserBankAccount | null>('/billing/bank-account/me');
      return res || null;
    } catch {
      return null;
    }
  }

  async saveMyBankAccount(payload: SaveBankAccountDto): Promise<UserBankAccount> {
    return ApiClient.put<UserBankAccount>('/billing/bank-account/me', payload);
  }

  async getUserBankAccount(userId: string): Promise<UserBankAccount | null> {
    try {
      const res = await ApiClient.get<UserBankAccount | null>(
        `/billing/bank-account/user/${encodeURIComponent(userId)}`
      );
      return res || null;
    } catch {
      return null;
    }
  }
}

