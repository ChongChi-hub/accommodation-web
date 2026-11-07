import { IListingRepository } from '@/application/repositories/listing.repository.interface';
import { RoomDto, RoomFilterParams } from '@/application/dto/listing.dto';

export class GetRoomsUseCase {
  constructor(private readonly listingRepo: IListingRepository) {}

  async execute(params: RoomFilterParams = {}): Promise<RoomDto[]> {
    return this.listingRepo.getRooms(params);
  }
}
