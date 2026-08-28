import { useFeedingStore } from '../store/useFeedingStore';
import { useDiaperStore } from '../store/useDiaperStore';
import { useAppointmentStore } from '../store/useAppointmentStore';
import { type Feeding, type Diaper, type Appointment } from '../db/schema';

// Mock repositories and services to test store state and logic
jest.mock('../db/repositories/feedingRepository', () => ({
  feedingRepository: {
    getFeedingsByBabyId: jest.fn().mockResolvedValue([]),
    getLatestFeeding: jest.fn().mockResolvedValue(null),
    createFeeding: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'feed-1', ...data })),
    updateFeeding: jest.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
    deleteFeeding: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../db/repositories/diaperRepository', () => ({
  diaperRepository: {
    getDiapersByBabyId: jest.fn().mockResolvedValue([]),
    getLatestDiaper: jest.fn().mockResolvedValue(null),
    createDiaper: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'diaper-1', ...data })),
    updateDiaper: jest.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
    deleteDiaper: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../db/repositories/appointmentRepository', () => ({
  appointmentRepository: {
    getAppointmentsByBabyId: jest.fn().mockResolvedValue([]),
    getNextAppointment: jest.fn().mockResolvedValue(null),
    createAppointment: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'appt-1', ...data })),
    deleteAppointment: jest.fn().mockResolvedValue(undefined),
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
    scheduleAppointmentReminder: jest.fn().mockResolvedValue('notif-appt-1'),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../services/calendarService', () => ({
  calendarService: {
    addEventToCalendar: jest.fn().mockResolvedValue('cal-event-1'),
    removeEventFromCalendar: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Feeding Store Editing and Custom Timestamps', () => {
  beforeEach(() => {
    useFeedingStore.setState({
      feedings: [],
      latestFeeding: null,
      isFeedingModalOpen: false,
      editingFeeding: null,
      isTimerRunning: false,
      timerSeconds: 0,
      timerSide: null,
    });
  });

  it('opens and closes feeding modal in creation mode with default breast type', () => {
    const store = useFeedingStore.getState();
    store.openFeedingModal();
    expect(useFeedingStore.getState().isFeedingModalOpen).toBe(true);
    expect(useFeedingStore.getState().editingFeeding).toBeNull();
    expect(useFeedingStore.getState().initialFeedingType).toBe('breast');

    useFeedingStore.getState().closeFeedingModal();
    expect(useFeedingStore.getState().isFeedingModalOpen).toBe(false);
    expect(useFeedingStore.getState().editingFeeding).toBeNull();
  });

  it('opens feeding modal in creation mode with bottle type', () => {
    const store = useFeedingStore.getState();
    store.openFeedingModal('bottle');
    expect(useFeedingStore.getState().isFeedingModalOpen).toBe(true);
    expect(useFeedingStore.getState().editingFeeding).toBeNull();
    expect(useFeedingStore.getState().initialFeedingType).toBe('bottle');

    useFeedingStore.getState().closeFeedingModal();
    expect(useFeedingStore.getState().isFeedingModalOpen).toBe(false);
  });

  it('opens feeding modal in edit mode with prefilled feeding record', () => {
    const mockFeeding: Feeding = {
      id: 'feed-123',
      babyId: 'baby-1',
      type: 'bottle',
      breastSide: null,
      durationSeconds: null,
      amountMl: 150,
      notes: 'Drank smoothly',
      timestamp: 1724700000000,
    };

    useFeedingStore.getState().openEditFeedingModal(mockFeeding);
    expect(useFeedingStore.getState().isFeedingModalOpen).toBe(true);
    expect(useFeedingStore.getState().editingFeeding).toEqual(mockFeeding);

    useFeedingStore.getState().closeFeedingModal();
    expect(useFeedingStore.getState().isFeedingModalOpen).toBe(false);
    expect(useFeedingStore.getState().editingFeeding).toBeNull();
  });

  it('updates existing feeding and closes modal', async () => {
    const mockFeeding: Feeding = {
      id: 'feed-123',
      babyId: 'baby-1',
      type: 'breast',
      breastSide: 'left',
      durationSeconds: 600,
      amountMl: null,
      notes: null,
      timestamp: 1724700000000,
    };

    useFeedingStore.getState().openEditFeedingModal(mockFeeding);
    await useFeedingStore.getState().updateFeeding('baby-1', 'feed-123', {
      durationSeconds: 900,
      notes: 'Updated note',
    });

    expect(useFeedingStore.getState().isFeedingModalOpen).toBe(false);
    expect(useFeedingStore.getState().editingFeeding).toBeNull();
  });
});

