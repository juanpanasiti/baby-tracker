import { create } from 'zustand';
import { appointmentRepository } from '../db/repositories/appointmentRepository';
import { notificationService } from '../services/notificationService';
import { calendarService } from '../services/calendarService';
import { type Appointment, type NewAppointment } from '../db/schema';

interface CreateAppointmentParams extends Omit<NewAppointment, 'id' | 'createdAt' | 'babyId' | 'calendarEventId' | 'reminderNotificationId'> {
  syncToCalendar?: boolean;
  remind24h?: boolean;
  remind2h?: boolean;
}

interface AppointmentState {
  appointments: Appointment[];
  nextAppointment: Appointment | null;
  isLoading: boolean;
  isAppointmentModalOpen: boolean;
  editingAppointment: Appointment | null;

  loadAppointments: (babyId: string) => Promise<void>;
  createAppointment: (babyId: string, params: CreateAppointmentParams) => Promise<Appointment>;
  deleteAppointment: (babyId: string, id: string) => Promise<void>;
  openAppointmentModal: (appointmentToEdit?: Appointment) => void;
  closeAppointmentModal: () => void;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  nextAppointment: null,
  isLoading: false,
  isAppointmentModalOpen: false,
  editingAppointment: null,

  loadAppointments: async (babyId: string) => {
    set({ isLoading: true });
    try {
      const appointments = await appointmentRepository.getAppointmentsByBabyId(babyId);
      const nextAppointment = await appointmentRepository.getNextAppointment(babyId);
      set({ appointments, nextAppointment, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createAppointment: async (babyId: string, params) => {
    let calendarEventId: string | null = null;
    let reminderNotificationId: string | null = null;

    // Optional Native Calendar Sync
    if (params.syncToCalendar) {
      calendarEventId = await calendarService.addEventToCalendar(
        params.title,
        params.appointmentDate,
        params.appointmentDate + 60 * 60 * 1000,
        params.location || undefined,
        params.notes || undefined
      );
    }

    // Optional Advance Notifications (24h and/or 2h before)
    if (params.remind24h) {
      reminderNotificationId = await notificationService.scheduleAppointmentReminder(
        params.title,
        params.doctorName || 'Pediatrician',
        params.appointmentDate,
        24 * 60 // 24 hours
      );
    }

    if (params.remind2h) {
      const notif2h = await notificationService.scheduleAppointmentReminder(
        params.title,
        params.doctorName || 'Pediatrician',
        params.appointmentDate,
        2 * 60 // 2 hours
      );
      if (!reminderNotificationId) reminderNotificationId = notif2h;
    }

    const created = await appointmentRepository.createAppointment({
      babyId,
      title: params.title,
      doctorName: params.doctorName,
      specialty: params.specialty,
      appointmentDate: params.appointmentDate,
      location: params.location,
      notes: params.notes,
      calendarEventId,
      reminderNotificationId,
    });

    await get().loadAppointments(babyId);
    set({ isAppointmentModalOpen: false, editingAppointment: null });
    return created;
  },

  deleteAppointment: async (babyId: string, id: string) => {
    const existing = get().appointments.find((a) => a.id === id);
    if (existing) {
      if (existing.reminderNotificationId) {
        await notificationService.cancelNotification(existing.reminderNotificationId);
      }
      if (existing.calendarEventId) {
        await calendarService.removeEventFromCalendar(existing.calendarEventId);
      }
    }
    await appointmentRepository.deleteAppointment(id);
    await get().loadAppointments(babyId);
  },

  openAppointmentModal: (appointmentToEdit) =>
    set({ isAppointmentModalOpen: true, editingAppointment: appointmentToEdit ?? null }),
  closeAppointmentModal: () => set({ isAppointmentModalOpen: false, editingAppointment: null }),
}));
