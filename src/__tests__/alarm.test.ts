import { useAlarmRingingStore } from '../store/useAlarmRingingStore';
import { useFeedingStore } from '../store/useFeedingStore';
import { useMedicationStore } from '../store/useMedicationStore';
import { alarmAudioService } from '../services/alarmAudioService';
import { notificationService } from '../services/notificationService';
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
    createFeeding: jest.fn().mockResolvedValue({ id: 'feed-1' }),
    updateFeeding: jest.fn().mockResolvedValue(undefined),
    deleteFeeding: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../db/repositories/medicationRepository', () => ({
  medicationRepository: {
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

describe('Alarm Ringing Store and Lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    });
  });

  it('triggers ringing alarm and invokes alarmAudioService with selected sound', async () => {
    await useAlarmRingingStore.getState().triggerAlarm('baby-1', 'Liam', 'digital');

    const state = useAlarmRingingStore.getState();
    expect(state.isAlarmRinging).toBe(true);
    expect(state.ringingBabyId).toBe('baby-1');
    expect(state.ringingBabyName).toBe('Liam');
    expect(state.ringingSound).toBe('digital');
    expect(state.ringingTimestamp).toBeGreaterThan(0);
    expect(alarmAudioService.startAlarm).toHaveBeenCalledWith('digital');
  });

  it('silences active alarm, stops audio playback, and clears Notifee foreground service', async () => {
    useAlarmRingingStore.setState({
      isAlarmRinging: true,
      ringingBabyId: 'baby-1',
      ringingBabyName: 'Liam',
      ringingSound: 'digital',
    });

    await useAlarmRingingStore.getState().silenceAlarm();

    const state = useAlarmRingingStore.getState();
    expect(state.isAlarmRinging).toBe(false);
    expect(alarmAudioService.stopAlarm).toHaveBeenCalled();
    expect(notifee.stopForegroundService).toHaveBeenCalled();
  });

  it('snoozes active alarm by stopping audio, clearing notifee, and rescheduling reminder', async () => {
    const postponeSpy = jest.spyOn(useFeedingStore.getState(), 'postponeActiveReminder').mockResolvedValue();

    useAlarmRingingStore.setState({
      isAlarmRinging: true,
      ringingBabyId: 'baby-1',
      ringingBabyName: 'Liam',
      ringingSound: 'digital',
    });

    await useAlarmRingingStore.getState().snoozeAlarm(15);

    const state = useAlarmRingingStore.getState();
    expect(state.isAlarmRinging).toBe(false);
    expect(alarmAudioService.stopAlarm).toHaveBeenCalled();
    expect(notifee.stopForegroundService).toHaveBeenCalled();
    expect(postponeSpy).toHaveBeenCalledWith('baby-1', 'Liam', 15);
  });

  it('handles medication alarm triggering and logs dose', async () => {
    const logDoseSpy = jest.spyOn(useMedicationStore.getState(), 'logDose').mockResolvedValue({ id: 'log-1' } as any);

    await useAlarmRingingStore.getState().triggerAlarm({
      babyId: 'baby-1',
      babyName: 'Liam',
      alarmType: 'medication',
      medicationId: 'med-paracetamol',
      medicationName: 'Paracetamol',
      dosage: '2.5 ml',
      soundName: 'bells',
    });

    const state = useAlarmRingingStore.getState();
    expect(state.isAlarmRinging).toBe(true);
    expect(state.alarmType).toBe('medication');
    expect(state.medicationId).toBe('med-paracetamol');
    expect(state.medicationName).toBe('Paracetamol');

    await useAlarmRingingStore.getState().takeMedicationDose();

    expect(useAlarmRingingStore.getState().isAlarmRinging).toBe(false);
    expect(alarmAudioService.stopAlarm).toHaveBeenCalled();
    expect(notifee.stopForegroundService).toHaveBeenCalled();
    expect(logDoseSpy).toHaveBeenCalledWith('med-paracetamol');
  });

  it('schedules persistent looping feeding alarm via notificationService', async () => {
    const target = Date.now() + 120000;
    const result = await notificationService.scheduleFeedingAlarm('Liam', target, 0, {
      isExactTimestamp: true,
      alertMode: 'alarm',
      soundName: 'digital',
      babyId: 'baby-1',
    });

    expect(result.notificationId).toBeDefined();
    expect(result.targetTime).toBe(target);
    expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        android: expect.objectContaining({
          channelId: 'feeding-alarms',
          loopSound: true,
          asForegroundService: true,
          fullScreenAction: expect.objectContaining({ id: 'default' }),
        }),
      }),
      expect.objectContaining({
        type: 0, // TriggerType.TIMESTAMP
        timestamp: target,
      })
    );
  });
});

