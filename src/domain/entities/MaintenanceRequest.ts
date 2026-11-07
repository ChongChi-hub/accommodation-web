export type MaintenanceCategory = 'ELECTRICITY' | 'WATER' | 'APPLIANCE' | 'INTERNET' | 'STRUCTURE' | 'OTHER';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
export type MaintenanceStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface MaintenanceRequest {
  id: string;
  roomId: string;
  roomTitle: string;
  roomAddress: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  landlordId: string;
  landlordName: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  images: string[];
  estimatedCost?: number;
  actualCost?: number;
  contractId?: string;
  createdAt: string;
  scheduledAt?: string;
  resolvedAt?: string;
}
