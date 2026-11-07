import { IListingRepository } from '@/application/repositories/listing.repository.interface';
import {
  RoomDto,
  RoomFilterParams,
  ProvinceDto,
  DistrictDto,
  WardDto,
  AmenityDto,
  ReviewDto,
} from '@/application/dto/listing.dto';
import { ApiClient } from '../http/api-client';

export class HttpListingRepository implements IListingRepository {
  async getRooms(params: RoomFilterParams): Promise<RoomDto[]> {
    const query = new URLSearchParams();
    if (params.provinceCode) query.append('provinceCode', params.provinceCode);
    if (params.districtCode) query.append('districtCode', params.districtCode);
    if (params.wardCode) query.append('wardCode', params.wardCode);
    if (params.roomTypeCode) query.append('roomTypeCode', params.roomTypeCode);
    if (params.minPrice) query.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) query.append('maxPrice', params.maxPrice.toString());
    if (params.occupants) query.append('occupants', params.occupants.toString());
    if (params.allowPets !== undefined) query.append('allowPets', String(params.allowPets));
    if (params.allowCooking !== undefined) query.append('allowCooking', String(params.allowCooking));
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const qs = query.toString();
    const endpoint = `/rooms${qs ? `?${qs}` : ''}`;
    return ApiClient.get<RoomDto[]>(endpoint);
  }

  async getRoomById(id: number): Promise<RoomDto> {
    return ApiClient.get<RoomDto>(`/rooms/${id}`);
  }

  async getRecommendations(id: number): Promise<RoomDto[]> {
    return ApiClient.get<RoomDto[]>(`/rooms/${id}/recommendations`);
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
}

