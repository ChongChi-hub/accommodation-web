'use client';

import React from 'react';
import { useLandlordAppointments } from '@/presentation/hooks/useLandlordAppointments';
import { AppointmentHeader } from '@/presentation/components/landlord/appointments/AppointmentHeader';
import { AppointmentFiltersBar } from '@/presentation/components/landlord/appointments/AppointmentFiltersBar';
import { AppointmentListView } from '@/presentation/components/landlord/appointments/AppointmentListView';
import { AppointmentByRoomView } from '@/presentation/components/landlord/appointments/AppointmentByRoomView';
import { AppointmentCalendarView } from '@/presentation/components/landlord/appointments/AppointmentCalendarView';
import { AppointmentDetailDrawer } from '@/presentation/components/landlord/appointments/AppointmentDetailDrawer';
import { ConfirmAppointmentModal } from '@/presentation/components/landlord/appointments/ConfirmAppointmentModal';
import { CancelAppointmentModal } from '@/presentation/components/landlord/appointments/CancelAppointmentModal';
import { CompleteAppointmentModal } from '@/presentation/components/landlord/appointments/CompleteAppointmentModal';
import { AddToGoogleCalendarModal } from '@/presentation/components/landlord/appointments/AddToGoogleCalendarModal';

export default function LandlordAppointmentsPage() {
  const {
    status,
    roomId,
    search,
    viewMode,
    appointments,
    pagination,
    summary,
    isLoading,
    selectedDetail,
    isDetailOpen,
    isDetailLoading,
    confirmTarget,
    cancelTarget,
    completeTarget,
    conflictWarning,
    calendarModalTarget,
    setCalendarModalTarget,
    handleStatusChange,
    handleRoomChange,
    handleSearchChange,
    handleViewModeChange,
    handlePageChange,
    openDetail,
    closeDetail,
    setConfirmTarget,
    setCancelTarget,
    setCompleteTarget,
    setConflictWarning,
    executeConfirm,
    executeCancel,
    executeComplete,
    refresh,
  } = useLandlordAppointments();

  const [completeOutcome, setCompleteOutcome] = React.useState<'COMPLETED' | 'NO_SHOW'>('COMPLETED');

  const handleOpenComplete = (
    item: Parameters<typeof setCompleteTarget>[0],
    defaultOutcome: 'COMPLETED' | 'NO_SHOW' = 'COMPLETED'
  ) => {
    setCompleteOutcome(defaultOutcome);
    setCompleteTarget(item);
  };

  // Extract unique room options for filter dropdown
  const roomOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    appointments.forEach((a) => {
      if (!map.has(a.roomId)) {
        map.set(a.roomId, a.roomTitle);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [appointments]);

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      <AppointmentHeader
        summary={summary}
        currentStatus={status}
        onStatusChange={handleStatusChange}
      />

      <AppointmentFiltersBar
        search={search}
        roomId={roomId}
        viewMode={viewMode}
        onSearchChange={handleSearchChange}
        onRoomChange={handleRoomChange}
        onViewModeChange={handleViewModeChange}
        onRefresh={refresh}
        roomOptions={roomOptions}
      />

      {viewMode === 'list' && (
        <AppointmentListView
          appointments={appointments}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onOpenDetail={openDetail}
          onOpenConfirm={(item) => {
            setConfirmTarget(item);
            setConflictWarning(null);
          }}
          onOpenCancel={setCancelTarget}
          onOpenComplete={handleOpenComplete}
        />
      )}

      {viewMode === 'by_room' && (
        <AppointmentByRoomView
          appointments={appointments}
          onOpenDetail={openDetail}
          onOpenConfirm={(item) => {
            setConfirmTarget(item);
            setConflictWarning(null);
          }}
          onOpenCancel={setCancelTarget}
          onOpenComplete={handleOpenComplete}
        />
      )}

      {viewMode === 'calendar' && (
        <AppointmentCalendarView
          appointments={appointments}
          onOpenDetail={openDetail}
        />
      )}

      <AppointmentDetailDrawer
        isOpen={isDetailOpen}
        isLoading={isDetailLoading}
        detail={selectedDetail}
        onClose={closeDetail}
        onOpenConfirm={(item) => {
          setConfirmTarget(item);
          setConflictWarning(null);
        }}
        onOpenCancel={setCancelTarget}
        onOpenComplete={handleOpenComplete}
      />

      <ConfirmAppointmentModal
        isOpen={!!confirmTarget}
        appointment={confirmTarget}
        conflictWarning={conflictWarning}
        onClose={() => {
          setConfirmTarget(null);
          setConflictWarning(null);
        }}
        onConfirm={executeConfirm}
      />

      <CancelAppointmentModal
        isOpen={!!cancelTarget}
        appointment={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancel={executeCancel}
      />

      <CompleteAppointmentModal
        isOpen={!!completeTarget}
        appointment={completeTarget}
        defaultOutcome={completeOutcome}
        onClose={() => setCompleteTarget(null)}
        onComplete={executeComplete}
      />

      <AddToGoogleCalendarModal
        isOpen={!!calendarModalTarget}
        appointment={calendarModalTarget}
        onClose={() => setCalendarModalTarget(null)}
      />
    </div>
  );
}
