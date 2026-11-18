export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_cozynest',
  PUBLIC_KEY: 'Re_5YClSOUJvPTVQF',
  PRIVATE_KEY: 'qNyRWL93ZyFJgqNcgbMQ9',
  TEMPLATES: {
    REGISTER: 'template_91vlzrx',
    VERIFY_EMAIL: 'template_59nc5mf',
  },
};

export interface SendOtpParams {
  toName: string;
  toEmail: string;
  otpCode: string;
  expiryMinutes?: number;
}

export async function sendEmailJs(
  templateId: string,
  params: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.SERVICE_ID,
        template_id: templateId,
        user_id: EMAILJS_CONFIG.PUBLIC_KEY,
        accessToken: EMAILJS_CONFIG.PRIVATE_KEY,
        template_params: params,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Lỗi kết nối EmailJS');
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Không thể gửi email xác thực';
    return { success: false, error: msg };
  }
}

export async function sendRegisterOtpEmail(
  params: SendOtpParams
): Promise<{ success: boolean; error?: string }> {
  return sendEmailJs(EMAILJS_CONFIG.TEMPLATES.REGISTER, {
    to_name: params.toName || 'Quý khách',
    to_email: params.toEmail,
    otp_code: params.otpCode,
    expiry_minutes: String(params.expiryMinutes || 10),
  });
}

export async function sendVerifyEmailOtpEmail(
  params: SendOtpParams
): Promise<{ success: boolean; error?: string }> {
  return sendEmailJs(EMAILJS_CONFIG.TEMPLATES.VERIFY_EMAIL, {
    to_name: params.toName || 'Quý khách',
    to_email: params.toEmail,
    otp_code: params.otpCode,
    expiry_minutes: String(params.expiryMinutes || 10),
  });
}
