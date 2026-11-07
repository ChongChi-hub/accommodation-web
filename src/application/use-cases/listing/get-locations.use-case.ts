import { IListingRepository } from '@/application/repositories/listing.repository.interface';
import { ProvinceDto, DistrictDto, WardDto, AmenityDto } from '@/application/dto/listing.dto';

export class GetLocationsUseCase {
  constructor(private readonly listingRepo: IListingRepository) {}

  async getProvinces(): Promise<ProvinceDto[]> {
    return this.listingRepo.getProvinces();
  }

  async getDistricts(provinceCode: string): Promise<DistrictDto[]> {
    return this.listingRepo.getDistricts(provinceCode);
  }

  async getWards(provinceCode: string): Promise<WardDto[]> {
    return this.listingRepo.getWards(provinceCode, true);
  }

  async getAmenities(): Promise<AmenityDto[]> {
    return this.listingRepo.getAmenities();
  }
}

