import { IListingRepository } from '@/application/repositories/listing.repository.interface';
import { RoomDto, RoomDetailDto, ReviewDto } from '@/application/dto/listing.dto';

export class GetRoomDetailUseCase {
  constructor(private readonly listingRepo: IListingRepository) {}

  async execute(slugOrId: string | number): Promise<{
    room: RoomDetailDto;
    recommendations: RoomDto[];
    reviews: ReviewDto[];
  }> {
    const slugStr = String(slugOrId);
    const room = await this.listingRepo.getRoomDetail(slugStr);

    const [recommendations, reviews] = await Promise.all([
      this.listingRepo.getSimilarRooms(room.id).catch(() => []),
      this.listingRepo.getReviews(room.id).catch(() => room.reviews || []),
    ]);

    return {
      room,
      recommendations: recommendations.length > 0 ? recommendations : [],
      reviews: reviews.length > 0 ? reviews : room.reviews || [],
    };
  }
}
