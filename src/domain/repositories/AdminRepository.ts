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
  id: string | number;
  targetType: string;
  targetId?: string;
  targetTitle: string;
  reporterName: string;
  reason: string;
  description?: string;
  evidenceUrls?: string[];
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface AdminAnalyticsAreaItem {
  id: string;
  key: string;
  districtCode?: string;
  count?: number;
  percent: number;
}

export interface AdminAnalyticsData {
  successRate: number | null;
  avgTimeToFillDays: number | null;
  totalSearches: number | null;
  topAreas: AdminAnalyticsAreaItem[];
  degraded?: boolean;
  failedSources?: string[];
}

export interface AdminPlatformStatsKpis {
  totalUsers: number | null;
  newUsersInRange: number | null;
  pendingKyc: number | null;
  totalRooms: number | null;
  activeRooms: number | null;
  pendingRooms: number | null;
  rejectedRooms: number | null;
  totalViews: number | null;
  totalAppointments: number | null;
  completedAppointments: number | null;
  totalRentalRequests: number | null;
  totalContracts: number | null;
  activeContracts: number | null;
  totalInvoices: number | null;
  paidInvoices: number | null;
  paidRevenue: number | null;
  fintechMode: string | null;
  successRate: number | null;
  avgTimeToFillDays: number | null;
}

export interface AdminPlatformStatsOverview {
  from: string;
  to: string;
  generatedAt: string;
  degraded: boolean;
  failedSources: string[];
  sourceStatus: Record<string, string>;
  identity: Record<string, unknown> | null;
  listing: { topAreas?: AdminAnalyticsAreaItem[]; roomsByStatus?: Record<string, number> } | null;
  booking: {
    appointmentsByStatus?: Record<string, number>;
    rentalRequestsByStatus?: Record<string, number>;
    contractsByStatus?: Record<string, number>;
  } | null;
  billing: { invoicesByStatus?: Record<string, number>; fintechMode?: string } | null;
  kpis: AdminPlatformStatsKpis;
}

export interface AdminTimeseriesPoint {
  bucket: string;
  value: number;
}

export interface AdminPlatformStatsTimeseries {
  metric: string;
  granularity: string;
  from: string;
  to: string;
  degraded: boolean;
  source: string;
  points: AdminTimeseriesPoint[];
}

export interface AdminSupportTicketReply {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'USER' | 'ADMIN' | 'MODERATOR';
  message: string;
  createdAt: string;
}

export interface AdminSupportTicketItem {
  id: string;
  ticketCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  description: string;
  assignedTo?: string | null;
  assignedAgentName?: string | null;
  replyCount?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  replies?: AdminSupportTicketReply[];
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
  resolveReport(id: string | number): Promise<void>;
  dismissReport?(id: string | number): Promise<void>;
  getReviews(): Promise<AdminReviewItem[]>;
  toggleReviewVisibility(id: number): Promise<void>;
  getAuditLogs(filters?: { search?: string; source?: string; action?: string; limit?: number }): Promise<AuditLogItem[]>;
  getAnalytics(): Promise<AdminAnalyticsData>;
  getPlatformStatsOverview(from?: string, to?: string): Promise<AdminPlatformStatsOverview>;
  getPlatformStatsTimeseries(params: {
    metric: 'users' | 'rooms' | 'appointments' | 'contracts' | 'revenue';
    from?: string;
    to?: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<AdminPlatformStatsTimeseries>;
  getSupportTickets(filters?: { status?: string; category?: string; search?: string }): Promise<AdminSupportTicketItem[]>;
  getSupportTicketDetail(id: string): Promise<AdminSupportTicketItem>;
  replySupportTicket(id: string, message: string): Promise<AdminSupportTicketReply>;
  updateSupportTicketStatus(id: string, status: string): Promise<void>;
}

