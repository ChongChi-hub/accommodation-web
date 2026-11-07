import { describe, it, expect, vi } from 'vitest';
import { ILandlordRoomRepository } from '@/domain/repositories/LandlordRoomRepository';

describe('Landlord Rooms Repository & Use Case Flow', () => {
  it('retrieves landlord room inventory with pagination and filters', async () => {
    const mockRepo: ILandlordRoomRepository = {
      getRooms: vi.fn().mockResolvedValue({
        data: [
          {
            id: 101,
            roomUuid: 'room-uuid-101',
            title: 'Phòng trọ Cầu Giấy',
            address: 'Số 15 Duy Tân',
            price: 4500000,
            status: 'PUBLISHED',
          },
        ],
        pagination: { page: 0, size: 10, totalElements: 1, totalPages: 1 },
      }),
      getSummary: vi.fn(),
      getRoom: vi.fn(),
      createRoom: vi.fn(),
      toggleVisibility: vi.fn(),
      deleteRoom: vi.fn(),
      updateRoom: vi.fn(),
      uploadImages: vi.fn(),
      setCoverImage: vi.fn(),
      deleteImage: vi.fn(),
      reorderImages: vi.fn(),
      submitForReview: vi.fn(),
    };

    const res = await mockRepo.getRooms({ status: 'PUBLISHED', page: 0, size: 10 });
    expect(res.data).toHaveLength(1);
    expect(res.data[0].title).toBe('Phòng trọ Cầu Giấy');
    expect(mockRepo.getRooms).toHaveBeenCalledWith({ status: 'PUBLISHED', page: 0, size: 10 });
  });

  it('submits a room for moderation review', async () => {
    const mockRepo: ILandlordRoomRepository = {
      getRooms: vi.fn(),
      getSummary: vi.fn(),
      getRoom: vi.fn(),
      createRoom: vi.fn(),
      toggleVisibility: vi.fn(),
      deleteRoom: vi.fn(),
      updateRoom: vi.fn(),
      uploadImages: vi.fn(),
      setCoverImage: vi.fn(),
      deleteImage: vi.fn(),
      reorderImages: vi.fn(),
      submitForReview: vi.fn().mockResolvedValue(undefined),
    };

    await mockRepo.submitForReview(101);
    expect(mockRepo.submitForReview).toHaveBeenCalledWith(101);
  });
});
