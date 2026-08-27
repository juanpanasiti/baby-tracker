import { create } from 'zustand';
import { feedingRepository } from '../db/repositories/feedingRepository';
import { reminderRepository } from '../db/repositories/reminderRepository';
import { notificationService } from '../services/notificationService';
import { type Feeding, type NewFeeding, type Reminder } from '../db/schema';

interface FeedingState {
  feedings: Feeding[];
  latestFeeding: Feeding | null;
  activeReminder: Reminder | null;
  isLoading: boolean;
  isFeedingModalOpen: boolean;

  // Active Nursing Timer
  timerSide: 'left' | 'right' | 'both' | null;
  timerSeconds: number;
  isTimerRunning: boolean;

  // Reminder Prompt
  isReminderPromptOpen: boolean;
  savedFeedingTimestamp: number | null;

  // Actions
  loadFeedings: (babyId: string) => Promise<void>;
  createFeeding: (babyId: string, data: Omit<NewFeeding, 'id' | 'babyId'>) => Promise<Feeding>;
  deleteFeeding: (babyId: string, id: string) => Promise<void>;
  scheduleNextFeedingReminder: (babyId: string, babyName: string, intervalMinutes: number) => Promise<void>;
  cancelActiveReminder: (babyId: string) => Promise<void>;

  openFeedingModal: () => void;
  closeFeedingModal: () => void;
  closeReminderPrompt: () => void;

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

  timerSide: null,
  timerSeconds: 0,
  isTimerRunning: false,

  isReminderPromptOpen: false,
  savedFeedingTimestamp: null,

  loadFeedings: async (babyId: string) => {
    set({ isLoading: true });
    try {
      const feedings = await feedingRepository.getFeedingsByBabyId(babyId);
      const latestFeeding = await feedingRepository.getLatestFeeding(babyId);
      const activeReminder = await reminderRepository.getNextActiveFeedingReminder(babyId);
      set({ feedings, latestFeeding, activeReminder, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createFeeding: async (babyId: string, data) => {
    const created = await feedingRepository.createFeeding({
      ...data,
      babyId,
    });

    const feedings = await feedingRepository.getFeedingsByBabyId(babyId);
    set({
      feedings,
      latestFeeding: created,
      isFeedingModalOpen: false,
      isReminderPromptOpen: true,
      savedFeedingTimestamp: created.timestamp,
    });

    // Reset timer if it was running
    get().resetTimer();

    return created;
  },

  deleteFeeding: async (babyId: string, id: string) => {
    await feedingRepository.deleteFeeding(id);
    await get().loadFeedings(babyId);
  },

  scheduleNextFeedingReminder: async (babyId: string, babyName: string, intervalMinutes: number) => {
    const baseTime = get().savedFeedingTimestamp ?? Date.now();
    const { notificationId, targetTime } = await notificationService.scheduleFeedingAlarm(
      babyName,
      intervalMinutes,
      baseTime
    );

    // Deactivate previous feeding reminders
    await reminderRepository.deactivateRemindersByType(babyId, 'feeding');

    // Save new reminder record
    const reminder = await reminderRepository.createReminder({
      babyId,
      type: 'feeding',
      notificationId,
      targetTime,
      isActive: true,
    });

    set({ activeReminder: reminder, isReminderPromptOpen: false });
  },

  cancelActiveReminder: async (babyId: string) => {
    const current = get().activeReminder;
    if (current) {
      await notificationService.cancelNotification(current.notificationId);
      await reminderRepository.deactivateRemindersByType(babyId, 'feeding');
      set({ activeReminder: null });
    }
  },

  openFeedingModal: () => set({ isFeedingModalOpen: true }),
  closeFeedingModal: () => set({ isFeedingModalOpen: false }),
  closeReminderPrompt: () => set({ isReminderPromptOpen: false }),

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
