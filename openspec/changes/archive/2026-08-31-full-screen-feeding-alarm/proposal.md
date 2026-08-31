## Why

Caregivers caring for babies (especially at night) need feeding alarms that reliably wake them up and ensure they don't miss feeding times. Currently, feeding reminders rely on standard operating system notifications that play a single brief chime and stop automatically. Caregivers can easily sleep through or miss these single alerts.

To solve this, the feeding alarm needs to behave like a true system alarm clock: playing continuously in a loop at alarm stream volume with the selected tone, showing a full-screen alert over the lock screen on Android, and continuing to sound until the caregiver explicitly silences or snoozes it.

## What Changes

- Add continuous looping alarm audio support using the dedicated system alarm audio stream (`AUDIO_STREAM_ALARM`) and the ringtone selected in Settings.
- Add Android Full-Screen Alarm Intent (`USE_FULL_SCREEN_INTENT`) allowing the alarm to wake the screen and display a dedicated full-screen alarm screen directly over the lockscreen when the phone is locked.
- Provide a persistent heads-up notification with quick "Silence" and "Snooze (+15m)" actions when the device is in active use.
- Build a dedicated Full-Screen Feeding Alarm UI in the app displaying baby details, time, looping vibration/audio, and large, accessible controls to Dismiss / Feed or Snooze.
- Bundle actual audio tone files (`alarm_digital.wav`, `alarm_chime.wav`, `alarm_bells.wav`, `alarm_gentle.wav`) in project assets.
- Integrate alarm dismissal with quick transition to feeding logging modal.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `alarms-notifications`: Enhance feeding alarm requirements with continuous audio loop playback on the alarm audio stream, full-screen intent over the lockscreen, persistent looping until explicit dismissal/snooze, and alarm audio assets.

## Impact

- **Permissions & Native Config**: Update `app.json` for Android permissions (`USE_FULL_SCREEN_INTENT`, `WAKE_LOCK`, `VIBRATE`, notification channel sound configurations).
- **Audio Assets**: Place custom audio tone assets into `assets/sounds/`.
- **Services & Audio Engine**: Update `notificationService.ts` and introduce an alarm audio loop manager (handling foreground/background audio playback on alarm stream).
- **UI & Navigation**: Add full-screen alarm modal/screen and connect dismissal/snooze actions.
- **State Stores**: Update `useFeedingStore` and `usePreferencesStore` to handle ringing alarm lifecycle.
- **Version**: Bump version to `1.3.0` in `package.json` and `app.json`.
