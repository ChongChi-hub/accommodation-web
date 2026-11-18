export interface AdminStats {
  totalUsers: number;
  activeRooms: number;
  pendingApprovals: number;
  pendingKyc?: number;
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
  roomUuid?: string;
  title: string;
  landlordName: string;
  landlordPhone?: string;
  landlordId?: number;
  price: number;
  deposit?: number;
  electricityCost?: number;
  waterCost?: number;
  internetCost?: number;
  serviceCost?: number;
  area: number;
  address: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  description?: string;
  roomTypeCode?: string;
  floor?: number;
  bedrooms?: number;
  bathrooms?: number;
  maxOccupants?: number;
  allowPets?: boolean;
  allowCooking?: boolean;
  curfew?: string;
  houseRules?: string;
  images?: string[];
  amenities?: string[];
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  riskLevel?: 'NORMAL' | 'HIGH_RISK';
  riskReasons?: string;
  verifiedOwnership?: boolean;
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
  id: number | string;
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
  id: number | string;
  actor: string;
  actorRole?: string;
  action: string;
  target: string;
  details?: string | null;
  ip: string;
  userAgent?: string | null;
  source?: string;
  timestamp: string;
}

export interface AdminReviewItem {
  id: number;
  tenantName: string;
  roomTitle: string;
  rating: number;
  comment: string;
  status: 'VISIBLE' | 'HIDDEN';
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
  toggleUserLock(id: number | string): Promise<void>;
  getReports(): Promise<ReportItem[]>;
  resolveReport(id: number): Promise<void>;
  getReviews(): Promise<AdminReviewItem[]>;
  toggleReviewVisibility(id: number): Promise<void>;
  getAuditLogs(filters?: { search?: string; source?: string; action?: string; limit?: number }): Promise<AuditLogItem[]>;
}

