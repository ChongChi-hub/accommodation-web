import {
  RoomDto,
  RoomFilterParams,
  ProvinceDto,
  DistrictDto,
  WardDto,
  AmenityDto,
  ReviewDto,
} from '../dto/listing.dto';

export interface IListingRepository {
  getRooms(params: RoomFilterParams): Promise<RoomDto[]>;
  getRoomById(id: number): Promise<RoomDto>;
  getRecommendations(id: number): Promise<RoomDto[]>;
  getProvinces(): Promise<ProvinceDto[]>;
  getDistricts(provinceCode: string): Promise<DistrictDto[]>;
  getWards(districtCode: string): Promise<WardDto[]>;
  getAmenities(): Promise<AmenityDto[]>;
  getReviews(roomId: number): Promise<ReviewDto[]>;
}

