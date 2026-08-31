## 1. Setup & Audio Assets

- [x] 1.1 Add bundled sound assets (`alarm_digital.wav`, `alarm_chime.wav`, `alarm_bells.wav`, `alarm_gentle.wav`) to `assets/sounds/` and verify the audio files exist and can be loaded.
- [x] 1.2 Update `app.json` with `android.permission.USE_FULL_SCREEN_INTENT`, notification channel sound settings, and verify Expo config validity.

## 2. Notification Service & Alarm Categories

- [x] 2.1 Update `notificationService.ts` to configure high-priority feeding alarm channels with `USE_FULL_SCREEN_INTENT`, category `ALARM`, and verify channel setup.
- [x] 2.2 Add notification response listener and foreground handler in `notificationService.ts` to capture alarm triggers and action button events ("Silence", "Snooze").

## 3. Continuous Audio Engine & Alarm Ringing State

- [x] 3.1 Implement `alarmAudioService.ts` to play looping audio using `AUDIO_STREAM_ALARM` with volume and vibration control until explicitly stopped.
- [x] 3.2 Implement `useAlarmRingingStore.ts` (or extend `useFeedingStore`) to track active ringing state, ringing sound, baby details, and provide `silenceAlarm` and `snoozeAlarm` actions.

## 4. Full-Screen Alarm UI & Interaction

- [x] 4.1 Create `FullScreenAlarmModal.tsx` displaying baby avatar/name, pulsing alarm animation, formatted time, "Silence / Feed" primary action, and "+15m Snooze" secondary action.
- [x] 4.2 Mount `<FullScreenAlarmModal />` at the root in `App.tsx` and verify it automatically displays when an alarm rings or is received.
- [x] 4.3 Connect "Silence / Feed" button to dismiss the alarm, stop audio playback, and open `FeedingModal` to log the feed immediately.
- [x] 4.4 Connect "Snooze (+15m)" button to dismiss the alarm, stop audio playback, and reschedule the feeding reminder 15 minutes ahead.

## 5. Versioning, Testing & Documentation

- [x] 5.1 Update version from `1.2.0` to `1.3.0` in `package.json` and `app.json` (bump versionCode to 5).
- [x] 5.2 Add unit tests for alarm scheduling, snooze calculation, and state store transitions. Run tests with `npm test` and verify all tests pass.
- [x] 5.3 Review and update `README.md` to document the Full-Screen Feeding Alarm feature, sound assets, and Android full-screen intent permissions.
- [x] 5.4 Perform final end-to-end validation verifying that all requirements in `proposal.md` and `specs/alarms-notifications/spec.md` are satisfied.