describe('Diaper Store Editing and Custom Timestamps', () => {
  beforeEach(() => {
    useDiaperStore.setState({
      diapers: [],
      latestDiaper: null,
      isDiaperModalOpen: false,
      editingDiaper: null,
    });
  });

  it('opens and closes diaper modal in creation mode', () => {
    useDiaperStore.getState().openDiaperModal();
    expect(useDiaperStore.getState().isDiaperModalOpen).toBe(true);
    expect(useDiaperStore.getState().editingDiaper).toBeNull();

    useDiaperStore.getState().closeDiaperModal();
    expect(useDiaperStore.getState().isDiaperModalOpen).toBe(false);
    expect(useDiaperStore.getState().editingDiaper).toBeNull();
  });

  it('opens diaper modal in edit mode with prefilled diaper record', () => {
    const mockDiaper: Diaper = {
      id: 'diaper-123',
      babyId: 'baby-1',
      type: 'both',
      hasRash: true,
      notes: 'Applied ointment',
      timestamp: 1724700000000,
    };

    useDiaperStore.getState().openEditDiaperModal(mockDiaper);
    expect(useDiaperStore.getState().isDiaperModalOpen).toBe(true);
    expect(useDiaperStore.getState().editingDiaper).toEqual(mockDiaper);

    useDiaperStore.getState().closeDiaperModal();
    expect(useDiaperStore.getState().isDiaperModalOpen).toBe(false);
    expect(useDiaperStore.getState().editingDiaper).toBeNull();
  });

  it('updates existing diaper and closes modal', async () => {
    const mockDiaper: Diaper = {
      id: 'diaper-123',
      babyId: 'baby-1',
      type: 'pee',
      hasRash: false,
      notes: null,
      timestamp: 1724700000000,
    };

    useDiaperStore.getState().openEditDiaperModal(mockDiaper);
    await useDiaperStore.getState().updateDiaper('baby-1', 'diaper-123', {
      type: 'both',
      hasRash: true,
    });

    expect(useDiaperStore.getState().isDiaperModalOpen).toBe(false);
    expect(useDiaperStore.getState().editingDiaper).toBeNull();
  });
});

describe('Appointment Store and Custom Timestamps', () => {
  beforeEach(() => {
    useAppointmentStore.setState({
      appointments: [],
      nextAppointment: null,
      isLoading: false,
      isAppointmentModalOpen: false,
      editingAppointment: null,
    });
  });

  it('opens and closes appointment modal', () => {
    useAppointmentStore.getState().openAppointmentModal();
    expect(useAppointmentStore.getState().isAppointmentModalOpen).toBe(true);

    useAppointmentStore.getState().closeAppointmentModal();
    expect(useAppointmentStore.getState().isAppointmentModalOpen).toBe(false);
  });

  it('creates an appointment with selected timestamp and closes modal', async () => {
    const targetTimestamp = Date.now() + 48 * 60 * 60 * 1000;
    const created = await useAppointmentStore.getState().createAppointment('baby-1', {
      title: '6 Month Checkup',
      doctorName: 'Dr. Smith',
      specialty: 'Pediatrics',
      appointmentDate: targetTimestamp,
      location: 'Children Hospital',
      notes: 'Bring vaccination record',
      syncToCalendar: true,
      remind24h: true,
      remind2h: false,
    });

    expect(created.appointmentDate).toBe(targetTimestamp);
    expect(useAppointmentStore.getState().isAppointmentModalOpen).toBe(false);
  });
});

describe('Feeding Stale Reminders and Notifications Cleanup', () => {
  it('cleans up expired reminders and cancels scheduled notification on load', async () => {
    const { reminderRepository } = require('../db/repositories/reminderRepository');
    const { notificationService } = require('../services/notificationService');

    const expiredMockReminder = {
      id: 'rem-expired-1',
      babyId: 'baby-1',
      type: 'feeding',
      notificationId: 'notif-expired-123',
      targetTime: Date.now() - 3600000,
      isActive: true,
      createdAt: Date.now() - 7200000,
    };

    (reminderRepository.getExpiredActiveReminders as jest.Mock).mockResolvedValueOnce([expiredMockReminder]);

    await useFeedingStore.getState().cleanupStaleReminders('baby-1');

    expect(notificationService.cancelNotification).toHaveBeenCalledWith('notif-expired-123');
    expect(reminderRepository.deactivateReminder).toHaveBeenCalledWith('rem-expired-1');
  });
});

