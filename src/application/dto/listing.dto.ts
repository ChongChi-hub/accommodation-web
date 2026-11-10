export interface AmenityDto { id: number; code: string; name: string; icon?: string; category?: string; }
export interface ProvinceDto { id: number; code: string; name: string; fullName: string; slug?: string; imageUrl?: string; }
export interface DistrictDto { id: number; code: string; name: string; fullName: string; provinceCode: string; }
export interface WardDto { id: number; code: string; name: string; fullName: string; provinceCode?: string; districtCode?: string; }
export interface HotAreaDto { code: string; name: string; fullName: string; slug: string; imageUrl: string; roomCount: number; }
export interface BannerDto { id: number; title: string; subtitle?: string; badgeText?: string; imageUrl: string; linkUrl: string; sortOrder: number; active: boolean; }
export interface PlatformStatsDto { activeRooms: number; provincesWithRooms?: number; verifiedLandlords: number; totalReviews: number; happyTenants: number; }
export interface RoomTypeDto { id: number; code: string; name: string; description?: string; icon?: string; }

export interface ReviewDto {
  id: number;
  roomId: number;
  tenantId: number;
  tenantName: string;
  tenantAvatar?: string;
  rating: number;
  comment: string;
  landlordReply?: string;
  createdAt: string;
  isVerifiedTenant?: boolean;
}

export interface RoomImageDetailDto {
  id: number;
  roomId: number;
  imageUrl: string;
  width: number;
  height: number;
  cover: boolean;
  sortOrder?: number;
  altText?: string;
}

export interface RoomFeeDto {
  id?: number;
  roomId?: number;
  label: string;
  price: number;
  unit: string;
  billingMode: 'METERED' | 'PER_PERSON' | 'FIXED' | 'INCLUDED' | string;
  metered?: boolean;
  meterType?: string;
}

export interface LandlordSnapshotDto {
  id?: number;
  landlordId: number;
  name: string;
  phone?: string;
  avatarUrl?: string;
  email?: string;
  verified: boolean;
  ratingAvg?: number;
  reviewCount?: number;
  responseRatePercent?: number;
  responseTimeMinutes?: number;
  roomCount?: number;
  joinedAt?: string;
}

export interface RoomFacetsDto {
  provinces: Array<{ code: string; name: string; count: number }>;
  priceRange: { min: number; max: number };
  amenities: Array<{ id: number; code: string; name: string; count: number }>;
  roomTypes: Array<{ code: string; name: string; count: number }>;
  categories: Array<{ code: string; name: string; count: number }>;
}

export interface CmsArticleDto {
  id: number;
  slug: string;
  titleVi: string;
  titleEn: string;
  summaryVi: string;
  summaryEn: string;
  contentVi: string;
  contentEn: string;
  category: string;
  readingMinutes: number;
  imageUrl: string;
  imageAltVi: string;
  imageAltEn: string;
  publishedAt: string;
  sortOrder: number;
}

export interface RoomDto {
  id: number;
  slug?: string;
  landlordId: number;
  landlordName: string;
  landlordPhone?: string;
  roomTypeCode: string;
  title: string;
  description: string;
  address: string;
  provinceCode: string;
  provinceName?: string;
  districtCode?: string;
  wardCode?: string;
  wardId?: number;
  latitude?: number;
  longitude?: number;
  area: number;
  floor?: number;
  bedrooms?: number;
  maxOccupants: number;
  availableSpots?: number;
  totalSpots?: number;
  price: number;
  priceUnit?: 'ROOM' | 'BED';
  deposit: number;
  electricityCost: number;
  waterCost: number;
  internetCost: number;
  serviceCost: number;
  status: string;
  publicationStatus?: string;
  occupancyStatus?: string;
  approved: boolean;
  allowPets: boolean;
  allowCooking: boolean;
  genderPreference?: string;
  furnishing?: string;
  ratingAvg: number;
  reviewCount: number;
  bookmarkCount?: number;
  isBookmarked?: boolean;
  isLandlordVerified?: boolean;
  primaryImageUrl: string;
  imageUrls: string[];
  amenities: AmenityDto[];
  createdAt?: string;
  publishedAt?: string;
}

export interface RoomDetailDto {
  id: number;
  roomUuid?: string;
  slug: string;
  title: string;
  description: string;
  address: string;
  provinceCode: string;
  provinceName?: string;
  wardCode?: string;
  wardName?: string;
  wardId?: number;
  latitude?: number;
  longitude?: number;
  roomTypeId?: number;
  roomTypeCode: string;
  roomTypeName?: string;
  area: number;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  maxOccupants: number;
  price: number;
  priceUnit?: 'ROOM' | 'BED';
  deposit: number;
  electricityCost: number;
  waterCost: number;
  internetCost: number;
  serviceCost: number;
  status: string;
  publicationStatus: string;
  occupancyStatus: string;
  approved: boolean;
  allowPets: boolean;
  allowCooking: boolean;
  genderPreference: string;
  furnishing: string;
  curfew: string;
  availableDate: string;
  minLeaseMonths: number;
  ratingAvg: number;
  reviewCount: number;
  ratingCleanliness: number;
  ratingLocation: number;
  ratingPriceQuality: number;
  ratingSecurity: number;
  viewCount: number;
  bookmarkCount: number;
  isBookmarked?: boolean;
  publishedAt?: string;
  images: RoomImageDetailDto[];
  amenities: AmenityDto[];
  roomFees: RoomFeeDto[];
  landlord: LandlordSnapshotDto;
  reviews: ReviewDto[];
}

export interface RoomFilterParams {
  q?: string;
  provinceSlug?: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  wardId?: number;
  roomTypeCode?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  occupants?: number;
  minAvailableSpots?: number;
  genderPreference?: string;
  furnishing?: string;
  priceUnit?: string;
  availableFrom?: string;
  verifiedOnly?: boolean;
  allowPets?: boolean;
  allowCooking?: boolean;
  sortBy?: string;
  page?: number;
  size?: number;
}
