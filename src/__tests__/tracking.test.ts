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
    deactivateRemindersByType: jest.fn().mockResolvedValue(undefined),
    createReminder: jest.fn().mockResolvedValue({ id: 'rem-1' }),
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

  it('opens and closes feeding modal in creation mode', () => {
    const store = useFeedingStore.getState();
    store.openFeedingModal();
    expect(useFeedingStore.getState().isFeedingModalOpen).toBe(true);
    expect(useFeedingStore.getState().editingFeeding).toBeNull();

    useFeedingStore.getState().closeFeedingModal();
    expect(useFeedingStore.getState().isFeedingModalOpen).toBe(false);
    expect(useFeedingStore.getState().editingFeeding).toBeNull();
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
