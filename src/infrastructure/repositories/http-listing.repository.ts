import { IListingRepository } from '@/application/repositories/listing.repository.interface';
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
  HostPublicProfileDto,
  PaginatedRoomsResult,
} from '@/application/dto/listing.dto';
import { ApiClient } from '../http/api-client';

export class HttpListingRepository implements IListingRepository {
  private buildRoomsEndpoint(params: RoomFilterParams): string {
    const query = new URLSearchParams();
    if (params.q?.trim()) query.append('q', params.q.trim().slice(0, 100));
    if (params.provinceSlug) query.append('provinceSlug', params.provinceSlug);
    if (params.provinceCode) query.append('provinceCode', params.provinceCode);
    if (params.districtCode) query.append('districtCode', params.districtCode);
    if (params.wardCode) query.append('wardCode', params.wardCode);
    if (params.roomTypeCode) query.append('roomTypeCode', params.roomTypeCode);
    if (params.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
    if (params.minArea !== undefined) query.append('minArea', params.minArea.toString());
    if (params.maxArea !== undefined) query.append('maxArea', params.maxArea.toString());
    if (params.occupants) query.append('occupants', params.occupants.toString());
    if (params.allowPets !== undefined) query.append('allowPets', String(params.allowPets));
    if (params.allowCooking !== undefined) query.append('allowCooking', String(params.allowCooking));
    if (params.bedrooms !== undefined) query.append('bedrooms', params.bedrooms.toString());
    if (params.furnishing) query.append('furnishing', params.furnishing);
    if (params.genderPreference) query.append('genderPreference', params.genderPreference);
    if (params.priceUnit) query.append('priceUnit', params.priceUnit);
    if (params.minAvailableSpots !== undefined) query.append('minAvailableSpots', params.minAvailableSpots.toString());
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', Math.min(params.size, 50).toString());

    const qs = query.toString();
    return `/rooms${qs ? `?${qs}` : ''}`;
  }

  async getRooms(params: RoomFilterParams, signal?: AbortSignal): Promise<RoomDto[]> {
    return ApiClient.get<RoomDto[]>(this.buildRoomsEndpoint(params), signal ? { signal } : undefined);
  }

  async searchRoomsPaginated(params: RoomFilterParams, signal?: AbortSignal): Promise<PaginatedRoomsResult> {
    const env = await ApiClient.getEnvelope<RoomDto[]>(this.buildRoomsEndpoint(params), signal ? { signal } : undefined);
    const rooms = Array.isArray(env.data) ? env.data : [];
    const p = env.pagination as Record<string, unknown> | undefined;
    const limit = typeof p?.limit === 'number' ? p.limit : (typeof p?.size === 'number' ? p.size : (params.size ?? 12));
    const total = typeof p?.total === 'number' ? p.total : (typeof p?.totalElements === 'number' ? p.totalElements : rooms.length);
    const page = typeof p?.page === 'number' ? p.page : (params.page ?? 0) + 1;
    const totalPages = typeof p?.totalPages === 'number' ? p.totalPages : (limit > 0 ? Math.ceil(total / limit) : 1);
    return {
      rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: typeof p?.hasNext === 'boolean' ? p.hasNext : page < totalPages,
        hasPrev: typeof p?.hasPrev === 'boolean' ? p.hasPrev : page > 1,
      },
    };
  }

  async getRoomById(id: number): Promise<RoomDto> {
    return ApiClient.get<RoomDto>(`/rooms/${id}`);
  }

  async getRoomDetail(slugOrId: string): Promise<RoomDetailDto> {
    return ApiClient.get<RoomDetailDto>(`/rooms/${slugOrId}`);
  }

  async getHostProfile(id: string | number): Promise<HostPublicProfileDto> {
    return ApiClient.get<HostPublicProfileDto>(`/hosts/${encodeURIComponent(String(id))}`);
  }

  async getRecommendations(id: number): Promise<RoomDto[]> {
    return ApiClient.get<RoomDto[]>(`/rooms/${id}/recommendations`);
  }

  async getSimilarRooms(id: number): Promise<RoomDto[]> {
    return ApiClient.get<RoomDto[]>(`/rooms/${id}/similar`);
  }

  async getProvinces(): Promise<ProvinceDto[]> {
    return ApiClient.get<ProvinceDto[]>('/locations/provinces');
  }

  async getDistricts(provinceCode: string): Promise<DistrictDto[]> {
    return ApiClient.get<DistrictDto[]>(`/locations/districts?provinceCode=${provinceCode}`);
  }

  async getWards(code: string, isProvince = true): Promise<WardDto[]> {
    const param = isProvince ? `provinceCode=${encodeURIComponent(code)}` : `districtCode=${encodeURIComponent(code)}`;
    return ApiClient.get<WardDto[]>(`/locations/wards?${param}`);
  }

  async getAmenities(): Promise<AmenityDto[]> {
    return ApiClient.get<AmenityDto[]>('/amenities');
  }

  async getReviews(roomId: number): Promise<ReviewDto[]> {
    return ApiClient.get<ReviewDto[]>(`/reviews?roomId=${roomId}`);
  }

  async getHotAreas(limit = 8, nonEmptyOnly = false): Promise<HotAreaDto[]> {
    const qs = new URLSearchParams({
      limit: String(limit),
      nonEmptyOnly: String(nonEmptyOnly),
    }).toString();
    return ApiClient.get<HotAreaDto[]>(`/locations/hot-areas?${qs}`);
  }

  async getRoomTypes(): Promise<RoomTypeDto[]> {
    return ApiClient.get<RoomTypeDto[]>('/room-types');
  }

  async getBanners(): Promise<BannerDto[]> {
    return ApiClient.get<BannerDto[]>('/cms/banners');
  }

  async getPlatformStats(): Promise<PlatformStatsDto> {
    return ApiClient.get<PlatformStatsDto>('/rooms/stats');
  }

  async getFacets(): Promise<RoomFacetsDto> {
    return ApiClient.get<RoomFacetsDto>('/rooms/facets');
  }

  async getArticles(): Promise<CmsArticleDto[]> {
    return ApiClient.get<CmsArticleDto[]>('/cms/articles');
  }
}
