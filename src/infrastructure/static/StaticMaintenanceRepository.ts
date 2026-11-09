import { MaintenanceRepository } from '@/domain/repositories/MaintenanceRepository';
import { MaintenanceRequest } from '@/domain/entities/MaintenanceRequest';

export class StaticMaintenanceRepository implements MaintenanceRepository {
  private requests: MaintenanceRequest[] = [
    {
      id: 'MN-201',
      roomId: 'room_101',
      roomTitle: 'Phòng Studio Ban Công Đẹp Phường Đa Kao',
      roomAddress: '124/8 Nguyễn Đình Chiểu, Phường Đa Kao, TP. Hồ Chí Minh',
      tenantId: 'usr_tenant_1',
      tenantName: 'Nguyễn Văn Thuê',
      tenantPhone: '0987654321',
      landlordId: 'usr_landlord_1',
      landlordName: 'Trần Thị Chủ Trọ',
      title: 'Máy lạnh Daikin bị chảy nước ở dàn lạnh',
      description: 'Máy lạnh bật được 30 phút thì bắt đầu nhỏ giọt xuống sàn gỗ, xin chủ trọ cho thợ qua vệ sinh và kiểm tra đường ống thoát nước.',
      category: 'APPLIANCE',
      priority: 'HIGH',
      status: 'PENDING',
      images: ['https://res.cloudinary.com/dfs07oaet/image/upload/v1794153192/cozynest/rooms/room-1.jpg'],
      estimatedCost: 250000,
      createdAt: '2026-11-06T11:00:00Z',
    },
    {
      id: 'MN-202',
      roomId: 'room_102',
      roomTitle: 'Căn Hộ Dịch Vụ 1PN Phường 15',
      roomAddress: '45/3 Điện Biên Phủ, Phường 15, TP. Hồ Chí Minh',
      tenantId: 'usr_tenant_2',
      tenantName: 'Lê Hoàng Minh',
      tenantPhone: '0933456789',
      landlordId: 'usr_landlord_1',
      landlordName: 'Trần Thị Chủ Trọ',
      title: 'Áp lực nước vòi sen trong phòng tắm quá yếu',
      description: 'Nước chảy rất nhỏ vào buổi tối lúc 19h - 21h, cần kiểm tra máy bơm tăng áp của tòa nhà.',
      category: 'WATER',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      images: ['https://res.cloudinary.com/dfs07oaet/image/upload/v1794153451/cozynest/rooms/room-2.jpg'],
      createdAt: '2026-11-04T09:30:00Z',
      scheduledAt: '2026-11-07T14:00:00Z',
    },
    {
      id: 'MN-203',
      roomId: 'room_103',
      roomTitle: 'Phòng Trọ Gác Lửng Giá Rẻ Phường 8',
      roomAddress: '78/12 Quang Trung, Phường 8, TP. Hồ Chí Minh',
      tenantId: 'usr_tenant_1',
      tenantName: 'Nguyễn Văn Thuê',
      tenantPhone: '0987654321',
      landlordId: 'usr_landlord_1',
      landlordName: 'Trần Thị Chủ Trọ',
      title: 'Bóng đèn tuýp LED trên gác lửng bị chập chờn',
      description: 'Đèn bật lúc sáng lúc tắt, đã được chủ nhà thay bóng mới chiều hôm qua.',
      category: 'ELECTRICITY',
      priority: 'LOW',
      status: 'RESOLVED',
      images: ['https://res.cloudinary.com/dfs07oaet/image/upload/v1794153451/cozynest/rooms/room-3.jpg'],
      actualCost: 120000,
      createdAt: '2026-10-28T16:00:00Z',
      resolvedAt: '2026-10-29T17:30:00Z',
    },
  ];

  async getRequests(filters?: { tenantId?: string; landlordId?: string; roomId?: string; status?: string }): Promise<MaintenanceRequest[]> {
    let result = [...this.requests];
    if (filters?.tenantId) result = result.filter((r) => r.tenantId === filters.tenantId);
    if (filters?.landlordId) result = result.filter((r) => r.landlordId === filters.landlordId);
    if (filters?.roomId) result = result.filter((r) => r.roomId === filters.roomId);
    if (filters?.status) result = result.filter((r) => r.status === filters.status);
    return result;
  }

  async getRequestById(id: string): Promise<MaintenanceRequest | null> {
    return this.requests.find((r) => r.id === id) || null;
  }

  async createRequest(data: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'status'>): Promise<MaintenanceRequest> {
    const newReq: MaintenanceRequest = {
      ...data,
      id: `MN-${Math.floor(100 + Math.random() * 900)}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.requests.unshift(newReq);
    return newReq;
  }

  async updateStatus(id: string, status: MaintenanceRequest['status'], notes?: string): Promise<void> {
    const req = this.requests.find((r) => r.id === id);
    if (!req) throw new Error('Không tìm thấy yêu cầu sửa chữa');
    req.status = status;
    if (status === 'RESOLVED') req.resolvedAt = new Date().toISOString();
  }
}

