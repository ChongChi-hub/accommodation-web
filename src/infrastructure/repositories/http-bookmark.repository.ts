import { BookmarkPort, BookmarkStatus } from '@/application/ports/bookmark.port';
import { RoomDto } from '@/application/dto/listing.dto';
import { ApiClient } from '../http/api-client';

export class HttpBookmarkRepository implements BookmarkPort {
  async getMyBookmarks(): Promise<RoomDto[]> {
    return ApiClient.get<RoomDto[]>('/bookmarks');
  }

  async getMyBookmarkedIds(): Promise<number[]> {
    return ApiClient.get<number[]>('/bookmarks/ids');
  }

  async getBookmarkStatus(roomId: number): Promise<BookmarkStatus> {
    return ApiClient.get<BookmarkStatus>(`/bookmarks/${roomId}/status`);
  }

  async addBookmark(roomId: number): Promise<BookmarkStatus> {
    return ApiClient.post<BookmarkStatus>(`/bookmarks/${roomId}`);
  }

  async removeBookmark(roomId: number): Promise<BookmarkStatus> {
    return ApiClient.delete<BookmarkStatus>(`/bookmarks/${roomId}`);
  }
}
