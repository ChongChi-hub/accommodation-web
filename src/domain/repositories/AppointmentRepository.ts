import {
  ViewingAppointmentItem,
  ViewingAppointmentDetail,
  AppointmentSummary,
  AppointmentFilterParams,
  ConfirmAppointmentPayload,
  CancelAppointmentPayload,
  CompleteAppointmentPayload,
} from '../entities/ViewingAppointment';
import { Pagination } from './LandlordRoomRepository';

export interface ILandlordAppointmentRepository {
  getAppointments(
    params: AppointmentFilterParams
  ): Promise<{ data: ViewingAppointmentItem[]; pagination: Pagination }>;
  getSummary(): Promise<AppointmentSummary>;
  getDetail(id: string): Promise<ViewingAppointmentDetail>;
  confirm(
    id: string,
    payload: ConfirmAppointmentPayload
  ): Promise<ViewingAppointmentDetail>;
  cancel(
    id: string,
    payload: CancelAppointmentPayload
  ): Promise<ViewingAppointmentDetail>;
  complete(
    id: string,
    payload: CompleteAppointmentPayload
  ): Promise<ViewingAppointmentDetail>;
}

export interface ITenantAppointmentRepository {
  getTenantAppointments(
    page?: number,
    size?: number
  ): Promise<{ data: ViewingAppointmentItem[]; pagination: Pagination }>;
}
