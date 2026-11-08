import {
  RoomDto,
  RoomDetailDto,
  RoomFilterParams,
  ProvinceDto,
  DistrictDto,
  WardDto,
  AmenityDto,
  ReviewDto,
  HotAreaDto,
  BannerDto,
  PlatformStatsDto,
} from '../dto/listing.dto';

export interface IListingRepository {
  getRooms(params: RoomFilterParams): Promise<RoomDto[]>;
  getRoomById(id: number): Promise<RoomDto>;
  getRoomDetail(slugOrId: string): Promise<RoomDetailDto>;
  getRecommendations(id: number): Promise<RoomDto[]>;
  getSimilarRooms(id: number): Promise<RoomDto[]>;
  getProvinces(): Promise<ProvinceDto[]>;
  getDistricts(provinceCode: string): Promise<DistrictDto[]>;
  getWards(code: string, isProvince?: boolean): Promise<WardDto[]>;
  getAmenities(): Promise<AmenityDto[]>;
  getReviews(roomId: number): Promise<ReviewDto[]>;
  getHotAreas(): Promise<HotAreaDto[]>;
  getBanners(): Promise<BannerDto[]>;
  getPlatformStats(): Promise<PlatformStatsDto>;
}
