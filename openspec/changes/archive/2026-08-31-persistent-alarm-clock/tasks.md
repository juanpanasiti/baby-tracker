# Implementation Tasks: Persistent Alarm Clock

## Task 1: Package Dependencies and Android Native Permissions Setup
- [x] 1.1 Install `@notifee/react-native` and configure Expo config plugin in `app.json`.
- [x] 1.2 Verify and ensure all required Android permissions in `app.json` (`SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`, `USE_FULL_SCREEN_INTENT`, `WAKE_LOCK`, `VIBRATE`, `FOREGROUND_SERVICE`, `POST_NOTIFICATIONS`).
- [x] 1.3 Configure Android MainActivity attributes for full screen intent (`showWhenLocked: true`, `turnScreenOn: true`) via Expo plugin or native manifest attributes.

## Task 2: Alarm Notification Engine Implementation with Persistent Looping
- [x] 2.1 Update `notificationService.ts` to implement alarm channels with `loopSound: true`, `AndroidCategory.ALARM`, and `AndroidAudioUsage.ALARM`.
- [x] 2.2 Implement exact timestamp trigger scheduling using Notifee's `TriggerType.TIMESTAMP` with `alarmManager: { type: AlarmType.SET_ALARM_CLOCK }`.
- [x] 2.3 Configure `fullScreenAction` on alarm notifications to launch the app directly over the locked screen when the alarm triggers.
- [x] 2.4 Add actionable buttons to the alarm notification ("Silence", "Snooze +15m", "Feed Baby" / "Take Dose") with custom action IDs.

## Task 3: Background Event Registration and Store Synchronization
- [x] 3.1 Register `notifee.onBackgroundEvent` in `index.ts` to handle notification action button taps when the app is in the background or killed.
- [x] 3.2 Implement background silence logic to immediately cancel the foreground alarm and stop audio looping.
- [x] 3.3 Implement background snooze logic to reschedule the alarm for +15 minutes in SQLite database and Notifee.
- [x] 3.4 Implement background medication dose logging when "Take Dose" is pressed from the notification.
- [x] 3.5 Sync foreground listeners in `notificationService` and `App.tsx` to update `useAlarmRingingStore` when the app is opened by the full-screen intent.

## Task 4: UI & Sound Preview Verification
- [x] 4.1 Update Sound Preview in `SettingsScreen` to test looping alarm playback and stopping via Notifee.
- [x] 4.2 Validate that `FullScreenAlarmModal` correctly dismisses the Notifee persistent alarm when any modal action button is clicked.

## Task 5: Testing & Validation
- [x] 5.1 Update and add unit tests in `src/__tests__/alarm.test.ts` for scheduling persistent alarms with Notifee, background event handling, snoozing, and silencing.
- [x] 5.2 Execute test suite (`npm test`) and ensure 100% test pass rate.

## Task 6: Documentation, Versioning & Final Verification
- [x] 6.1 Bump app version in `app.json` and `package.json` to reflect the new persistent alarm clock capabilities.
- [x] 6.2 Review and update `README.md` documenting the persistent looping alarm clock architecture and background notification behaviors.
- [x] 6.3 Perform final verification against all proposal goals and acceptance criteria.
