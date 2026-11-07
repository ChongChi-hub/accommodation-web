import { ILandlordAppointmentRepository } from '@/domain/repositories/AppointmentRepository';
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

export class GetLandlordAppointmentsUseCase {
  constructor(private readonly repository: ILandlordAppointmentRepository) {}

  async execute(
    params: AppointmentFilterParams
  ): Promise<{ data: ViewingAppointmentItem[]; pagination: Pagination }> {
    return this.repository.getAppointments(params);
  }
}

export class GetAppointmentSummaryUseCase {
  constructor(private readonly repository: ILandlordAppointmentRepository) {}

  async execute(): Promise<AppointmentSummary> {
    return this.repository.getSummary();
  }
}

export class GetAppointmentDetailUseCase {
  constructor(private readonly repository: ILandlordAppointmentRepository) {}

  async execute(id: string): Promise<ViewingAppointmentDetail> {
    return this.repository.getDetail(id);
  }
}

export class ConfirmAppointmentUseCase {
  constructor(private readonly repository: ILandlordAppointmentRepository) {}

  async execute(
    id: string,
    payload: ConfirmAppointmentPayload
  ): Promise<ViewingAppointmentDetail> {
    return this.repository.confirm(id, payload);
  }
}

export class CancelAppointmentUseCase {
  constructor(private readonly repository: ILandlordAppointmentRepository) {}

  async execute(
    id: string,
    payload: CancelAppointmentPayload
  ): Promise<ViewingAppointmentDetail> {
    return this.repository.cancel(id, payload);
  }
}

export class CompleteAppointmentUseCase {
  constructor(private readonly repository: ILandlordAppointmentRepository) {}

  async execute(
    id: string,
    payload: CompleteAppointmentPayload
  ): Promise<ViewingAppointmentDetail> {
    return this.repository.complete(id, payload);
  }
}
