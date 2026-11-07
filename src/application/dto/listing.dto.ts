export interface AmenityDto {
  id: number;
  code: string;
  name: string;
  icon?: string;
  category?: string;
}

export interface ProvinceDto {
  id: number;
  code: string;
  name: string;
  fullName: string;
}

export interface DistrictDto {
  id: number;
  code: string;
  name: string;
  fullName: string;
  provinceCode: string;
}

export interface WardDto {
  id: number;
  code: string;
  name: string;
  fullName: string;
  provinceCode?: string;
  districtCode?: string;
}

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
}

export interface RoomDto {
  id: number;
  landlordId: number;
  landlordName: string;
  landlordPhone?: string;
  roomTypeCode: string;
  title: string;
  description: string;
  address: string;
  provinceCode: string;
  districtCode?: string;
  wardCode?: string;
  wardId?: number;
  latitude?: number;
  longitude?: number;
  area: number;
  maxOccupants: number;
  price: number;
  deposit: number;
  electricityCost: number;
  waterCost: number;
  internetCost: number;
  serviceCost: number;
  status: string;
  approved: boolean;
  allowPets: boolean;
  allowCooking: boolean;
  ratingAvg: number;
  reviewCount: number;
  primaryImageUrl: string;
  imageUrls: string[];
  amenities: AmenityDto[];
}

export interface RoomFilterParams {
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  wardId?: number;
  roomTypeCode?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  occupants?: number;
  allowPets?: boolean;
  allowCooking?: boolean;
  sortBy?: string;
  page?: number;
  size?: number;
}

