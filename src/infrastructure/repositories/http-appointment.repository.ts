import {
  ILandlordAppointmentRepository,
  ITenantAppointmentRepository,
  CreateAppointmentPayload,
} from '@/domain/repositories/AppointmentRepository';
import {
  ViewingAppointmentItem,
  ViewingAppointmentDetail,
  AppointmentSummary,
  AppointmentFilterParams,
  ConfirmAppointmentPayload,
  CancelAppointmentPayload,
  CompleteAppointmentPayload,
} from '@/domain/entities/ViewingAppointment';
import { Pagination } from '@/domain/repositories/LandlordRoomRepository';
import { ApiClient } from '../http/api-client';

export class HttpAppointmentRepository
  implements ILandlordAppointmentRepository, ITenantAppointmentRepository
{
  async getAppointments(
    params: AppointmentFilterParams
  ): Promise<{ data: ViewingAppointmentItem[]; pagination: Pagination }> {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.roomId) query.append('roomId', params.roomId);
    if (params.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params.dateTo) query.append('dateTo', params.dateTo);
    if (params.search) query.append('search', params.search);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortDirection) query.append('sortDirection', params.sortDirection);

    const qs = query.toString();
    const endpoint = `/landlord/appointments${qs ? `?${qs}` : ''}`;
    const envelope = await ApiClient.getEnvelope<ViewingAppointmentItem[]>(endpoint);

    const paginationRaw = envelope.pagination || {
      page: params.page || 0,
      size: params.size || 20,
      totalElements: envelope.data ? envelope.data.length : 0,
      totalPages: 1,
    };

    const pagination: Pagination = {
      page: paginationRaw.page ?? 0,
      size: paginationRaw.size ?? (paginationRaw.limit ?? 20),
      totalElements:
        paginationRaw.totalElements ??
        (paginationRaw.total ?? (envelope.data ? envelope.data.length : 0)),
      totalPages: paginationRaw.totalPages ?? 1,
    };

    return {
      data: envelope.data || [],
      pagination,
    };
  }

  async getSummary(): Promise<AppointmentSummary> {
    return ApiClient.get<AppointmentSummary>('/landlord/appointments/summary');
  }

  async getDetail(id: string): Promise<ViewingAppointmentDetail> {
    return ApiClient.get<ViewingAppointmentDetail>(`/landlord/appointments/${id}`);
  }

  async confirm(
    id: string,
    payload: ConfirmAppointmentPayload
  ): Promise<ViewingAppointmentDetail> {
    return ApiClient.post<ViewingAppointmentDetail>(
      `/landlord/appointments/${id}/confirm`,
      payload
    );
  }

  async cancel(
    id: string,
    payload: CancelAppointmentPayload
  ): Promise<ViewingAppointmentDetail> {
    return ApiClient.post<ViewingAppointmentDetail>(
      `/landlord/appointments/${id}/cancel`,
      payload
    );
  }

  async complete(
    id: string,
    payload: CompleteAppointmentPayload
  ): Promise<ViewingAppointmentDetail> {
    return ApiClient.post<ViewingAppointmentDetail>(
      `/landlord/appointments/${id}/complete`,
      payload
    );
  }

  async getTenantAppointments(
    page: number = 0,
    size: number = 20
  ): Promise<{ data: ViewingAppointmentItem[]; pagination: Pagination }> {
    const endpoint = `/tenant/appointments?page=${page}&size=${size}`;
    const envelope = await ApiClient.getEnvelope<ViewingAppointmentItem[]>(endpoint);

    const paginationRaw = envelope.pagination || {
      page,
      size,
      totalElements: envelope.data ? envelope.data.length : 0,
      totalPages: 1,
    };

    const pagination: Pagination = {
      page: paginationRaw.page ?? 0,
      size: paginationRaw.size ?? (paginationRaw.limit ?? 20),
      totalElements:
        paginationRaw.totalElements ??
        (paginationRaw.total ?? (envelope.data ? envelope.data.length : 0)),
      totalPages: paginationRaw.totalPages ?? 1,
    };

    return {
      data: envelope.data || [],
      pagination,
    };
  }

  async createAppointment(payload: CreateAppointmentPayload): Promise<ViewingAppointmentItem> {
    return ApiClient.post<ViewingAppointmentItem>('/tenant/appointments', payload);
  }

  async cancelTenantAppointment(
    id: string,
    payload?: CancelAppointmentPayload
  ): Promise<ViewingAppointmentItem> {
    return ApiClient.post<ViewingAppointmentItem>(
      `/tenant/appointments/${encodeURIComponent(id)}/cancel`,
      payload ?? { reasonCode: 'BUSY' }
    );
  }
}
