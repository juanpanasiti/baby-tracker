import { create } from 'zustand';
import { medicationRepository } from '../db/repositories/medicationRepository';
import { reminderRepository } from '../db/repositories/reminderRepository';
import { notificationService } from '../services/notificationService';
import { calculateNextMedicationDose } from '../utils/medicationSchedule';
import {
  type Medication,
  type NewMedication,
  type MedicationLog,
} from '../db/schema';
import { useBabyStore } from './useBabyStore';
import { syncBabyWidgetsData } from '../services/widgetSyncService';

export interface MedicationWithNextDose extends Medication {
  nextDoseTimestamp: number | null;
}

interface MedicationState {
  medications: Medication[];
  medicationLogs: MedicationLog[];
  isLoading: boolean;
  isMedicationModalOpen: boolean;
  editingMedication: Medication | null;
  isLogDoseModalOpen: boolean;
  selectedMedicationForLog: Medication | null;

  loadMedications: (babyId: string) => Promise<void>;
  loadMedicationLogs: (babyId: string) => Promise<void>;
  createMedication: (
    babyId: string,
    babyName: string,
    data: Omit<NewMedication, 'id' | 'createdAt' | 'updatedAt' | 'babyId'>
  ) => Promise<Medication>;
  updateMedication: (
    babyId: string,
    babyName: string,
    id: string,
    data: Partial<Omit<Medication, 'id' | 'createdAt' | 'babyId'>>
  ) => Promise<void>;
  toggleMedicationStatus: (
    babyId: string,
    babyName: string,
    id: string,
    newStatus: 'active' | 'paused' | 'finished'
  ) => Promise<void>;
  deleteMedication: (babyId: string, id: string) => Promise<void>;
  logDose: (
    medicationId: string,
    options?: { dosage?: string; notes?: string; timestamp?: number }
  ) => Promise<MedicationLog | null>;
  deleteMedicationLog: (babyId: string, logId: string) => Promise<void>;
  postponeReminder: (medicationId: string, minutes?: number) => Promise<void>;
  scheduleNextReminderForMedication: (
    babyName: string,
    medication: Medication,
    fromTimestamp?: number
  ) => Promise<void>;

  openMedicationModal: (medicationToEdit?: Medication) => void;
  closeMedicationModal: () => void;
  openLogDoseModal: (medication?: Medication) => void;
  closeLogDoseModal: () => void;
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: [],
  medicationLogs: [],
  isLoading: false,
  isMedicationModalOpen: false,
  editingMedication: null,
  isLogDoseModalOpen: false,
  selectedMedicationForLog: null,

  loadMedications: async (babyId: string) => {
    set({ isLoading: true });
    try {
      const medications = await medicationRepository.getMedicationsByBabyId(babyId);
      set({ medications, isLoading: false });
      syncBabyWidgetsData();
    } catch {
      set({ isLoading: false });
    }
  },

  loadMedicationLogs: async (babyId: string) => {
    try {
      const medicationLogs = await medicationRepository.getMedicationLogsByBabyId(babyId);
      set({ medicationLogs });
    } catch {
      // Ignored
    }
  },

  scheduleNextReminderForMedication: async (babyName: string, medication: Medication, fromTimestamp = Date.now()) => {
    if (medication.status !== 'active') return;

    const nextDose = calculateNextMedicationDose(medication, fromTimestamp);
    if (!nextDose) return;

    const result = await notificationService.scheduleMedicationAlarm(
      babyName,
      medication.name,
      nextDose,
      {
        dosage: medication.dosage || undefined,
        alertMode: (medication.alertMode as 'notification' | 'alarm') || 'alarm',
        soundName: medication.soundName || 'default',
        babyId: medication.babyId,
        medicationId: medication.id,
      }
    );

    if (result) {
      await reminderRepository.createReminder({
        babyId: medication.babyId,
        type: 'medication',
        targetTime: result.targetTime,
        notificationId: result.notificationId,
        alertMode: medication.alertMode || 'alarm',
        soundName: medication.soundName || 'default',
        isActive: true,
      });
    }
  },

  createMedication: async (babyId, babyName, data) => {
    const created = await medicationRepository.createMedication({
      ...data,
      babyId,
    });

    if (created.status === 'active') {
      await get().scheduleNextReminderForMedication(babyName, created);
    }

    await get().loadMedications(babyId);
    set({ isMedicationModalOpen: false, editingMedication: null });
    syncBabyWidgetsData();
    return created;
  },

