import { RoomDto } from '@/application/dto/listing.dto';

export interface BookmarkStatus {
  roomId: number;
  isBookmarked: boolean;
  bookmarkCount: number;
}

export interface BookmarkPort {
  getMyBookmarks(): Promise<RoomDto[]>;
  getMyBookmarkedIds(): Promise<number[]>;
  getBookmarkStatus(roomId: number): Promise<BookmarkStatus>;
  addBookmark(roomId: number): Promise<BookmarkStatus>;
  removeBookmark(roomId: number): Promise<BookmarkStatus>;
}
