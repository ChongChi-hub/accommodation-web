export interface AdminStats {
  totalUsers: number;
  activeRooms: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  servicesHealth: {
    gateway: boolean;
    identity: boolean;
    listing: boolean;
    booking: boolean;
    billing: boolean;
  };
}

export interface PendingRoomItem {
  id: number;
  title: string;
  landlordName: string;
  price: number;
  area: number;
  address: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface KycReviewItem {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  idNumber: string;
  frontImage: string;
  backImage: string;
  submittedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'TENANT' | 'LANDLORD' | 'MODERATOR' | 'ADMIN';
  roleText: string;
  status: 'ACTIVE' | 'LOCKED';
  joinedAt: string;
}

export interface ReportItem {
  id: number;
  targetType: string;
  targetTitle: string;
  reporterName: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface AuditLogItem {
  id: number;
  actor: string;
  action: string;
  target: string;
  ip: string;
  timestamp: string;
}

export interface AdminRepository {
  getStats(): Promise<AdminStats>;
  getPendingRooms(): Promise<PendingRoomItem[]>;
  approveRoom(id: number): Promise<void>;
  rejectRoom(id: number, reason: string): Promise<void>;
  getPendingKyc(): Promise<KycReviewItem[]>;
  approveKyc(id: number): Promise<void>;
  rejectKyc(id: number, reason: string): Promise<void>;
  getUsers(): Promise<UserItem[]>;
  toggleUserLock(id: number): Promise<void>;
  getReports(): Promise<ReportItem[]>;
  resolveReport(id: number): Promise<void>;
  getAuditLogs(): Promise<AuditLogItem[]>;
}