describe('Feeding Dual Alert Modes and Direct Modification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFeedingStore.setState({
      activeReminder: null,
      isEditReminderModalOpen: false,
    });
  });

  it('schedules feeding reminder with notification mode', async () => {
    const { notificationService } = require('../services/notificationService');
    const { reminderRepository } = require('../db/repositories/reminderRepository');

    (reminderRepository.createReminder as jest.Mock).mockResolvedValueOnce({
      id: 'rem-new-1',
      babyId: 'baby-1',
      type: 'feeding',
      targetTime: Date.now() + 120 * 60 * 1000,
      notificationId: 'notif-1',
      alertMode: 'notification',
      isActive: true,
    });

    await useFeedingStore.getState().scheduleNextFeedingReminder('baby-1', 'Liam', 120, {
      alertMode: 'notification',
    });

    expect(notificationService.scheduleFeedingAlarm).toHaveBeenCalledWith(
      'Liam',
      120,
      expect.any(Number),
      expect.objectContaining({ alertMode: 'notification' })
    );
  });

  it('postpones active reminder by specified minutes', async () => {
    const { notificationService } = require('../services/notificationService');
    const { reminderRepository } = require('../db/repositories/reminderRepository');

    const initialTarget = Date.now() + 30 * 60 * 1000;
    const existingReminder = {
      id: 'rem-active-1',
      babyId: 'baby-1',
      type: 'feeding' as const,
      targetTime: initialTarget,
      notificationId: 'notif-prev',
      alertMode: 'alarm' as const,
      soundName: 'default',
      isActive: true,
      createdAt: Date.now(),
    };

    useFeedingStore.setState({ activeReminder: existingReminder });
    (reminderRepository.getNextActiveFeedingReminder as jest.Mock).mockResolvedValueOnce({
      ...existingReminder,
      targetTime: initialTarget + 15 * 60 * 1000,
    });

    await useFeedingStore.getState().postponeActiveReminder('baby-1', 'Liam', 15);

    expect(notificationService.cancelNotification).toHaveBeenCalledWith('notif-prev');
    expect(notificationService.scheduleFeedingAlarm).toHaveBeenCalledWith(
      'Liam',
      initialTarget + 15 * 60 * 1000,
      0,
      expect.objectContaining({ isExactTimestamp: true, alertMode: 'alarm' })
    );
    expect(reminderRepository.updateReminder).toHaveBeenCalledWith(
      'rem-active-1',
      expect.objectContaining({ targetTime: initialTarget + 15 * 60 * 1000 })
    );
  });

  it('updates active reminder target time and alert mode via updateActiveReminder', async () => {
    const { notificationService } = require('../services/notificationService');
    const { reminderRepository } = require('../db/repositories/reminderRepository');

    const newTargetTime = Date.now() + 180 * 60 * 1000;
    const existingReminder = {
      id: 'rem-active-2',
      babyId: 'baby-1',
      type: 'feeding' as const,
      targetTime: Date.now() + 60 * 60 * 1000,
      notificationId: 'notif-prev-2',
      alertMode: 'notification' as const,
      soundName: 'default',
      isActive: true,
      createdAt: Date.now(),
    };

    useFeedingStore.setState({ activeReminder: existingReminder });
    (reminderRepository.getNextActiveFeedingReminder as jest.Mock).mockResolvedValueOnce({
      ...existingReminder,
      targetTime: newTargetTime,
      alertMode: 'alarm',
    });

    await useFeedingStore.getState().updateActiveReminder('baby-1', 'Liam', newTargetTime, 'alarm');

    expect(notificationService.cancelNotification).toHaveBeenCalledWith('notif-prev-2');
    expect(notificationService.scheduleFeedingAlarm).toHaveBeenCalledWith(
      'Liam',
      newTargetTime,
      0,
      expect.objectContaining({ alertMode: 'alarm', isExactTimestamp: true })
    );
    expect(reminderRepository.updateReminder).toHaveBeenCalledWith(
      'rem-active-2',
      expect.objectContaining({ targetTime: newTargetTime, alertMode: 'alarm' })
    );
  });
});


