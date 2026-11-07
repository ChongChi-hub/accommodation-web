export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role: string;
}

export interface ApiResponseDto<T> {
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errorCode?: string;
  errors?: string[];
}

