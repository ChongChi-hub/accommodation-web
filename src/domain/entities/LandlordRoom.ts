export interface LandlordRoomItem {
  id: number;
  roomUuid: string;
  title: string;
  address: string;
  shortAddress: string;
  price: number;
  deposit: number;
  area: number;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'HIDDEN' | 'REJECTED' | 'RENTED';
  publishedAt?: string | null;
  createdAt: string;
  viewCount: number;
  rejectedReason?: string | null;
  hiddenReason?: string | null;
  hiddenBy?: 'OWNER' | 'MODERATOR' | 'ADMIN' | null;
  coverThumbUrl?: string | null;
  coverMediumUrl?: string | null;
  ratingAvg: number;
  reviewCount: number;
}

export interface LandlordRoomSummary {
  total: number;
  published: number;
  hidden: number;
  pendingReview: number;
  draft: number;
  rejected: number;
  rented: number;
}

export interface RoomImage {
  id: number;
  roomId: number;
  imageUrl: string;
  storageKey?: string;
  thumbKey?: string;
  mediumKey?: string;
  largeKey?: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  cover: boolean;
  sortOrder: number;
  altText?: string;
  createdAt?: string;
}

export interface LandlordRoomDetail {
  id: number;
  roomUuid: string;
  landlordId: number;
  landlordName?: string;
  landlordPhone?: string;
  roomTypeId?: number;
  roomTypeCode?: string;
  title: string;
  slug?: string;
  description?: string;
  address: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  wardId?: number;
  latitude?: number;
  longitude?: number;
  area: number;
  maxOccupants: number;
  price: number;
  deposit?: number;
  electricityCost?: number;
  waterCost?: number;
  internetCost?: number;
  serviceCost?: number;
  status: string;
  approved: boolean;
  allowPets: boolean;
  allowCooking: boolean;
  ratingAvg: number;
  reviewCount: number;
  viewCount: number;
  publishedAt?: string | null;
  hiddenAt?: string | null;
  hiddenBy?: string | null;
  hiddenReason?: string | null;
  rejectedReason?: string | null;
  createdAt: string;
  updatedAt?: string;
  images: RoomImage[];
}

export interface ImageUploadItemResult {
  imageId?: number;
  originalFilename: string;
  imageUrl?: string;
  thumbUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  isCover: boolean;
  sortOrder?: number;
  success: boolean;
  errorMessage?: string;
}

export interface ImageUploadResult {
  totalUploaded: number;
  totalFailed: number;
  items: ImageUploadItemResult[];
}

export interface UpdateRoomPayload {
  title: string;
  description?: string;
  address: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  wardId?: number;
  roomTypeId?: number;
  roomTypeCode?: string;
  area: number;
  maxOccupants?: number;
  price: number;
  deposit?: number;
  electricityCost?: number;
  waterCost?: number;
  internetCost?: number;
  serviceCost?: number;
  allowPets?: boolean;
  allowCooking?: boolean;
}

export interface CreateRoomPayload extends UpdateRoomPayload {
  submitForReview?: boolean;
}

export interface LandlordRoomFilterParams {
  search?: string;
  status?: string;
  sort?: string;
  page?: number;
  size?: number;
}
