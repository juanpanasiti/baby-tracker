export const setNotificationHandler = jest.fn();
export const setNotificationCategoryAsync = jest.fn().mockResolvedValue(undefined);
export const setNotificationChannelAsync = jest.fn().mockResolvedValue(undefined);
export const addNotificationResponseReceivedListener = jest.fn().mockReturnValue({ remove: jest.fn() });
export const getPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
export const requestPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
export const scheduleNotificationAsync = jest.fn().mockResolvedValue('expo-notif-123');
export const cancelScheduledNotificationAsync = jest.fn().mockResolvedValue(undefined);
export const cancelAllScheduledNotificationsAsync = jest.fn().mockResolvedValue(undefined);

export const AndroidImportance = {
  UNKNOWN: 0,
  UNSPECIFIED: 1,
  NONE: 2,
  MIN: 3,
  LOW: 4,
  DEFAULT: 5,
  HIGH: 6,
  MAX: 7,
};

export const AndroidNotificationPriority = {
  MIN: 'min',
  LOW: 'low',
  DEFAULT: 'default',
  HIGH: 'high',
  MAX: 'max',
};

export const AndroidNotificationVisibility = {
  UNKNOWN: 0,
  PUBLIC: 1,
  PRIVATE: 2,
  SECRET: 3,
};

export const AndroidAudioUsage = {
  UNKNOWN: 0,
  MEDIA: 1,
  VOICE_COMMUNICATION: 2,
  VOICE_COMMUNICATION_SIGNALLING: 3,
  ALARM: 4,
  NOTIFICATION: 5,
  NOTIFICATION_RINGTONE: 6,
  NOTIFICATION_COMMUNICATION_REQUEST: 7,
  NOTIFICATION_COMMUNICATION_INSTANT: 8,
  NOTIFICATION_COMMUNICATION_DELAYED: 9,
  NOTIFICATION_EVENT: 10,
  ASSISTANCE_ACCESSIBILITY: 11,
  ASSISTANCE_NAVIGATION_GUIDANCE: 12,
  ASSISTANCE_SONIFICATION: 13,
  GAME: 14,
  ASSISTANT: 16,
};

export const AndroidAudioContentType = {
  UNKNOWN: 0,
  SPEECH: 1,
  MUSIC: 2,
  MOVIE: 3,
  SONIFICATION: 4,
};

export const SchedulableTriggerInputTypes = {
  DATE: 'date',
  TIME_INTERVAL: 'timeInterval',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  CALENDAR: 'calendar',
};
