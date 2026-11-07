import { DisputeRepository } from '@/domain/repositories/DisputeRepository';
import { Dispute } from '@/domain/entities/Dispute';

export class StaticDisputeRepository implements DisputeRepository {
  private disputes: Dispute[] = [
    {
      id: 'DISP-501',
      contractId: 'HD-2026-088',
      roomTitle: 'Phòng Studio Ban Công Đẹp Phường Đa Kao',
      complainantId: 'usr_tenant_1',
      complainantName: 'Nguyễn Văn Thuê',
      complainantRole: 'TENANT',
      defendantId: 'usr_landlord_1',
      defendantName: 'Trần Thị Chủ Trọ',
      defendantRole: 'LANDLORD',
      disputeType: 'DEPOSIT_RETURN',
      amount: 4500000,
      reason: 'Người thuê kết thúc hợp đồng đúng hạn và bàn giao chìa khóa nhưng chủ trọ chậm hoàn cọc quá 15 ngày làm việc theo cam kết hợp đồng.',
      evidenceUrls: ['/rooms/room-1.jpg'],
      status: 'MEDIATING',
      createdAt: '2026-11-04T14:00:00Z',
    },
    {
      id: 'DISP-502',
      contractId: 'HD-2026-052',
      roomTitle: 'Căn Hộ Dịch Vụ 1PN Phường 15',
      complainantId: 'usr_landlord_1',
      complainantName: 'Trần Thị Chủ Trọ',
      complainantRole: 'LANDLORD',
      defendantId: 'usr_tenant_2',
      defendantName: 'Lê Hoàng Minh',
      defendantRole: 'TENANT',
      disputeType: 'DAMAGE_COMPENSATION',
      amount: 1200000,
      reason: 'Khách thuê tự ý khoan tường làm vỡ gạch ốp tường phòng tắm và làm hỏng mặt kính bếp từ.',
      evidenceUrls: ['/rooms/room-2.jpg'],
      status: 'PENDING',
      createdAt: '2026-11-05T09:15:00Z',
    },
  ];

  async getDisputes(filters?: { status?: string; contractId?: string }): Promise<Dispute[]> {
    let result = [...this.disputes];
    if (filters?.status) result = result.filter((d) => d.status === filters.status);
    if (filters?.contractId) result = result.filter((d) => d.contractId === filters.contractId);
    return result;
  }

  async getDisputeById(id: string): Promise<Dispute | null> {
    return this.disputes.find((d) => d.id === id) || null;
  }

  async createDispute(data: Omit<Dispute, 'id' | 'createdAt' | 'status'>): Promise<Dispute> {
    const newDisp: Dispute = {
      ...data,
      id: `DISP-${Math.floor(100 + Math.random() * 900)}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.disputes.unshift(newDisp);
    return newDisp;
  }

  async resolveDispute(id: string, verdict: string, status: Dispute['status']): Promise<void> {
    const d = this.disputes.find((item) => item.id === id);
    if (!d) throw new Error('Không tìm thấy vụ việc tranh chấp');
    d.verdict = verdict;
    d.status = status;
    d.resolvedAt = new Date().toISOString();
  }
}

