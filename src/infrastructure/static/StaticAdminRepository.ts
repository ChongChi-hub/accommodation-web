import {
  AdminRepository,
  AdminStats,
  PendingRoomItem,
  KycReviewItem,
  UserItem,
  ReportItem,
  AuditLogItem,
} from '@/domain/repositories/AdminRepository';

export class StaticAdminRepository implements AdminRepository {
  async getStats(): Promise<AdminStats> {
    return {
      totalUsers: 1420,
      activeRooms: 680,
      pendingApprovals: 12,
      monthlyRevenue: 285000000,
      servicesHealth: {
        gateway: true,
        identity: true,
        listing: true,
        booking: true,
        billing: true,
      },
    };
  }

  async getPendingRooms(): Promise<PendingRoomItem[]> {
    return [
      {
        id: 101,
        title: 'Phòng studio full đồ ban công thoáng Phường Dịch Vọng Hậu',
        landlordName: 'Trần Minh Tuấn',
        price: 4500000,
        area: 28,
        address: 'Số 18 Ngõ 86 Duy Tân, Phường Dịch Vọng Hậu, Hà Nội',
        submittedAt: '10 phút trước',
        status: 'PENDING',
      },
      {
        id: 102,
        title: 'Căn hộ dịch vụ 1N1K trung tâm Phường Cô Giang cao cấp',
        landlordName: 'Lê Hoàng Nam',
        price: 7200000,
        area: 40,
        address: '142 Cô Bắc, Phường Cô Giang, TP. Hồ Chí Minh',
        submittedAt: '35 phút trước',
        status: 'PENDING',
      },
      {
        id: 103,
        title: 'Phòng khép kín gần ĐH Bách Khoa không chung chủ',
        landlordName: 'Phạm Thị Mai',
        price: 3200000,
        area: 22,
        address: 'Số 45 Ngõ 12 Tạ Quang Bửu, Bách Khoa, Hai Bà Trưng, Hà Nội',
        submittedAt: '2 giờ trước',
        status: 'PENDING',
      },
    ];
  }

  async approveRoom(_id: number): Promise<void> {}
  async rejectRoom(_id: number, _reason: string): Promise<void> {}

  async getPendingKyc(): Promise<KycReviewItem[]> {
    return [
      {
        id: 201,
        userId: 2,
        userName: 'Trần Minh Tuấn',
        userEmail: 'landlord@toam.vn',
        idNumber: '001090012345',
        frontImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        backImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        submittedAt: '15/10/2026',
        status: 'PENDING',
      },
    ];
  }

  async approveKyc(_id: number): Promise<void> {}
  async rejectKyc(_id: number, _reason: string): Promise<void> {}

  async getUsers(): Promise<UserItem[]> {
    return [
      {
        id: 1,
        name: 'Nguyễn Văn Thuê',
        email: 'tenant@toam.vn',
        phone: '0987 654 321',
        role: 'TENANT',
        roleText: 'Người thuê',
        status: 'ACTIVE',
        joinedAt: '01/01/2026',
      },
      {
        id: 2,
        name: 'Trần Minh Tuấn',
        email: 'landlord@toam.vn',
        phone: '0912 345 678',
        role: 'LANDLORD',
        roleText: 'Chủ trọ',
        status: 'ACTIVE',
        joinedAt: '15/12/2025',
      },
      {
        id: 3,
        name: 'Hoàng Thị Thảo',
        email: 'moderator@toam.vn',
        phone: '0933 888 999',
        role: 'MODERATOR',
        roleText: 'Kiểm duyệt viên',
        status: 'ACTIVE',
        joinedAt: '10/11/2025',
      },
      {
        id: 4,
        name: 'Quản Trị Viên Tổ Ấm',
        email: 'admin@toam.vn',
        phone: '0909 000 111',
        role: 'ADMIN',
        roleText: 'Quản trị viên',
        status: 'ACTIVE',
        joinedAt: '01/10/2025',
      },
    ];
  }

  async toggleUserLock(_id: number): Promise<void> {}

  async getReports(): Promise<ReportItem[]> {
    return [
      {
        id: 301,
        targetType: 'ROOM',
        targetTitle: 'Phòng trọ giá rẻ 1.5tr Hai Bà Trưng',
        reporterName: 'Nguyễn Văn Thuê',
        reason: 'Hình ảnh phòng không đúng thực tế, bắt đặt cọc trước qua mạng',
        status: 'PENDING',
        createdAt: 'Hôm nay 09:30',
      },
    ];
  }

  async resolveReport(_id: number): Promise<void> {}

  async getReviews(): Promise<import('@/domain/repositories/AdminRepository').AdminReviewItem[]> {
    return [
      {
        id: 1,
        tenantName: 'Nguyễn Văn Thuê',
        roomTitle: 'Chung cư mini ban công rộng tại Dịch Vọng Hậu',
        rating: 5,
        comment: 'Phòng rất đẹp và mới giống y hình ảnh chụp. Anh Tuấn chủ nhà hỗ trợ rất nhiệt tình.',
        status: 'VISIBLE',
      },
      {
        id: 2,
        tenantName: 'Tài khoản ẩn danh',
        roomTitle: 'Studio ngập tràn ánh sáng view công viên Quan Hoa',
        rating: 1,
        comment: 'Có dấu hiệu spam quảng cáo sang số điện thoại khác 09xx...',
        status: 'HIDDEN',
      },
      {
        id: 3,
        tenantName: 'Trần Thị Hằng',
        roomTitle: 'Căn hộ dịch vụ 1N1K trung tâm Phường Cô Giang cao cấp',
        rating: 4,
        comment: 'Vị trí thuận tiện đi lại, phòng ốc sạch sẽ, tiện nghi đầy đủ.',
        status: 'VISIBLE',
      },
    ];
  }

  async toggleReviewVisibility(_id: number): Promise<void> {}

  async getAuditLogs(): Promise<AuditLogItem[]> {
    return [
      {
        id: 401,
        actor: 'admin@toam.vn',
        action: 'APPROVE_ROOM',
        target: 'Phòng #101 (Trần Minh Tuấn)',
        ip: '14.232.208.55',
        timestamp: '07/11/2026 14:15:02',
      },
      {
        id: 402,
        actor: 'moderator@toam.vn',
        action: 'VERIFY_KYC',
        target: 'CCCD #001090012345',
        ip: '113.190.23.4',
        timestamp: '07/11/2026 13:42:18',
      },
    ];
  }
}

