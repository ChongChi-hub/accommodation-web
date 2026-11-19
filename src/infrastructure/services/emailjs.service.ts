export type OtpEmailAction = 'REGISTER' | 'VERIFY_EMAIL' | 'CHANGE_PASSWORD';

export interface SendOtpParams {
  toName: string;
  toEmail: string;
  otpCode: string;
  expiryMinutes?: number;
}

export async function sendEmailViaProxy(
  action: OtpEmailAction,
  params: SendOtpParams,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        toName: params.toName,
        toEmail: params.toEmail,
        otpCode: params.otpCode,
        expiryMinutes: params.expiryMinutes || 10,
      }),
    });

    const data = await res.json().catch(() => ({ success: false, error: 'Phản hồi không hợp lệ' }));
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || `Lỗi gửi email (HTTP ${res.status})` };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ gửi email';
    return { success: false, error: msg };
  }
}

export async function sendRegisterOtpEmail(
  params: SendOtpParams,
): Promise<{ success: boolean; error?: string }> {
  return sendEmailViaProxy('REGISTER', params);
}

export async function sendVerifyEmailOtpEmail(
  params: SendOtpParams,
): Promise<{ success: boolean; error?: string }> {
  return sendEmailViaProxy('VERIFY_EMAIL', params);
}

export async function sendChangePasswordOtpEmail(
  params: SendOtpParams,
): Promise<{ success: boolean; error?: string }> {
  return sendEmailViaProxy('CHANGE_PASSWORD', params);
}
