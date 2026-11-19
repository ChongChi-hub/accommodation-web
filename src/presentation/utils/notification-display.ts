import { UserRole } from '@/domain/entities/User';

function fixMojibake(str: string): string {
  if (!str) return '';
  if (/[\u00C0-\u00C3\u00C4\u00C5\u00C6\u00C7\u00C8\u00C9\u00CA\u00CB\u00CC\u00CD\u00CE\u00CF\u00D0\u00D1\u00D2\u00D3\u00D4\u00D5\u00D6\u00D8\u00D9\u00DA\u00DB\u00DC\u00DD\u00DE\u00DF\u00E0-\u00FF]/.test(str)) {
    try {
      const decoded = decodeURIComponent(escape(str));
      if (decoded && decoded !== str) return decoded;
    } catch {
      // Fallback: keep original if decoding fails
    }
  }
  return str;
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
  if (rawType === 'INVOICE' || rawType === 'PAYMENT' || rawType === 'ESCROW' || link.includes('invoice') || link.includes('deposit') || title.includes('hóa đơn') || title.includes('thanh toán') || title.includes('cọc')) {
    return 'INVOICE';
  }
  if (rawType === 'KYC' || rawType === 'KYC_VERIFICATION' || rawType === 'FACE_VERIFICATION' || link.includes('kyc') || title.includes('ekyc') || title.includes('cccd') || title.includes('khuôn mặt') || title.includes('chủ trọ')) {
    return 'KYC';
  }
  return 'GENERAL';
}

