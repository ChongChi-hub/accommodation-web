import { ApiResponseDto } from '@/application/dto/auth.dto';

const BASE_URL =
  typeof window !== 'undefined'
    ? '/api/v1'
    : (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1');

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
    public errors?: string[],
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private static token: string | null = null;
  private static refreshPromise: Promise<boolean> | null = null;

  static setToken(token: string | null) {
    this.token = token;
  }

  static getToken(): string | null {
    return this.token;
  }

  private static clearSession() {
    this.setToken(null);
    if (typeof document !== 'undefined') {
      const isProduction = process.env.NODE_ENV === 'production';
      const secureFlag = isProduction ? '; Secure' : '';
      document.cookie = `cozynest_role=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
      localStorage.removeItem('cozynest_user');
      void fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' }).catch(() => undefined);
    }
  }

  private static async tryAutoRefresh(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        if (!res.ok) {
          this.clearSession();
          return false;
        }
        const json = await res.json().catch(() => null);
        const data = json?.data;
        if (data?.user) {
          localStorage.setItem('cozynest_user', JSON.stringify(data.user));
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
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

      if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
        const refreshed = await this.tryAutoRefresh();
        if (refreshed) {
          return this.requestEnvelope<T>(endpoint, options);
        }
      }

      const json: ApiEnvelope<T> = await response.json().catch(() => ({
        message: 'Lỗi phản hồi từ máy chủ',
        data: null as any,
      }));

      if (!response.ok) {
        const retryHeader = response.headers.get('Retry-After');
        const parsedRetry = retryHeader ? parseInt(retryHeader, 10) : NaN;
        throw new ApiError(
          json.message || 'Lỗi xử lý yêu cầu',
          json.errorCode || 'ERR_HTTP_' + response.status,
          response.status,
          json.errors,
          Number.isFinite(parsedRetry) && parsedRetry > 0 ? parsedRetry : undefined
        );
      }

      return json;
    } catch (error) {
      if (
        (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError') ||
        (error instanceof Error && error.name === 'AbortError')
      ) {
        throw error;
      }
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

  static async getBlob(endpoint: string, retryOn401 = true): Promise<Blob> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const response = await fetch(url, { headers, credentials: 'include' });
    if (response.status === 401 && retryOn401) {
      const refreshed = await this.tryAutoRefresh();
      if (refreshed) {
        return this.getBlob(endpoint, false);
      }
    }
    if (!response.ok) {
      throw new ApiError('Loi tai tep tin', 'ERR_FETCH_BLOB', response.status);
    }
    return response.blob();
  }
}

