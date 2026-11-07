import { ITenantAppointmentRepository } from '@/domain/repositories/AppointmentRepository';
import { ViewingAppointmentItem } from '@/domain/entities/ViewingAppointment';
import { Pagination } from '@/domain/repositories/LandlordRoomRepository';

export class GetTenantAppointmentsUseCase {
  constructor(private readonly repository: ITenantAppointmentRepository) {}

  async execute(
    page: number = 0,
    size: number = 20
  ): Promise<{ data: ViewingAppointmentItem[]; pagination: Pagination }> {
    return this.repository.getTenantAppointments(page, size);
  }
}
