import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpChatRepository } from '../http-chat.repository';
import { ApiClient } from '@/infrastructure/http/api-client';

describe('HttpChatRepository', () => {
  let repo: HttpChatRepository;

  beforeEach(() => {
    vi.restoreAllMocks();
    repo = new HttpChatRepository();
    vi.spyOn(ApiClient, 'getToken').mockReturnValue('mock-jwt-token');
  });

  it('fetches conversations from /chat/conversations and maps fields correctly', async () => {
    const mockData = [
      {
        id: 'conv-1',
        roomId: 'room-101',
        roomTitle: 'Phòng Cầu Giấy',
        lastMessageContent: 'Chào bạn',
        lastMessageTime: '2026-11-16T10:00:00Z',
        unreadCount: 2,
        otherParticipant: {
          userId: 'u-landlord-1',
          name: 'Trần Thị Chủ Trọ',
          role: 'LANDLORD',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        createdAt: '2026-11-16T09:00:00Z',
        updatedAt: '2026-11-16T10:00:00Z',
      },
    ];

    const getSpy = vi.spyOn(ApiClient, 'get').mockResolvedValue(mockData);

    const list = await repo.getConversations();

    expect(getSpy).toHaveBeenCalledWith('/chat/conversations');
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('conv-1');
    expect(list[0].roomTitle).toBe('Phòng Cầu Giấy');
    expect(list[0].otherParticipant?.name).toBe('Trần Thị Chủ Trọ');
    expect(list[0].unreadCount).toBe(2);
  });

  it('starts or gets conversation with recipient', async () => {
    const postSpy = vi.spyOn(ApiClient, 'post').mockResolvedValue({
      id: 'conv-new',
      roomId: 'room-202',
      roomTitle: 'Phòng Studio',
      unreadCount: 0,
      createdAt: '2026-11-16T12:00:00Z',
      updatedAt: '2026-11-16T12:00:00Z',
    });

    const res = await repo.startOrGetConversation({
      recipientId: 'u-landlord-2',
      recipientName: 'Lê Văn Hoàng',
      roomId: 'room-202',
      roomTitle: 'Phòng Studio',
      initialMessage: 'Xin chào',
    });

    expect(postSpy).toHaveBeenCalledWith(
      '/chat/conversations',
      expect.objectContaining({
        recipientId: 'u-landlord-2',
        roomId: 'room-202',
        initialMessage: 'Xin chào',
      })
    );
    expect(res.id).toBe('conv-new');
  });

  it('fetches messages and maps isMine and isRead', async () => {
    const mockMessages = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'u-tenant-1',
        senderName: 'Nguyễn Văn Thuê',
        content: 'Phòng còn không ạ?',
        type: 'TEXT',
        isRead: true,
        isMine: true,
        createdAt: '2026-11-16T10:00:00Z',
      },
    ];

    const getSpy = vi.spyOn(ApiClient, 'get').mockResolvedValue(mockMessages);

    const msgs = await repo.getMessages('conv-1', 20);

    expect(getSpy).toHaveBeenCalledWith('/chat/conversations/conv-1/messages?limit=20');
    expect(msgs).toHaveLength(1);
    expect(msgs[0].isMine).toBe(true);
    expect(msgs[0].content).toBe('Phòng còn không ạ?');
  });

  it('sends message via POST /chat/conversations/{id}/messages', async () => {
    const postSpy = vi.spyOn(ApiClient, 'post').mockResolvedValue({
      id: 'msg-new',
      conversationId: 'conv-1',
      senderId: 'u-tenant-1',
      content: 'Cảm ơn anh',
      type: 'TEXT',
      isRead: false,
      isMine: true,
      createdAt: '2026-11-16T10:05:00Z',
    });

    const msg = await repo.sendMessage({
      conversationId: 'conv-1',
      content: 'Cảm ơn anh',
    });

    expect(postSpy).toHaveBeenCalledWith(
      '/chat/conversations/conv-1/messages',
      expect.objectContaining({ content: 'Cảm ơn anh', type: 'TEXT' })
    );
    expect(msg.id).toBe('msg-new');
  });

  it('marks conversation as read via PATCH', async () => {
    const patchSpy = vi.spyOn(ApiClient, 'patch').mockResolvedValue({});

    await repo.markAsRead('conv-1');

    expect(patchSpy).toHaveBeenCalledWith('/chat/conversations/conv-1/read');
  });

  it('gets unread chat count from /chat/unread-count', async () => {
    const getSpy = vi.spyOn(ApiClient, 'get').mockResolvedValue({ count: 5 });

    const count = await repo.getUnreadCount();

    expect(getSpy).toHaveBeenCalledWith('/chat/unread-count');
    expect(count).toBe(5);
  });
});
