import { create } from 'zustand';
import { feedingRepository } from '../db/repositories/feedingRepository';
import { reminderRepository } from '../db/repositories/reminderRepository';
import { notificationService } from '../services/notificationService';
import { usePreferencesStore } from './usePreferencesStore';
import { type Feeding, type NewFeeding, type Reminder } from '../db/schema';

interface FeedingState {
  feedings: Feeding[];
  latestFeeding: Feeding | null;
  activeReminder: Reminder | null;
  isLoading: boolean;
  isFeedingModalOpen: boolean;
  editingFeeding: Feeding | null;
  initialFeedingType?: 'breast' | 'bottle';

  // Active Nursing Timer
  timerSide: 'left' | 'right' | 'both' | null;
  timerSeconds: number;
  isTimerRunning: boolean;

  // Reminder Prompt & Edit Modal
  isReminderPromptOpen: boolean;
  savedFeedingTimestamp: number | null;
  isEditReminderModalOpen: boolean;

  // Actions
  loadFeedings: (babyId: string) => Promise<void>;
  createFeeding: (babyId: string, data: Omit<NewFeeding, 'id' | 'babyId'>) => Promise<Feeding>;
  updateFeeding: (babyId: string, id: string, data: Partial<Omit<Feeding, 'id' | 'babyId'>>) => Promise<void>;
  deleteFeeding: (babyId: string, id: string) => Promise<void>;
  scheduleNextFeedingReminder: (
    babyId: string,
    babyName: string,
    intervalMinutesOrTimestamp: number,
    options?: { alertMode?: 'notification' | 'alarm'; isExactTimestamp?: boolean }
  ) => Promise<void>;
  postponeActiveReminder: (babyId: string, babyName: string, minutesToAdd: number) => Promise<void>;
  updateActiveReminder: (
    babyId: string,
    babyName: string,
    newTargetTime: number,
    alertMode: 'notification' | 'alarm'
  ) => Promise<void>;
  cancelActiveReminder: (babyId: string) => Promise<void>;
  cleanupStaleReminders: (babyId: string) => Promise<void>;

  openFeedingModal: (initialType?: 'breast' | 'bottle') => void;
  openEditFeedingModal: (feeding: Feeding) => void;
  closeFeedingModal: () => void;
  closeReminderPrompt: () => void;
  openEditReminderModal: () => void;
  closeEditReminderModal: () => void;

  // Timer controls
  startTimer: (side: 'left' | 'right' | 'both') => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
}

