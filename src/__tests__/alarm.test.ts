import { useAlarmRingingStore } from '../store/useAlarmRingingStore';
import { useFeedingStore } from '../store/useFeedingStore';
import { alarmAudioService } from '../services/alarmAudioService';
import { notificationService } from '../services/notificationService';

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

jest.mock('../services/notificationService', () => ({
  notificationService: {
    scheduleFeedingAlarm: jest.fn().mockResolvedValue({ notificationId: 'notif-1', targetTime: Date.now() + 10000 }),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
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

  it('silences active alarm and stops audio playback', async () => {
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
  });

  it('snoozes active alarm by stopping audio and rescheduling reminder', async () => {
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
    expect(postponeSpy).toHaveBeenCalledWith('baby-1', 'Liam', 15);
  });
});
