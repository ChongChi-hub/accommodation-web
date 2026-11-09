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
  RoomTypeDto,
  RoomFacetsDto,
  CmsArticleDto,
} from '../dto/listing.dto';

export interface IListingRepository {
  getRooms(params: RoomFilterParams, signal?: AbortSignal): Promise<RoomDto[]>;
  getRoomById(id: number): Promise<RoomDto>;
  getRoomDetail(slugOrId: string): Promise<RoomDetailDto>;
  getRecommendations(id: number): Promise<RoomDto[]>;
  getSimilarRooms(id: number): Promise<RoomDto[]>;
  getProvinces(): Promise<ProvinceDto[]>;
  getDistricts(provinceCode: string): Promise<DistrictDto[]>;
  getWards(code: string, isProvince?: boolean): Promise<WardDto[]>;
  getAmenities(): Promise<AmenityDto[]>;
  getReviews(roomId: number): Promise<ReviewDto[]>;
  getHotAreas(limit?: number, nonEmptyOnly?: boolean): Promise<HotAreaDto[]>;
  getRoomTypes?(): Promise<RoomTypeDto[]>;
  getBanners(): Promise<BannerDto[]>;
  getPlatformStats(): Promise<PlatformStatsDto>;
  getFacets(): Promise<RoomFacetsDto>;
  getArticles(): Promise<CmsArticleDto[]>;
}
