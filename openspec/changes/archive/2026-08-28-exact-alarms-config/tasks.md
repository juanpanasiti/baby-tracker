## 1. Native Permissions & Android Configuration

- [x] 1.1 Add `android.permission.USE_EXACT_ALARM` and `android.permission.WAKE_LOCK` to `app.json` Android permissions list and verify the JSON schema remains valid.

## 2. Notification Channels & Scheduling Service Enhancement

- [x] 2.1 Update `notificationService.setupChannels()` in `src/services/notificationService.ts` to configure `feeding-alarms` and `appointment-reminders` with `Notifications.AndroidImportance.MAX`, vibration patterns, lights, and public lockscreen visibility.
- [x] 2.2 Update `notificationService.scheduleFeedingAlarm()` and `notificationService.scheduleAppointmentReminder()` to set `priority: Notifications.AndroidNotificationPriority.MAX` and public visibility in the notification payload content.

## 3. Stale Alarm Cleanup & Store Synchronization

- [x] 3.1 Implement stale reminder detection and cleanup logic in `useFeedingStore.loadFeedings` (or an active reminder refresh function) so that if an active reminder's `targetTime` has already elapsed, the pending operating system notification is canceled and the reminder state is updated.
- [x] 3.2 Add app foreground / focus sync in `App.tsx` to trigger reminder state verification when the app returns from background.

## 4. Versioning, Testing & Validation

- [x] 4.1 Update and run unit tests in `src/__tests__/tracking.test.ts` to verify notification scheduling and cancellation behavior under the new configuration.
- [x] 4.2 Update the application version and build/version code in `package.json` and `app.json`.
- [x] 4.3 Update `README.md` if any Android build or permission requirements are affected.
- [x] 4.4 Final validation task to verify that all requirements established in the proposal and specs are satisfied.