  updateMedication: async (babyId, babyName, id, data) => {
    await medicationRepository.updateMedication(id, data);
    const updated = await medicationRepository.getMedicationById(id);

    if (updated) {
      if (updated.status === 'active') {
        await get().scheduleNextReminderForMedication(babyName, updated);
      }
    }

    await get().loadMedications(babyId);
    set({ isMedicationModalOpen: false, editingMedication: null });
    syncBabyWidgetsData();
  },

  toggleMedicationStatus: async (babyId, babyName, id, newStatus) => {
    await medicationRepository.updateMedication(id, { status: newStatus });
    const updated = await medicationRepository.getMedicationById(id);

    if (updated) {
      if (newStatus === 'active') {
        await get().scheduleNextReminderForMedication(babyName, updated);
      }
    }

    await get().loadMedications(babyId);
    syncBabyWidgetsData();
  },

  deleteMedication: async (babyId, id) => {
    await medicationRepository.deleteMedication(id);
    await get().loadMedications(babyId);
    syncBabyWidgetsData();
  },

  logDose: async (medicationId, options) => {
    const med = get().medications.find((m) => m.id === medicationId) ||
      (await medicationRepository.getMedicationById(medicationId));

    if (!med) return null;

    const logTimestamp = options?.timestamp || Date.now();
    const createdLog = await medicationRepository.createMedicationLog({
      babyId: med.babyId,
      medicationId: med.id,
      medicationName: med.name,
      dosage: options?.dosage !== undefined ? options.dosage : med.dosage,
      notes: options?.notes || null,
      timestamp: logTimestamp,
    });

    const currentBaby = useBabyStore.getState().baby;
    const babyName = currentBaby?.name || 'Baby';

    // Cancel any pending re-alert notifications for this medication
    await notificationService.cancelMedicationReAlerts(med.id);

    // If this medication alarm is currently ringing in full-screen modal, dismiss it
    const { useAlarmRingingStore } = require('./useAlarmRingingStore');
    const ringingStore = useAlarmRingingStore.getState();
    if (ringingStore.isAlarmRinging && ringingStore.medicationId === med.id) {
      const { alarmAudioService } = require('../services/alarmAudioService');
      await alarmAudioService.stopAlarm();
      useAlarmRingingStore.setState({ isAlarmRinging: false });
    }

    // Advance schedule for next reminder
    if (med.status === 'active') {
      await get().scheduleNextReminderForMedication(babyName, med, logTimestamp);
    }

    await Promise.all([get().loadMedications(med.babyId), get().loadMedicationLogs(med.babyId)]);
    set({ isLogDoseModalOpen: false, selectedMedicationForLog: null });
    syncBabyWidgetsData();
    return createdLog;
  },

  deleteMedicationLog: async (babyId, logId) => {
    await medicationRepository.deleteMedicationLog(logId);
    await get().loadMedicationLogs(babyId);
    syncBabyWidgetsData();
  },

  postponeReminder: async (medicationId, minutes = 15) => {
    const med = get().medications.find((m) => m.id === medicationId) ||
      (await medicationRepository.getMedicationById(medicationId));
    if (!med) return;

    const currentBaby = useBabyStore.getState().baby;
    const babyName = currentBaby?.name || 'Baby';
    const targetTime = Date.now() + minutes * 60 * 1000;

    const result = await notificationService.scheduleMedicationAlarm(
      babyName,
      med.name,
      targetTime,
      {
        dosage: med.dosage || undefined,
        alertMode: (med.alertMode as 'notification' | 'alarm') || 'alarm',
        soundName: med.soundName || 'default',
        babyId: med.babyId,
        medicationId: med.id,
      }
    );

    if (result) {
      await reminderRepository.createReminder({
        babyId: med.babyId,
        type: 'medication',
        targetTime: result.targetTime,
        notificationId: result.notificationId,
        alertMode: med.alertMode || 'alarm',
        soundName: med.soundName || 'default',
        isActive: true,
      });
    }

    syncBabyWidgetsData();
  },

  openMedicationModal: (medicationToEdit) =>
    set({ isMedicationModalOpen: true, editingMedication: medicationToEdit ?? null }),
  closeMedicationModal: () =>
    set({ isMedicationModalOpen: false, editingMedication: null }),

  openLogDoseModal: (medication) =>
    set({ isLogDoseModalOpen: true, selectedMedicationForLog: medication ?? null }),
  closeLogDoseModal: () =>
    set({ isLogDoseModalOpen: false, selectedMedicationForLog: null }),
}));
