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

    const [recommendations, rawReviews] = await Promise.all([
      this.listingRepo.getSimilarRooms(room.id).catch(() => []),
      this.listingRepo.getReviews(room.id).catch(() => room.reviews || []),
    ]);

    const candidateReviews = rawReviews.length > 0 ? rawReviews : room.reviews || [];
    const visibleReviews = candidateReviews.filter(
      (r) => !r.status || r.status.toUpperCase() === 'VISIBLE'
    );

    // Compute dynamic ratingAvg & reviewCount from actual visible reviews
    let dynamicRatingAvg = room.ratingAvg;
    let dynamicReviewCount = room.reviewCount;
    if (visibleReviews.length > 0) {
      const sum = visibleReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
      dynamicRatingAvg = Math.round((sum / visibleReviews.length) * 10) / 10;
      dynamicReviewCount = visibleReviews.length;
    } else if (candidateReviews.length === 0) {
      dynamicReviewCount = 0;
      dynamicRatingAvg = 0;
    }

    const enrichedRoom: RoomDetailDto = {
      ...room,
      ratingAvg: dynamicRatingAvg,
      reviewCount: dynamicReviewCount,
      reviews: visibleReviews,
    };

    return {
      room: enrichedRoom,
      recommendations: recommendations.length > 0 ? recommendations : [],
      reviews: visibleReviews,
    };
  }
}
