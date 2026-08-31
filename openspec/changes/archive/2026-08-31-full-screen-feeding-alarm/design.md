## Context

See `proposal.md` for motivation.

The application is built on React Native (0.81) and Expo SDK 54 with local SQLite database persistence, Zustand stores, and `expo-notifications`. The target platform is primarily Android. Currently, feeding reminders schedule standard operating system notifications that sound once and stop automatically.

## Goals / Non-Goals

**Goals:**
- Implement continuous looping alarm audio that plays on the device alarm audio stream (`AUDIO_STREAM_ALARM`) and respects the user's selected tone in Settings.
- Implement Android Full-Screen Intent triggering a dedicated full-screen alarm screen that turns on the screen and displays over the device lockscreen.
- Provide a persistent heads-up notification with "Silence" and "Snooze (+15m)" actions when the device is unlocked and in use.
- Build a dedicated, high-contrast Full-Screen Feeding Alarm UI in the app with large tap targets to Dismiss (with instant navigation to Feeding modal) or Snooze (+15 min).
- Bundle native sound files (`alarm_digital.wav`, `alarm_chime.wav`, `alarm_bells.wav`, `alarm_gentle.wav`) in `assets/sounds/`.

**Non-Goals:**
- Remote server / push notification services (remains 100% offline-first).
- Full-screen lockscreen waking for appointment reminders (appointments remain discrete standard notifications).
- VoIP calling services (CallKit / ConnectionService).

## Decisions

### 1. Alarm Audio Playback Engine & Audio Stream
- **Decision**: Use a dedicated `alarmAudioService` utilizing audio playback with `interruptionModeAndroid: DoNotMix`, `shouldDuckAndroid: true`, and output routing to the system Alarm stream (`usage: ALARM`). Looping is set to `true` until explicitly dismissed.
- **Alternatives Considered**:
  - *OS Notification sound only*: Cannot loop continuously once triggered in background.
  - *Foreground audio player only*: Fails to play when screen is turned off unless tied to native wake/notification triggers.

### 2. Android Full-Screen Intent & Permissions
- **Decision**: Configure Android `app.json` with `android.permission.USE_FULL_SCREEN_INTENT`, `WAKE_LOCK`, and `SCHEDULE_EXACT_ALARM`. Update `expo-notifications` and notification channels to specify `categoryIdentifier: 'alarm'` and `priority: MAX`.
- **Alternatives Considered**:
  - *Standard notification banner only*: Requires caregiver to notice small banner, easily slept through.

### 3. State Management & Root Full-Screen Alarm Modal
- **Decision**: Create an `useAlarmStateStore` (or integrate into `useFeedingStore`) to maintain the active ringing state (`isAlarmRinging`, `ringingBabyId`, `ringingSound`, `ringingTimestamp`). The root `App.tsx` mounts `<FullScreenAlarmModal />` on top of all screens.
- **Rationale**: Ensures the full-screen interface takes over the entire viewport immediately when an alarm trigger is received (or when the app is launched via notification click/full-screen intent).

### 4. Bundled Audio Assets
- **Decision**: Include clean, high-quality alarm sound assets (`.wav`) in `assets/sounds/` mapped to the existing `ALARM_SOUNDS` in `usePreferencesStore.ts`.

## Risks / Trade-offs

- **[Risk]** Android aggressive battery optimizations (Doze mode) delaying alarms.  
  → **Mitigation**: Use `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM` and `SchedulableTriggerInputTypes.DATE` with exact triggers.
- **[Risk]** iOS 30-second notification limit in background.  
  → **Mitigation**: iOS will play the selected sound up to 30 seconds via notification; upon opening the app, the foreground audio engine continues the loop until dismissed.
