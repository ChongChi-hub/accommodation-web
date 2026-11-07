import { TransactionRepository } from '@/domain/repositories/TransactionRepository';
import { Transaction } from '@/domain/entities/Transaction';

export class StaticTransactionRepository implements TransactionRepository {
  private transactions: Transaction[] = [
    {
      id: 'TXN-9001',
      referenceCode: 'TOAM-QR-882193',
      userId: 'usr_tenant_1',
      userName: 'Nguyễn Văn Thuê',
      contractId: 'HD-2026-088',
      roomTitle: 'Phòng Studio Ban Công Đẹp Phường Đa Kao',
      amount: 4500000,
      type: 'DEPOSIT_HOLD',
      paymentMethod: 'VIETQR',
      status: 'SUCCESS',
      description: 'Tiền đặt cọc giữ chỗ phòng Studio Phường Đa Kao (khóa phòng 7 ngày)',
      createdAt: '2026-11-01T08:30:00Z',
      completedAt: '2026-11-01T08:32:15Z',
    },
    {
      id: 'TXN-9002',
      referenceCode: 'TOAM-QR-882204',
      userId: 'usr_tenant_1',
      userName: 'Nguyễn Văn Thuê',
      contractId: 'HD-2026-088',
      roomTitle: 'Phòng Studio Ban Công Đẹp Phường Đa Kao',
      amount: 4780000,
      type: 'RENT_PAYMENT',
      paymentMethod: 'VIETQR',
      status: 'SUCCESS',
      description: 'Thanh toán tiền phòng & dịch vụ tháng 11/2026',
      createdAt: '2026-11-05T10:14:00Z',
      completedAt: '2026-11-05T10:15:30Z',
    },
    {
      id: 'TXN-9003',
      referenceCode: 'TOAM-RF-331002',
      userId: 'usr_tenant_2',
      userName: 'Lê Hoàng Minh',
      contractId: 'HD-2026-052',
      roomTitle: 'Căn Hộ Dịch Vụ 1PN Phường 15',
      amount: 4500000,
      type: 'REFUND',
      paymentMethod: 'BANK_TRANSFER',
      status: 'SUCCESS',
      description: 'Lệnh hoàn trả tiền cọc hợp đồng đã kết thúc',
      createdAt: '2026-11-02T16:00:00Z',
      completedAt: '2026-11-03T09:00:00Z',
    },
  ];

  async getTransactions(filters?: { userId?: string; type?: string; status?: string }): Promise<Transaction[]> {
    let result = [...this.transactions];
    if (filters?.userId) result = result.filter((t) => t.userId === filters.userId);
    if (filters?.type) result = result.filter((t) => t.type === filters.type);
    if (filters?.status) result = result.filter((t) => t.status === filters.status);
    return result;
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    return this.transactions.find((t) => t.id === id) || null;
  }

  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const newTxn: Transaction = {
      ...data,
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };
    this.transactions.unshift(newTxn);
    return newTxn;
  }

  async refundTransaction(id: string, reason: string): Promise<void> {
    const txn = this.transactions.find((t) => t.id === id);
    if (!txn) throw new Error('Không tìm thấy giao dịch');
    txn.status = 'REFUNDED';
    txn.description += ` [Đã hoàn tiền: ${reason}]`;
  }
}

