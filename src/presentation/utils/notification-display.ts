import { APP_ROUTES } from '@/shared/routes';
import { UserRole } from '@/domain/entities/User';

export function resolveNotificationLink(
  link: string | null | undefined,
  role: UserRole | null
): string {
  if (!link || link === '/dashboard') {
    return role === 'LANDLORD' ? APP_ROUTES.landlordHome : APP_ROUTES.tenantHome;
  }
  if (
    link.startsWith('/dashboard/landlord') ||
    link.startsWith('/dashboard/tenant') ||
    link.startsWith('/dashboard/admin') ||
    link.startsWith('/dashboard/moderator')
  ) {
    return link;
  }
  const prefix = role === 'LANDLORD' ? '/dashboard/landlord' : '/dashboard/tenant';
  if (link.startsWith('/dashboard/')) {
    const sub = link.slice('/dashboard'.length);
    return `${prefix}${sub}`;
  }
  return link;
}

export function formatNotificationTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0 || isNaN(diffMs)) return '';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function cleanNotificationText(
  rawTitle: string | null | undefined,
  rawMessage: string | null | undefined
): { title: string; message: string } {
  let title = (rawTitle || 'Thông báo').trim();
  let message = (rawMessage || '').trim();

  // 1. Sanitize raw technical event titles
  if (title.includes('Cập nhật nghiệp vụ:') || title.startsWith('C?p nh?t nghi?p v?:')) {
    if (title.includes('TenantKycApproved') || title.includes('LandlordApproved')) {
      title = 'Hồ sơ eKYC đã được phê duyệt';
    } else if (title.includes('KycSubmitted')) {
      title = 'Đã gửi hồ sơ xác thực eKYC';
    } else if (title.includes('FaceVerificationPassed')) {
      title = 'Xác thực khuôn mặt thành công';
    } else if (title.includes('FaceVerificationFailed')) {
      title = 'Xác thực khuôn mặt không thành công';
    } else if (title.includes('PAYMENT_PAID') || title.includes('PAYMENT_CONFIRMED')) {
      title = 'Thanh toán thành công';
    } else if (title.includes('APPOINTMENT_CREATED')) {
      title = 'Có khách hẹn xem phòng mới';
    } else if (title.includes('APPOINTMENT_CONFIRMED')) {
      title = 'Lịch hẹn xem phòng đã được xác nhận';
    } else if (title.includes('APPOINTMENT_CANCELLED')) {
      title = 'Lịch hẹn xem phòng đã bị hủy';
    } else if (title.includes('APPOINTMENT_COMPLETED')) {
      title = 'Lịch hẹn xem phòng đã hoàn thành';
    } else if (title.includes('APPOINTMENT_EXPIRED')) {
      title = 'Lịch hẹn xem phòng đã hết hạn';
    } else if (title.includes('RENTAL_REQUEST_CREATED')) {
      title = 'Yêu cầu thuê phòng mới';
    } else if (title.includes('RENTAL_REQUEST_APPROVED')) {
      title = 'Yêu cầu thuê phòng đã được chấp thuận';
    } else if (title.includes('RENTAL_REQUEST_REJECTED')) {
      title = 'Yêu cầu thuê phòng bị từ chối';
    } else if (title.includes('CONTRACT_CREATED')) {
      title = 'Hợp đồng thuê phòng mới đã được tạo';
    } else if (title.includes('CONTRACT_SIGNED')) {
      title = 'Hợp đồng thuê phòng đã được ký kết';
    } else if (title.includes('CONTRACT_ACTIVATED')) {
      title = 'Hợp đồng thuê phòng đã có hiệu lực';
    } else if (title.includes('INVOICE_OVERDUE_REMINDER')) {
      title = 'Nhắc nhở thanh toán hóa đơn quá hạn';
    } else {
      title = 'Thông báo hệ thống Tổ Ấm';
    }
  }

  // 2. Sanitize raw entity UUIDs & technical codes in message
  const isKyc = message.includes('KYC_VERIFICATION') || title.includes('eKYC') || title.includes('CCCD');
  const isFace = message.includes('FACE_VERIFICATION') || title.includes('khuôn mặt');
  const isAppt = message.includes('APPOINTMENT') || title.includes('xem phòng') || title.includes('Lịch hẹn');
  const isRent = message.includes('RENTAL_REQUEST') || title.includes('thuê phòng');
  const isContract = message.includes('CONTRACT') || title.includes('hợp đồng') || title.includes('Hợp đồng');
  const isInvoice = message.includes('INVOICE') || title.includes('hóa đơn') || title.includes('thanh toán');

  if (isFace && (message.includes('#') || message.includes('Cập nhật'))) {
    message = title.includes('không') || title.includes('thất bại')
      ? 'Quá trình đối soát khuôn mặt chưa thành công. Vui lòng quay video trong môi trường đủ ánh sáng.'
      : 'Quá trình đối soát sinh trắc học khuôn mặt của bạn đã hoàn tất thành công.';
  } else if (isKyc && (message.includes('#') || message.includes('Cập nhật'))) {
    if (title.includes('phê duyệt') || title.includes('duyệt') || title.includes('Chủ trọ')) {
      message = 'Chúc mừng! Hồ sơ căn cước công dân gắn chip của bạn đã được phê duyệt thành công.';
    } else {
      message = 'Hồ sơ xác thực CCCD gắn chip của bạn đã được gửi. Vui lòng chờ kiểm duyệt viên phê duyệt trong ít phút.';
    }
  } else if (isAppt && (message.includes('#') || message.includes('Cập nhật'))) {
    if (title.includes('xác nhận')) {
      message = 'Lịch hẹn xem phòng của bạn đã được xác nhận. Vui lòng chuẩn bị và đến đúng thời gian đã hẹn.';
    } else if (title.includes('khách') || title.includes('mới')) {
      message = 'Bạn có một lịch hẹn xem phòng mới từ khách thuê. Vui lòng kiểm tra và xác nhận thời gian.';
    } else if (title.includes('hoàn thành')) {
      message = 'Buổi xem phòng đã hoàn tất thành công. Bạn có thể tiến hành các bước tiếp theo.';
    } else if (title.includes('hết hạn') || title.includes('hủy')) {
      message = 'Lịch hẹn xem phòng đã kết thúc hoặc được hủy theo quy định hệ thống.';
    } else {
      message = 'Lịch hẹn xem phòng của bạn đã có cập nhật trạng thái mới. Bấm để xem chi tiết.';
    }
  } else if (isRent && (message.includes('#') || message.includes('Cập nhật'))) {
    if (title.includes('chấp thuận') || title.includes('chấp nhận')) {
      message = 'Chủ trọ đã đồng ý yêu cầu thuê phòng của bạn. Hợp đồng điện tử đang được khởi tạo.';
    } else if (title.includes('từ chối')) {
      message = 'Rất tiếc, yêu cầu thuê phòng của bạn chưa được chủ trọ chấp thuận.';
    } else {
      message = 'Khách thuê đã gửi một yêu cầu thuê phòng mới. Vui lòng xem thông tin và phê duyệt.';
    }
  } else if (isContract && (message.includes('#') || message.includes('Cập nhật'))) {
    if (title.includes('ký')) {
      message = 'Hợp đồng thuê phòng đã được hoàn tất ký kết điện tử bởi các bên.';
    } else if (title.includes('hiệu lực')) {
      message = 'Hợp đồng thuê phòng đã chính thức được kích hoạt và có hiệu lực pháp lý.';
    } else {
      message = 'Hợp đồng thuê phòng mới đã được tạo. Vui lòng kiểm tra điều khoản và ký hợp đồng.';
    }
  } else if (isInvoice && (message.includes('#') || message.includes('Cập nhật'))) {
    message = 'Hóa đơn tiền phòng kỳ này đã được phát hành. Vui lòng kiểm tra và thanh toán đúng hạn.';
  } else if (message.includes('#') && (message.includes('Cập nhật') || message.includes('C?p nh?t'))) {
    message = 'Thông tin của bạn đã được cập nhật thành công trên hệ thống Tổ Ấm.';
  } else if ((title === 'Yêu cầu thuê phòng mới' || title.includes('thuê phòng mới')) && message && !message.startsWith('Khách thuê')) {
    message = `Khách thuê gửi lời nhắn: "${message}". Bấm để xem chi tiết.`;
  }

  return { title, message };
}

