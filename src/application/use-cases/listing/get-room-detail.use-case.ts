import { IListingRepository } from '@/application/repositories/listing.repository.interface';
import { RoomDto, ReviewDto } from '@/application/dto/listing.dto';

export class GetRoomDetailUseCase {
  constructor(private readonly listingRepo: IListingRepository) {}

  async execute(id: number): Promise<{
    room: RoomDto;
    recommendations: RoomDto[];
    reviews: ReviewDto[];
  }> {
    const [room, recommendations, reviews] = await Promise.all([
      this.listingRepo.getRoomById(id),
      this.listingRepo.getRecommendations(id).catch(() => []),
      this.listingRepo.getReviews(id).catch(() => []),
    ]);

    return { room, recommendations, reviews };
  }
}