export function resolveNotificationLink(
  link: string | null | undefined,
  role: UserRole | null,
  context?: { title?: string; message?: string; type?: string }
): string {
  const prefix =
    role === 'ADMIN'
      ? '/dashboard/admin'
      : role === 'MODERATOR'
      ? '/dashboard/moderator'
      : role === 'LANDLORD'
      ? '/dashboard/landlord'
      : '/dashboard/tenant';

  const category = getNotificationCategory({
    title: context?.title,
    message: context?.message,
    link: link ?? undefined,
    type: context?.type,
  });

  if (!link || link === '/dashboard' || link === '/dashboard/') {
    switch (category) {
      case 'APPOINTMENT': return `${prefix}/appointments`;
      case 'RENTAL_REQUEST': return `${prefix}/rental-requests`;
      case 'CONTRACT': return `${prefix}/contracts`;
      case 'INVOICE': return `${prefix}/invoices`;
      case 'KYC':
        return role === 'ADMIN' || role === 'MODERATOR'
          ? '/dashboard/moderator/kyc'
          : `${prefix}/kyc`;
      default: return prefix;
    }
  }

  // Cross-role rewrite if notification contains mismatched role prefix
  if (role === 'TENANT' && link.startsWith('/dashboard/landlord/')) {
    return `/dashboard/tenant${link.slice('/dashboard/landlord'.length)}`;
  }
  if (role === 'LANDLORD' && link.startsWith('/dashboard/tenant/')) {
    return `/dashboard/landlord${link.slice('/dashboard/tenant'.length)}`;
  }
  if ((role === 'ADMIN' || role === 'MODERATOR') && link.includes('/kyc')) {
    return '/dashboard/moderator/kyc';
  }

  if (
    link.startsWith('/dashboard/landlord') ||
    link.startsWith('/dashboard/tenant') ||
    link.startsWith('/dashboard/admin') ||
    link.startsWith('/dashboard/moderator')
  ) {
    return link;
  }

  if (link.startsWith('/dashboard/')) {
    return `${prefix}${link.slice('/dashboard'.length)}`;
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
  let title = fixMojibake((rawTitle || 'Thông báo').trim());
  let message = fixMojibake((rawMessage || '').trim());

  // 1. Sanitize raw technical event titles
  if (title.includes('Cập nhật nghiệp vụ:') || title.startsWith('C?p nh?t nghi?p v?:') || title.includes('UserRegistered')) {
    if (title.includes('UserRegistered')) {
      title = 'Chào mừng bạn đến với Tổ Ấm';
    } else if (title.includes('TenantKycApproved') || title.includes('LandlordApproved')) {
      title = 'Hồ sơ eKYC đã được phê duyệt';
    } else if (title.includes('KycSubmitted')) {
      title = 'Đã gửi hồ sơ xác thực eKYC';
    } else if (title.includes('FaceVerificationPassed') || title.includes('FACE_VERIFIED')) {
      title = 'Xác thực khuôn mặt thành công';
    } else if (title.includes('FaceVerificationFailed') || title.includes('FACE_FAILED')) {
      title = 'Xác thực khuôn mặt không thành công';
    } else if (title.includes('PAYMENT_SETTLED') || title.includes('PAYMENT_CONFIRMED') || title.includes('PAYMENT_PAID')) {
      title = 'Thanh toán thành công';
    } else if (title.includes('APPOINTMENT_CREATED')) {
      title = 'Có khách hẹn xem phòng mới';
    } else if (title.includes('APPOINTMENT_CONFIRMED')) {
      title = 'Lịch hẹn xem phòng đã được xác nhận';
    } else if (title.includes('RENTAL_REQUEST_CREATED')) {
      title = 'Yêu cầu thuê phòng mới';
    } else if (title.includes('RENTAL_REQUEST_APPROVED')) {
      title = 'Yêu cầu thuê phòng đã được chấp thuận';
    } else if (title.includes('CONTRACT_ACTIVATED')) {
      title = 'Hợp đồng thuê phòng đã có hiệu lực';
    } else {
      title = 'Thông báo hệ thống Tổ Ấm';
    }
  }

  // 2. Sanitize raw technical messages
  if (message.includes('Trang thai ky quy') || (message.includes('CANCELLED') && message.includes('ky quy'))) {
    message = 'Yêu cầu ký quỹ tiền cọc phòng đã kết thúc hoặc bị hủy do quá hạn thanh toán.';
  } else if (message.includes('PAY-') || message.includes('trang thai PAID') || message.includes('PAYMENT_SETTLED')) {
    message = 'Giao dịch thanh toán tiền cọc/tiền phòng của bạn đã được ghi nhận thành công.';
  } else if (message.includes('UserRegistered') || message.includes('Tài khoản của bạn đã được khởi tạo')) {
    message = 'Chào mừng bạn đến với Tổ Ấm! Tài khoản đã sẵn sàng để tìm kiếm phòng hoặc đăng tin cho thuê.';
  } else if (message.includes('KYC_VERIFICATION') || message.includes('#fd91bd60') || (message.includes('Cập nhật') && message.includes('#'))) {
    if (title.includes('phê duyệt') || title.includes('duyệt') || title.includes('Chủ trọ')) {
      message = 'Chúc mừng! Hồ sơ căn cước công dân gắn chip của bạn đã được phê duyệt thành công.';
    } else {
      message = 'Hồ sơ xác thực CCCD gắn chip của bạn đã được tiếp nhận và kiểm duyệt thành công.';
    }
  } else if (message.startsWith('Mã hợp đồng: HD-')) {
    const code = message.replace('Mã hợp đồng:', '').trim();
    if (title.includes('hiệu lực')) {
      message = `Hợp đồng thuê phòng số ${code} đã chính thức có hiệu lực thi hành.`;
    } else if (title.includes('tải lên') || title.includes('quét')) {
      message = `Bản quét hợp đồng thuê phòng số ${code} đã được tải lên hệ thống lưu trữ.`;
    } else if (title.includes('ký')) {
      message = `Hợp đồng thuê phòng số ${code} đã được các bên hoàn tất ký kết điện tử.`;
    }
  } else if ((title.includes('xem phòng') || title.includes('Lịch hẹn')) && (message.includes('đã có cập nhật mới') || message.includes('chi tiết') || message.includes('va-demo-'))) {
    if (title.includes('xác nhận')) {
      message = 'Lịch hẹn xem phòng của bạn đã được xác nhận thành công. Vui lòng đến đúng ngày giờ đã hẹn.';
    } else if (title.includes('khách') || title.includes('mới')) {
      message = 'Bạn có một lịch hẹn xem phòng mới từ khách thuê. Vui lòng kiểm tra và xác nhận thời gian.';
    } else if (title.includes('hoàn thành')) {
      message = 'Buổi xem phòng đã hoàn tất thành công. Bạn có thể tiến hành gửi yêu cầu thuê phòng.';
    } else if (title.includes('hết hạn') || title.includes('hủy')) {
      message = 'Lịch hẹn xem phòng đã kết thúc hoặc quá hạn xác nhận theo quy định.';
    } else {
      message = 'Lịch hẹn xem phòng của bạn đã có cập nhật trạng thái mới. Bấm để xem chi tiết.';
    }
  } else if ((title.includes('thuê phòng') || title.includes('Yêu cầu')) && (message === 'xin vo phong nha ni' || message.includes('phản hồi mới') || message.includes('pháº£n há»“i'))) {
    if (title.includes('chấp thuận') || title.includes('chấp nhận')) {
      message = 'Chủ trọ đã đồng ý yêu cầu thuê phòng của bạn. Vui lòng xem hợp đồng và đặt cọc giữ chỗ.';
    } else if (title.includes('từ chối')) {
      message = 'Yêu cầu thuê phòng của bạn chưa được chủ trọ chấp thuận.';
    } else if (message === 'xin vo phong nha ni') {
      message = 'Khách thuê gửi lời nhắn: "xin vo phong nha ni". Bấm để xem thông tin và phê duyệt.';
    } else {
      message = 'Khách thuê đã gửi một yêu cầu thuê phòng mới. Vui lòng kiểm tra và phản hồi.';
    }
  }

  // Fallback: If message still contains a raw UUID with hash like #12345678-..., sanitize it
  if (/[#][0-9a-f]{8}-[0-9a-f]{4}/i.test(message)) {
    message = 'Thông tin của bạn đã được cập nhật thành công trên hệ thống Tổ Ấm.';
  }

  return { title, message };
}