export type NotificationCategory = 'APPOINTMENT' | 'RENTAL_REQUEST' | 'CONTRACT' | 'INVOICE' | 'KYC' | 'GENERAL';

export function getNotificationCategory(notif: { title?: string; message?: string; link?: string; type?: string }): NotificationCategory {
  const link = (notif.link || '').toLowerCase();
  const title = (notif.title || '').toLowerCase();
  const rawType = (notif.type || '').toUpperCase();

  if (rawType === 'APPOINTMENT' || link.includes('appointment') || title.includes('hẹn xem phòng') || title.includes('lịch hẹn')) {
    return 'APPOINTMENT';
  }
  if (rawType === 'RENTAL_REQUEST' || link.includes('rental-request') || title.includes('thuê phòng')) {
    return 'RENTAL_REQUEST';
  }
  if (rawType === 'CONTRACT' || link.includes('contract') || title.includes('hợp đồng')) {
    return 'CONTRACT';
  }
  if (rawType === 'INVOICE' || rawType === 'PAYMENT' || link.includes('invoice') || title.includes('hóa đơn') || title.includes('thanh toán') || title.includes('tiền cọc')) {
    return 'INVOICE';
  }
  if (rawType === 'KYC' || rawType === 'KYC_VERIFICATION' || rawType === 'FACE_VERIFICATION' || link.includes('kyc') || title.includes('ekyc') || title.includes('cccd') || title.includes('khuôn mặt') || title.includes('chủ trọ')) {
    return 'KYC';
  }
  return 'GENERAL';
}
