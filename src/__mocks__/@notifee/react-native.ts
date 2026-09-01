export const AndroidImportance = {
  DEFAULT: 3,
  HIGH: 4,
  LOW: 2,
  MIN: 1,
  NONE: 0,
};

export const AndroidCategory = {
  ALARM: 'alarm',
  CALL: 'call',
  EMAIL: 'email',
  ERROR: 'err',
  EVENT: 'event',
  MESSAGE: 'msg',
  NAVIGATION: 'navigation',
  PROGRESS: 'progress',
  PROMO: 'promo',
  RECOMMENDATION: 'recommendation',
  REMINDER: 'reminder',
  SERVICE: 'service',
  SOCIAL: 'social',
  STATUS: 'status',
  STOPWATCH: 'stopwatch',
  SYSTEM: 'sys',
  TRANSPORT: 'transport',
  WORKOUT: 'workout',
};

export const AndroidAudioUsage = {
  ALARM: 4,
  ASSISTANCE_ACCESSIBILITY: 11,
  ASSISTANCE_NAVIGATION_GUIDANCE: 12,
  ASSISTANCE_SONIFICATION: 13,
  ASSISTANT: 16,
  GAME: 14,
  MEDIA: 1,
  NOTIFICATION: 5,
  NOTIFICATION_COMMUNICATION_DELAYED: 9,
  NOTIFICATION_COMMUNICATION_INSTANT: 8,
  NOTIFICATION_COMMUNICATION_REQUEST: 7,
  NOTIFICATION_EVENT: 10,
  NOTIFICATION_RINGTONE: 6,
  UNKNOWN: 0,
  VOICE_COMMUNICATION: 2,
  VOICE_COMMUNICATION_SIGNALLING: 3,
};

export const AndroidAudioContentType = {
  MOVIE: 3,
  MUSIC: 2,
  SONIFICATION: 4,
  SPEECH: 1,
  UNKNOWN: 0,
};

export const AndroidVisibility = {
  PRIVATE: 0,
  PUBLIC: 1,
  SECRET: -1,
};

export const TriggerType = {
  TIMESTAMP: 0,
  INTERVAL: 1,
};

export const AlarmType = {
  SET_ALARM_CLOCK: 0,
  SET_AND_ALLOW_WHILE_IDLE: 1,
  SET_EXACT: 2,
  SET_EXACT_AND_ALLOW_WHILE_IDLE: 3,
};

export const EventType = {
  DISMISSED: 0,
  PRESS: 1,
  ACTION_PRESS: 2,
  DELIVERED: 3,
  APP_BLOCKED: 4,
  CHANNEL_BLOCKED: 5,
  CHANNEL_GROUP_BLOCKED: 6,
  TRIGGER_NOTIFICATION_CREATED: 7,
  FG_ALREADY_EXISTING: 8,
};

const notifee = {
  createChannel: jest.fn().mockResolvedValue('channel-id'),
  createTriggerNotification: jest.fn().mockResolvedValue('trigger-notif-id'),
  displayNotification: jest.fn().mockResolvedValue('display-notif-id'),
  cancelNotification: jest.fn().mockResolvedValue(undefined),
  cancelTriggerNotification: jest.fn().mockResolvedValue(undefined),
  cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
  cancelTriggerNotifications: jest.fn().mockResolvedValue(undefined),
  stopForegroundService: jest.fn().mockResolvedValue(undefined),
  getDisplayedNotifications: jest.fn().mockResolvedValue([]),
  getTriggerNotificationIds: jest.fn().mockResolvedValue([]),
  requestPermission: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
  onForegroundEvent: jest.fn().mockReturnValue(() => {}),
  onBackgroundEvent: jest.fn(),
  getInitialNotification: jest.fn().mockResolvedValue(null),
};

export default notifee;
