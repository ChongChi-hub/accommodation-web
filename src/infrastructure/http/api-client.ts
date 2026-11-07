import { ApiResponseDto } from '@/application/dto/auth.dto';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface ApiEnvelope<T> {
  message?: string;
  data: T;
  pagination?: {
    page: number;
    size?: number;
    limit?: number;
    totalElements?: number;
    total?: number;
    totalPages?: number;
  };
  errorCode?: string;
  errors?: string[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public errorCode: string = 'ERR_UNKNOWN',
    public statusCode: number = 500,
    public errors?: string[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private static token: string | null = null;
  private static isRefreshing = false;

  static setToken(token: string | null) {
    this.token = token;
  }

  static getToken(): string | null {
    return this.token;
  }

  static async requestEnvelope<T>(endpoint: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
    const token = this.getToken();
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers,
      });

      const json: ApiEnvelope<T> = await response.json().catch(() => ({
        message: 'Lỗi phản hồi từ máy chủ',
        data: null as any,
      }));

      if (!response.ok) {
        throw new ApiError(
          json.message || 'Lỗi xử lý yêu cầu',
          json.errorCode || 'ERR_HTTP_' + response.status,
          response.status,
          json.errors
        );
      }

      return json;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Lỗi kết nối mạng',
        'ERR_NETWORK',
        0
      );
    }
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const envelope = await this.requestEnvelope<T>(endpoint, options);
    return envelope.data;
  }

  static getEnvelope<T>(endpoint: string, options?: RequestInit): Promise<ApiEnvelope<T>> {
    return this.requestEnvelope<T>(endpoint, { ...options, method: 'GET' });
  }

  static get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  static post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? (body as BodyInit) : body ? JSON.stringify(body) : undefined,
    });
  }

  static put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? (body as BodyInit) : body ? JSON.stringify(body) : undefined,
    });
  }

  static patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? (body as BodyInit) : body ? JSON.stringify(body) : undefined,
    });
  }

  static delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

