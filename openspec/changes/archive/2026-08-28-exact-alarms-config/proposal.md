## Why

Caregivers relying on Baby Tracker for time-sensitive feeding and appointment reminders experience delayed notifications on Android when the device is idle or in deep sleep (Doze Mode). Notifications are deferred by the OS until the device wakes up or the app is reopened, causing overdue alerts to fire minutes after opening the app instead of at the exact moment required.

## What Changes

- Add `USE_EXACT_ALARM` and `WAKE_LOCK` permissions to Android configuration in `app.json` to allow exact alarm execution during idle/Doze states.
- Elevate Android notification channels (`feeding-alarms` and `appointment-reminders`) from `HIGH` to `MAX` importance, ensuring heads-up display, sound, and priority execution.
- Update notification payload properties with `AndroidNotificationPriority.MAX` and public lockscreen visibility.
- Implement stale alarm catch-up and cleanup on app startup/foreground to cancel past-due queued OS notifications and reflect accurate expired state immediately.

## Capabilities

### Modified Capabilities
- `alarms-notifications`: Enhance alarm scheduling to guarantee exact-time delivery under Android power management restrictions and handle stale notification cleanup.

## Impact

- **Configuration (`app.json`)**: Added Android permissions (`android.permission.USE_EXACT_ALARM`, `android.permission.WAKE_LOCK`).
- **Services (`src/services/notificationService.ts`)**: Notification channels and scheduling payloads configured for maximum importance and priority.
- **State Management & Lifecycle (`src/store/useFeedingStore.ts`, `App.tsx`)**: Cleanup/catch-up logic for expired reminders when resuming the application.
