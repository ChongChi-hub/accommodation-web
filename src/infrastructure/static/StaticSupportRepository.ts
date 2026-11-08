import { SupportRepository } from '@/domain/repositories/SupportRepository';
import { SupportTicket, TicketMessage } from '@/domain/entities/SupportTicket';

export class StaticSupportRepository implements SupportRepository {
  private tickets: SupportTicket[] = [
    {
      id: 'TK-1001',
      userId: 'usr_tenant_1',
      userName: 'Nguyễn Văn Thuê',
      userEmail: 'tenant@cozynest.vn',
      userPhone: '0987654321',
      subject: 'Lỗi quét mã VietQR thanh toán tiền phòng tháng 11',
      category: 'PAYMENT',
      priority: 'HIGH',
      status: 'OPEN',
      description: 'Khi bấm quét mã VietQR ngân hàng báo không tìm thấy thông tin số tài khoản của chủ trọ, xin hỗ trợ kiểm tra.',
      messages: [
        {
          id: 'msg-1',
          senderId: 'usr_tenant_1',
          senderName: 'Nguyễn Văn Thuê',
          senderRole: 'USER',
          message: 'Tôi đã thử quét qua app Vietcombank và MBBank nhưng đều báo lỗi chuỗi thanh toán.',
          createdAt: '2026-11-06T10:15:00Z',
        },
      ],
      createdAt: '2026-11-06T10:15:00Z',
      updatedAt: '2026-11-06T10:15:00Z',
    },
    {
      id: 'TK-1002',
      userId: 'usr_landlord_1',
      userName: 'Trần Thị Chủ Trọ',
      userEmail: 'landlord@cozynest.vn',
      userPhone: '0912345678',
      subject: 'Yêu cầu hỗ trợ hướng dẫn ký hợp đồng điện tử bằng OTP',
      category: 'CONTRACT',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      description: 'Tôi muốn biết sau khi người thuê ký thì hợp đồng có giá trị pháp lý ra sao và tải file PDF ở đâu?',
      assignedTo: 'admin_1',
      assignedAgentName: 'Quản Trị Viên',
      messages: [
        {
          id: 'msg-2',
          senderId: 'usr_landlord_1',
          senderName: 'Trần Thị Chủ Trọ',
          senderRole: 'USER',
          message: 'Hợp đồng điện tử ký trên sàn Tổ Ấm có tích hợp chứng thư số không?',
          createdAt: '2026-11-05T14:30:00Z',
        },
        {
          id: 'msg-3',
          senderId: 'admin_1',
          senderName: 'Quản Trị Viên',
          senderRole: 'ADMIN',
          message: 'Chào chị Trần, hợp đồng điện tử trên Tổ Ấm được xác thực qua OTP số điện thoại và có đóng dấu mộc số timestamp hợp pháp theo Luật Giao dịch điện tử 2023.',
          createdAt: '2026-11-05T15:00:00Z',
        },
      ],
      createdAt: '2026-11-05T14:30:00Z',
      updatedAt: '2026-11-05T15:00:00Z',
    },
    {
      id: 'TK-1003',
      userId: 'usr_tenant_2',
      userName: 'Lê Hoàng Minh',
      userEmail: 'minh.le@gmail.com',
      userPhone: '0933456789',
      subject: 'Khiếu nại chủ trọ không trả lại 100% tiền cọc',
      category: 'VIOLATION',
      priority: 'URGENT',
      status: 'RESOLVED',
      description: 'Tôi đã bàn giao phòng sạch sẽ đúng hạn nhưng chủ trọ trừ 500k tiền vệ sinh vô lý.',
      assignedTo: 'admin_1',
      assignedAgentName: 'Quản Trị Viên',
      messages: [
        {
          id: 'msg-4',
          senderId: 'usr_tenant_2',
          senderName: 'Lê Hoàng Minh',
          senderRole: 'USER',
          message: 'Kèm theo video quay lại hiện trạng phòng lúc bàn giao.',
          createdAt: '2026-11-01T08:00:00Z',
        },
        {
          id: 'msg-5',
          senderId: 'admin_1',
          senderName: 'Quản Trị Viên',
          senderRole: 'ADMIN',
          message: 'Tổ Ấm đã làm việc với chủ trọ và hoàn trả lại 500.000 đ vào ví của bạn thành công.',
          createdAt: '2026-11-02T11:20:00Z',
        },
      ],
      createdAt: '2026-11-01T08:00:00Z',
      updatedAt: '2026-11-02T11:20:00Z',
      resolvedAt: '2026-11-02T11:20:00Z',
    },
  ];

  async getTickets(filters?: { userId?: string; status?: string; category?: string }): Promise<SupportTicket[]> {
    let result = [...this.tickets];
    if (filters?.userId) result = result.filter((t) => t.userId === filters.userId);
    if (filters?.status) result = result.filter((t) => t.status === filters.status);
    if (filters?.category) result = result.filter((t) => t.category === filters.category);
    return result;
  }

  async getTicketById(id: string): Promise<SupportTicket | null> {
    return this.tickets.find((t) => t.id === id) || null;
  }

  async createTicket(data: Omit<SupportTicket, 'id' | 'messages' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      ...data,
      id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tickets.unshift(newTicket);
    return newTicket;
  }

  async addMessage(ticketId: string, message: Omit<TicketMessage, 'id' | 'createdAt'>): Promise<TicketMessage> {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error('Không tìm thấy phiếu yêu cầu');

    const newMsg: TicketMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    ticket.messages.push(newMsg);
    ticket.updatedAt = new Date().toISOString();
    return newMsg;
  }

  async updateStatus(ticketId: string, status: SupportTicket['status']): Promise<void> {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error('Không tìm thấy phiếu yêu cầu');
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
  }
}

