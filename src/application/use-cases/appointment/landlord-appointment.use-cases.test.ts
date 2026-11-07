import { describe, it, expect, vi } from 'vitest';
import {
  GetLandlordAppointmentsUseCase,
  GetAppointmentSummaryUseCase,
  GetAppointmentDetailUseCase,
  ConfirmAppointmentUseCase,
  CancelAppointmentUseCase,
  CompleteAppointmentUseCase,
} from './landlord-appointment.use-cases';
import { ILandlordAppointmentRepository } from '@/domain/repositories/AppointmentRepository';

describe('Landlord Appointment Use Cases', () => {
  const mockRepo: ILandlordAppointmentRepository = {
    getAppointments: vi.fn(),
    getSummary: vi.fn(),
    getDetail: vi.fn(),
    confirm: vi.fn(),
    cancel: vi.fn(),
    complete: vi.fn(),
  };

  it('GetLandlordAppointmentsUseCase calls repository.getAppointments', async () => {
    const useCase = new GetLandlordAppointmentsUseCase(mockRepo);
    await useCase.execute({ status: 'PENDING', page: 0, size: 10 });
    expect(mockRepo.getAppointments).toHaveBeenCalledWith({ status: 'PENDING', page: 0, size: 10 });
  });

  it('GetAppointmentSummaryUseCase calls repository.getSummary', async () => {
    const useCase = new GetAppointmentSummaryUseCase(mockRepo);
    await useCase.execute();
    expect(mockRepo.getSummary).toHaveBeenCalled();
  });

  it('ConfirmAppointmentUseCase calls repository.confirm', async () => {
    const useCase = new ConfirmAppointmentUseCase(mockRepo);
    await useCase.execute('appt-01', { force: true, landlordNote: 'OK' });
    expect(mockRepo.confirm).toHaveBeenCalledWith('appt-01', { force: true, landlordNote: 'OK' });
  });

  it('CancelAppointmentUseCase calls repository.cancel', async () => {
    const useCase = new CancelAppointmentUseCase(mockRepo);
    await useCase.execute('appt-01', { reasonCode: 'BUSY', reasonNote: 'Ban viec' });
    expect(mockRepo.cancel).toHaveBeenCalledWith('appt-01', { reasonCode: 'BUSY', reasonNote: 'Ban viec' });
  });

  it('CompleteAppointmentUseCase calls repository.complete', async () => {
    const useCase = new CompleteAppointmentUseCase(mockRepo);
    await useCase.execute('appt-01', { outcome: 'COMPLETED', note: 'Done' });
    expect(mockRepo.complete).toHaveBeenCalledWith('appt-01', { outcome: 'COMPLETED', note: 'Done' });
  });
});
