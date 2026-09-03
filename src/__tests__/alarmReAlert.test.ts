import { useAlarmRingingStore } from '../store/useAlarmRingingStore';
import { useFeedingStore } from '../store/useFeedingStore';
import { useMedicationStore } from '../store/useMedicationStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { notificationService } from '../services/notificationService';
import { alarmAudioService } from '../services/alarmAudioService';
import { reminderRepository } from '../db/repositories/reminderRepository';
import { feedingRepository } from '../db/repositories/feedingRepository';
import { medicationRepository } from '../db/repositories/medicationRepository';
import notifee from '@notifee/react-native';

jest.mock('../db/client', () => ({
  initDatabase: jest.fn().mockResolvedValue(undefined),
  getDb: jest.fn().mockReturnValue({}),
}));

jest.mock('../db/repositories/babyRepository', () => ({
  babyRepository: {
    getBabyProfile: jest.fn().mockResolvedValue(null),
    createBabyProfile: jest.fn().mockResolvedValue({ id: 'baby-1', name: 'Liam' }),
    updateBabyProfile: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../services/alarmAudioService', () => ({
  alarmAudioService: {
    startAlarm: jest.fn().mockResolvedValue(undefined),
    stopAlarm: jest.fn().mockResolvedValue(undefined),
    isRinging: jest.fn().mockReturnValue(false),
  },
}));

jest.mock('../db/repositories/feedingRepository', () => ({
  feedingRepository: {
    getFeedingsByBabyId: jest.fn().mockResolvedValue([]),
    getLatestFeeding: jest.fn().mockResolvedValue(null),
    createFeeding: jest.fn().mockResolvedValue({ id: 'feed-1', timestamp: Date.now() }),
    updateFeeding: jest.fn().mockResolvedValue(undefined),
    deleteFeeding: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../db/repositories/medicationRepository', () => ({
  medicationRepository: {
    getMedicationById: jest.fn().mockResolvedValue({
      id: 'med-1',
      babyId: 'baby-1',
      name: 'Amoxicillin',
      dosage: '5ml',
      status: 'active',
      scheduleType: 'interval',
      intervalHours: 8,
      alertMode: 'alarm',
    }),
    getMedicationsByBabyId: jest.fn().mockResolvedValue([]),
    createMedication: jest.fn().mockResolvedValue({ id: 'med-1' }),
    updateMedication: jest.fn().mockResolvedValue(undefined),
    deleteMedication: jest.fn().mockResolvedValue(undefined),
    getMedicationLogsByBabyId: jest.fn().mockResolvedValue([]),
    createMedicationLog: jest.fn().mockResolvedValue({ id: 'log-1' }),
  },
}));

jest.mock('../db/repositories/reminderRepository', () => ({
  reminderRepository: {
    getNextActiveFeedingReminder: jest.fn().mockResolvedValue(null),
    getExpiredActiveReminders: jest.fn().mockResolvedValue([]),
    deactivateReminder: jest.fn().mockResolvedValue(undefined),
    deactivateRemindersByType: jest.fn().mockResolvedValue(undefined),
    createReminder: jest.fn().mockResolvedValue({ id: 'rem-1' }),
    updateReminder: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Persistent Alarm Re-Alert and Auto-Cancellation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePreferencesStore.setState({
      alarmNaggingEnabled: true,
      alarmNaggingInterval: 5,
      alarmNaggingMaxRepeats: null,
      alarmSound: 'digital',
    });

    useAlarmRingingStore.setState({
      isAlarmRinging: false,
      ringingBabyId: null,
      ringingBabyName: null,
      ringingSound: 'default',
      ringingTimestamp: 0,
      alarmType: 'feeding',
      medicationId: undefined,
      medicationName: undefined,
      dosage: undefined,
      isReAlert: false,
      repeatCount: 0,
      originalTargetTime: undefined,
    });
  });

  it('silenceAlarm automatically calls scheduleReAlertAlarm when nagging is enabled', async () => {
    const scheduleSpy = jest.spyOn(notificationService, 'scheduleReAlertAlarm').mockResolvedValue({
      notificationId: 'realert-feeding-baby-1-12345',
      targetTime: Date.now() + 5 * 60 * 1000,
    });

    useAlarmRingingStore.setState({
      isAlarmRinging: true,
      ringingBabyId: 'baby-1',
      ringingBabyName: 'Liam',
      ringingSound: 'digital',
      alarmType: 'feeding',
      repeatCount: 0,
      originalTargetTime: 100000,
    });

    await useAlarmRingingStore.getState().silenceAlarm();

    expect(useAlarmRingingStore.getState().isAlarmRinging).toBe(false);
    expect(alarmAudioService.stopAlarm).toHaveBeenCalled();
    expect(scheduleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'feeding',
        babyId: 'baby-1',
        babyName: 'Liam',
        repeatCount: 0,
        originalTargetTime: 100000,
      })
    );
    scheduleSpy.mockRestore();
  });

  it('scheduleReAlertAlarm respects max repeats limit', async () => {
    usePreferencesStore.setState({
      alarmNaggingEnabled: true,
      alarmNaggingMaxRepeats: 3,
    });

    // When repeatCount is already 3, it should return null without scheduling
    const result = await notificationService.scheduleReAlertAlarm({
      type: 'feeding',
      babyName: 'Liam',
      babyId: 'baby-1',
      repeatCount: 3,
    });

    expect(result).toBeNull();
  });

  it('scheduleReAlertAlarm returns null when nagging is disabled in preferences', async () => {
    usePreferencesStore.setState({
      alarmNaggingEnabled: false,
    });

    const result = await notificationService.scheduleReAlertAlarm({
      type: 'feeding',
      babyName: 'Liam',
      babyId: 'baby-1',
      repeatCount: 0,
    });

    expect(result).toBeNull();
  });

  it('dismissAlarm dismisses without scheduling re-alert and deactivates reminder', async () => {
    const cancelReminderSpy = jest.spyOn(useFeedingStore.getState(), 'cancelActiveReminder').mockResolvedValue();
    const scheduleSpy = jest.spyOn(notificationService, 'scheduleReAlertAlarm');

    useAlarmRingingStore.setState({
      isAlarmRinging: true,
      ringingBabyId: 'baby-1',
      ringingBabyName: 'Liam',
      alarmType: 'feeding',
    });

    await useAlarmRingingStore.getState().dismissAlarm();

    expect(useAlarmRingingStore.getState().isAlarmRinging).toBe(false);
    expect(alarmAudioService.stopAlarm).toHaveBeenCalled();
    expect(cancelReminderSpy).toHaveBeenCalledWith('baby-1');
    expect(scheduleSpy).not.toHaveBeenCalled();
  });

  it('createFeeding cancels pending reminder and deactivates lingering feeding alarms', async () => {
    const cancelSpy = jest.spyOn(notificationService, 'cancelNotification').mockResolvedValue();

    useFeedingStore.setState({
      activeReminder: {
        id: 'rem-active-1',
        babyId: 'baby-1',
        type: 'feeding',
        targetTime: Date.now() + 10000,
        notificationId: 'realert-feeding-baby-1-999',
        alertMode: 'alarm',
        soundName: 'default',
        isActive: true,
        createdAt: Date.now(),
      },
    });

    await useFeedingStore.getState().createFeeding('baby-1', {
      type: 'breast',
      breastSide: 'both',
      durationSeconds: 900,
      timestamp: Date.now(),
    });

    expect(cancelSpy).toHaveBeenCalledWith('realert-feeding-baby-1-999');
    expect(reminderRepository.deactivateRemindersByType).toHaveBeenCalledWith('baby-1', 'feeding');
    expect(useFeedingStore.getState().activeReminder).toBeNull();
  });

  it('logDose cancels pending medication re-alert notifications and stops audio', async () => {
    const cancelMedReAlertsSpy = jest.spyOn(notificationService, 'cancelMedicationReAlerts').mockResolvedValue();

    useAlarmRingingStore.setState({
      isAlarmRinging: true,
      alarmType: 'medication',
      medicationId: 'med-1',
    });

    await useMedicationStore.getState().logDose('med-1');

    expect(cancelMedReAlertsSpy).toHaveBeenCalledWith('med-1');
    expect(useAlarmRingingStore.getState().isAlarmRinging).toBe(false);
  });
});
