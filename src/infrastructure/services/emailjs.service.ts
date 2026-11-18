export const EMAILJS_CONFIG = {
  // Account 1: Register and Verify Email
  ACC1: {
    SERVICE_ID: 'service_cozynest',
    PUBLIC_KEY: 'Re_5YClSOUJvPTVQF',
    PRIVATE_KEY: 'qNyRWL93ZyFJgqNcgbMQ9',
    TEMPLATES: {
      REGISTER: 'template_91vlzrx',
      VERIFY_EMAIL: 'template_59nc5mf',
    },
  },
  // Account 2: Change Password OTP
  ACC2: {
    SERVICE_ID: 'service_pp9ykfq',
    PUBLIC_KEY: 'mhVhUeI-C6HkEfVNy',
    PRIVATE_KEY: 'lhAfrXJWJpwyWGhFxSHnY',
    TEMPLATES: {
      CHANGE_PASSWORD: 'template_30c269c',
    },
  },
};

export interface SendOtpParams {
  toName: string;
  toEmail: string;
  otpCode: string;
  expiryMinutes?: number;
}

export async function sendEmailJsRaw(
  serviceId: string,
  templateId: string,
  userId: string,
  accessToken: string,
  params: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: userId,
        accessToken: accessToken,
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
  return sendEmailJsRaw(
    EMAILJS_CONFIG.ACC1.SERVICE_ID,
    EMAILJS_CONFIG.ACC1.TEMPLATES.REGISTER,
    EMAILJS_CONFIG.ACC1.PUBLIC_KEY,
    EMAILJS_CONFIG.ACC1.PRIVATE_KEY,
    {
      to_name: params.toName || 'Quý khách',
      to_email: params.toEmail,
      otp_code: params.otpCode,
      expiry_minutes: String(params.expiryMinutes || 10),
    }
  );
}

export async function sendVerifyEmailOtpEmail(
  params: SendOtpParams
): Promise<{ success: boolean; error?: string }> {
  return sendEmailJsRaw(
    EMAILJS_CONFIG.ACC1.SERVICE_ID,
    EMAILJS_CONFIG.ACC1.TEMPLATES.VERIFY_EMAIL,
    EMAILJS_CONFIG.ACC1.PUBLIC_KEY,
    EMAILJS_CONFIG.ACC1.PRIVATE_KEY,
    {
      to_name: params.toName || 'Quý khách',
      to_email: params.toEmail,
      otp_code: params.otpCode,
      expiry_minutes: String(params.expiryMinutes || 10),
    }
  );
}

export async function sendChangePasswordOtpEmail(
  params: SendOtpParams
): Promise<{ success: boolean; error?: string }> {
  return sendEmailJsRaw(
    EMAILJS_CONFIG.ACC2.SERVICE_ID,
    EMAILJS_CONFIG.ACC2.TEMPLATES.CHANGE_PASSWORD,
    EMAILJS_CONFIG.ACC2.PUBLIC_KEY,
    EMAILJS_CONFIG.ACC2.PRIVATE_KEY,
    {
      to_name: params.toName || 'Quý khách',
      to_email: params.toEmail,
      otp_code: params.otpCode,
      expiry_minutes: String(params.expiryMinutes || 10),
    }
  );
}