export const useFeedingStore = create<FeedingState>((set, get) => ({
  feedings: [],
  latestFeeding: null,
  activeReminder: null,
  isLoading: false,
  isFeedingModalOpen: false,

  editingFeeding: null,
  initialFeedingType: 'breast',

  timerSide: null,
  timerSeconds: 0,
  isTimerRunning: false,

  isReminderPromptOpen: false,
  savedFeedingTimestamp: null,
  isEditReminderModalOpen: false,

  cleanupStaleReminders: async (babyId: string) => {
    try {
      const expiredReminders = await reminderRepository.getExpiredActiveReminders(babyId);
      for (const expired of expiredReminders) {
        if (expired.notificationId) {
          await notificationService.cancelNotification(expired.notificationId);
        }
        await reminderRepository.deactivateReminder(expired.id);
      }
      const activeReminder = await reminderRepository.getNextActiveFeedingReminder(babyId);
      set({ activeReminder });
    } catch {
      // Ignored
    }
  },

  loadFeedings: async (babyId: string) => {
    set({ isLoading: true });
    try {
      // Clean up past-due reminders to cancel lingering OS notifications
      await get().cleanupStaleReminders(babyId);

      const feedings = await feedingRepository.getFeedingsByBabyId(babyId);
      const latestFeeding = await feedingRepository.getLatestFeeding(babyId);
      const activeReminder = await reminderRepository.getNextActiveFeedingReminder(babyId);
      set({ feedings, latestFeeding, activeReminder, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createFeeding: async (babyId: string, data) => {
    // Cancel any pending or re-alerting feeding reminder notifications
    const currentReminder = get().activeReminder;
    if (currentReminder) {
      if (currentReminder.notificationId) {
        await notificationService.cancelNotification(currentReminder.notificationId);
      }
      await reminderRepository.deactivateRemindersByType(babyId, 'feeding');
    }

    const created = await feedingRepository.createFeeding({
      ...data,
      babyId,
    });

    const feedings = await feedingRepository.getFeedingsByBabyId(babyId);
    set({
      feedings,
      latestFeeding: created,
      activeReminder: null,
      isFeedingModalOpen: false,
      editingFeeding: null,
      isReminderPromptOpen: true,
      savedFeedingTimestamp: created.timestamp,
    });

    // Reset timer if it was running
    get().resetTimer();

    return created;
  },

  updateFeeding: async (babyId: string, id: string, data) => {
    await feedingRepository.updateFeeding(id, data);
    await get().loadFeedings(babyId);
    set({ isFeedingModalOpen: false, editingFeeding: null });
  },

  deleteFeeding: async (babyId: string, id: string) => {
    await feedingRepository.deleteFeeding(id);
    await get().loadFeedings(babyId);
  },

  scheduleNextFeedingReminder: async (
    babyId: string,
    babyName: string,
    intervalMinutesOrTimestamp: number,
    options?: { alertMode?: 'notification' | 'alarm'; isExactTimestamp?: boolean }
  ) => {
    const alertMode = options?.alertMode || 'alarm';
    const alarmSound = usePreferencesStore.getState().alarmSound;
    const baseTime = options?.isExactTimestamp ? 0 : get().savedFeedingTimestamp ?? Date.now();

    const { notificationId, targetTime } = await notificationService.scheduleFeedingAlarm(
      babyName,
      intervalMinutesOrTimestamp,
      baseTime,
      {
        alertMode,
        soundName: alarmSound,
        isExactTimestamp: options?.isExactTimestamp,
        babyId,
      }
    );

    // Deactivate previous feeding reminders
    await reminderRepository.deactivateRemindersByType(babyId, 'feeding');

    // Save new reminder record
    const reminder = await reminderRepository.createReminder({
      babyId,
      type: 'feeding',
      notificationId,
      targetTime,
      alertMode,
      soundName: alarmSound,
      isActive: true,
    });

    set({ activeReminder: reminder, isReminderPromptOpen: false });
  },

  postponeActiveReminder: async (babyId: string, babyName: string, minutesToAdd: number) => {
    const current = get().activeReminder;
    if (!current || !current.isActive) return;

    if (current.notificationId) {
      await notificationService.cancelNotification(current.notificationId);
    }

    const newTargetTime = Math.max(Date.now() + 60000, current.targetTime + minutesToAdd * 60 * 1000);
    const alertMode = (current.alertMode as 'notification' | 'alarm') || 'alarm';
    const soundName = current.soundName || usePreferencesStore.getState().alarmSound;

    const { notificationId } = await notificationService.scheduleFeedingAlarm(
      babyName,
      newTargetTime,
      0,
      {
        alertMode,
        soundName,
        isExactTimestamp: true,
        babyId,
      }
    );

    await reminderRepository.updateReminder(current.id, {
      targetTime: newTargetTime,
      notificationId,
      alertMode,
      soundName,
    });

    const updated = await reminderRepository.getNextActiveFeedingReminder(babyId);
    set({ activeReminder: updated });
  },

  updateActiveReminder: async (
    babyId: string,
    babyName: string,
    newTargetTime: number,
    alertMode: 'notification' | 'alarm'
  ) => {
    const current = get().activeReminder;
    if (current?.notificationId) {
      await notificationService.cancelNotification(current.notificationId);
    }

    const soundName = usePreferencesStore.getState().alarmSound;
    const { notificationId } = await notificationService.scheduleFeedingAlarm(
      babyName,
      newTargetTime,
      0,
      {
        alertMode,
        soundName,
        isExactTimestamp: true,
        babyId,
      }
    );

    if (current) {
      await reminderRepository.updateReminder(current.id, {
        targetTime: newTargetTime,
        notificationId,
        alertMode,
        soundName,
        isActive: true,
      });
    } else {
      await reminderRepository.createReminder({
        babyId,
        type: 'feeding',
        targetTime: newTargetTime,
        notificationId,
        alertMode,
        soundName,
        isActive: true,
      });
    }

    const updated = await reminderRepository.getNextActiveFeedingReminder(babyId);
    set({ activeReminder: updated });
  },

  cancelActiveReminder: async (babyId: string) => {
    const current = get().activeReminder;
    if (current) {
      await notificationService.cancelNotification(current.notificationId);
      await reminderRepository.deactivateRemindersByType(babyId, 'feeding');
      set({ activeReminder: null });
    }
  },

  openFeedingModal: (initialType: 'breast' | 'bottle' = 'breast') =>
    set({ isFeedingModalOpen: true, editingFeeding: null, initialFeedingType: initialType }),
  openEditFeedingModal: (feeding: Feeding) => set({ isFeedingModalOpen: true, editingFeeding: feeding }),
  closeFeedingModal: () => set({ isFeedingModalOpen: false, editingFeeding: null }),
  closeReminderPrompt: () => set({ isReminderPromptOpen: false }),
  openEditReminderModal: () => set({ isEditReminderModalOpen: true }),
  closeEditReminderModal: () => set({ isEditReminderModalOpen: false }),

  startTimer: (side) => {
    set({ timerSide: side, isTimerRunning: true, timerSeconds: 0 });
  },

  pauseTimer: () => {
    set({ isTimerRunning: false });
  },

  resumeTimer: () => {
    set({ isTimerRunning: true });
  },

  resetTimer: () => {
    set({ isTimerRunning: false, timerSeconds: 0, timerSide: null });
  },

  tickTimer: () => {
    if (get().isTimerRunning) {
      set((state) => ({ timerSeconds: state.timerSeconds + 1 }));
    }
  },
}));
