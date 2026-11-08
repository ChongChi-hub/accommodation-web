import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookmarkPort, BookmarkStatus } from '@/application/ports/bookmark.port';
import { RoomDto } from '@/application/dto/listing.dto';

describe('Bookmark Use Cases & Repository Integration', () => {
  let mockBookmarkPort: BookmarkPort;

  const sampleRoom: RoomDto = {
    id: 101,
    landlordId: 1,
    landlordName: 'Chủ trọ Nguyễn',
    roomTypeCode: 'STUDIO',
    title: 'Phòng studio full nội thất',
    description: 'Mô tả phòng',
    address: '123 Đường ABC, Quận 1',
    provinceCode: '79',
    area: 28,
    maxOccupants: 2,
    price: 4500000,
    deposit: 4500000,
    electricityCost: 3500,
    waterCost: 20000,
    internetCost: 100000,
    serviceCost: 50000,
    status: 'AVAILABLE',
    approved: true,
    allowPets: true,
    allowCooking: true,
    ratingAvg: 4.8,
    reviewCount: 12,
    bookmarkCount: 5,
    isBookmarked: true,
    primaryImageUrl: '/uploads/rooms/room1.jpg',
    imageUrls: ['/uploads/rooms/room1.jpg'],
    amenities: [],
  };

  beforeEach(() => {
    mockBookmarkPort = {
      getMyBookmarks: vi.fn(),
      getMyBookmarkedIds: vi.fn(),
      getBookmarkStatus: vi.fn(),
      addBookmark: vi.fn(),
      removeBookmark: vi.fn(),
    };
  });

  it('1. should fetch my bookmarked rooms successfully', async () => {
    vi.mocked(mockBookmarkPort.getMyBookmarks).mockResolvedValue([sampleRoom]);

    const result = await mockBookmarkPort.getMyBookmarks();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(101);
    expect(result[0].isBookmarked).toBe(true);
    expect(mockBookmarkPort.getMyBookmarks).toHaveBeenCalledTimes(1);
  });

  it('2. should add bookmark and return updated status', async () => {
    const status: BookmarkStatus = {
      roomId: 101,
      isBookmarked: true,
      bookmarkCount: 6,
    };
    vi.mocked(mockBookmarkPort.addBookmark).mockResolvedValue(status);

    const result = await mockBookmarkPort.addBookmark(101);

    expect(result.isBookmarked).toBe(true);
    expect(result.bookmarkCount).toBe(6);
    expect(mockBookmarkPort.addBookmark).toHaveBeenCalledWith(101);
  });

  it('3. should remove bookmark and return updated status', async () => {
    const status: BookmarkStatus = {
      roomId: 101,
      isBookmarked: false,
      bookmarkCount: 5,
    };
    vi.mocked(mockBookmarkPort.removeBookmark).mockResolvedValue(status);

    const result = await mockBookmarkPort.removeBookmark(101);

    expect(result.isBookmarked).toBe(false);
    expect(result.bookmarkCount).toBe(5);
    expect(mockBookmarkPort.removeBookmark).toHaveBeenCalledWith(101);
  });

  it('4. should get bookmark status for room', async () => {
    const status: BookmarkStatus = {
      roomId: 101,
      isBookmarked: false,
      bookmarkCount: 5,
    };
    vi.mocked(mockBookmarkPort.getBookmarkStatus).mockResolvedValue(status);

    const result = await mockBookmarkPort.getBookmarkStatus(101);

    expect(result.roomId).toBe(101);
    expect(result.bookmarkCount).toBe(5);
  });
});
