# Design: Persistent Alarm Clock with Continuous Looping Audio

## Architectural Overview

To transform ephemeral one-shot notifications into true persistent alarm clocks, we integrate `@notifee/react-native` alongside the existing notification stack, utilizing Android's Alarm Clock Manager (`setAlarmClock`), Foreground Services with `loopSound`, and `fullScreenAction`.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ALARM SCHEDULING FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Caregiver sets Feeding or Medication Alarm                               │
│ 2. notificationService schedules timestamp trigger with AlarmClock type     │
│ 3. Android AlarmManager registers exact RTC_WAKEUP                          │
└─────────────────────────────────────────────────────────────────────────────┘

                                      ▼ (At 3:00 AM)

┌─────────────────────────────────────────────────────────────────────────────┐
│                            ALARM TRIGGER & RINGING                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Android AlarmManager wakes device CPU (Doze bypass)                      │
│ 2. Notifee displays Notification with:                                      │
│    - asForegroundService: true                                              │
│    - loopSound: true (plays custom tone in infinite loop)                   │
│    - fullScreenAction: { id: 'default', launchActivity: true }             │
│    - category: AndroidCategory.ALARM                                        │
│    - importance: AndroidImportance.HIGH                                     │
│ 3. Android OS turns on screen and launches FullScreenAlarm over lockscreen   │
│ 4. Looping sound and vibration persist until user input                      │
└─────────────────────────────────────────────────────────────────────────────┘

                                      ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                            USER ACTION HANDLING                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Actions available in FullScreen UI & Notification:                          │
│                                                                             │
│  [ Silence ] ──────▶ Stops Foreground Service + Audio Loop + Dismisses UI   │
│  [ Snooze (+15m) ] ─▶ Stops Audio + Schedules new Alarm for (now + 15m)     │
│  [ Feed / Take ] ──▶ Stops Audio + Logs record in SQLite + Reschedules next │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technical Decisions

### 1. Library & Notification Engine
- Use `@notifee/react-native` for high-priority looping alarms because:
  - Built-in native support for `loopSound: true` on Android channels.
  - Native `fullScreenAction` launching React Native MainActivity directly over the Android keyguard (`setShowWhenLocked` / `setTurnScreenOn`).
  - Native background event handlers (`onBackgroundEvent`) that can execute code when notification actions ("Silence", "Snooze") are pressed even when the app UI is closed.
  - Native timestamp triggers using `AlarmManager.setAlarmClock()`.

### 2. Audio & Channel Configuration
- Alarm notification channel configured with:
  - `importance: AndroidImportance.HIGH`
  - `sound: soundFile`
  - `category: AndroidCategory.ALARM`
  - `audioAttributes: { usage: AndroidAudioUsage.ALARM, contentType: AndroidAudioContentType.SONIFICATION }`
  - `vibrationPattern: [0, 600, 300, 600, 300, 1000]`

### 3. Background Event Handling (`index.ts`)
- Register `notifee.onBackgroundEvent` in `index.ts` so action button clicks ("SILENCE", "SNOOZE", "TAKE_DOSE") execute immediately in the background:
  - Cancels the active notification / foreground service.
  - Interacts with database / stores for snoozing or dose logging.

### 4. Full-Screen Modal Synchronization
- When the activity launches into the foreground, `useAlarmRingingStore` receives the active alarm context (`type`, `babyName`, `medicationName`, `dosage`) and displays `FullScreenAlarmModal` seamlessly.
