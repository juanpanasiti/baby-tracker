## Context

See `proposal.md` for motivation. On Android 12+ (API 31+), `AlarmManager` exact alarms require specific permissions. In Android 13+ (API 33+), `SCHEDULE_EXACT_ALARM` is not granted by default for newly installed apps without user manual action in system settings. Apps categorized as timers and alarms should use `android.permission.USE_EXACT_ALARM` to be granted permission automatically. Furthermore, notification channels must be configured with `AndroidImportance.MAX` so the system displays them as heads-up notifications with sound and wakes the device.

## Goals / Non-Goals

**Goals:**
- Guarantee prompt local notification delivery at the exact scheduled timestamp even during deep sleep (Doze Mode).
- Configure Android permissions (`USE_EXACT_ALARM`, `WAKE_LOCK`) and channel importance (`MAX`) across all notification channels.
- Prevent stale/ghost notifications from popping up when the user opens the application after the reminder time has already passed.

**Non-Goals:**
- Implementing remote cloud push notifications (FCM / APNs) or backend server infrastructure.
- Building custom audio players to act as full-screen ringing alarm clocks (system notifications with sound and heads-up banner suffice).

## Decisions

### 1. Permission Model: `USE_EXACT_ALARM` vs `SCHEDULE_EXACT_ALARM`
- **Decision**: Include both `USE_EXACT_ALARM` and `SCHEDULE_EXACT_ALARM` in `app.json`.
- **Rationale**: `USE_EXACT_ALARM` is auto-granted on Android 13+ for apps with timer/alarm functionality, eliminating the need to redirect the user to Android system settings. `SCHEDULE_EXACT_ALARM` maintains backwards compatibility for Android 12 devices.
- **Alternative Considered**: Requiring users to manually grant permission in Android settings via an intent/prompt. Rejected due to poor user onboarding and high friction.

### 2. Notification Channel & Priority Configuration
- **Decision**: Set `importance: Notifications.AndroidImportance.MAX`, `priority: Notifications.AndroidNotificationPriority.MAX`, and `lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC` in `notificationService.ts`.
- **Rationale**: Android uses channel importance to determine whether to break through background quiet states, illuminate the screen / display heads-up banners, and play alert sounds immediately.
- **Alternative Considered**: Leaving importance as `HIGH`. Rejected because `HIGH` can be throttled during Doze maintenance batches.

### 3. Stale Alarm Catch-up on Foreground / App Startup
- **Decision**: When `loadFeedings` or app foreground triggers, check if `activeReminder` exists with `targetTime <= Date.now()`. If expired, invoke `Notifications.cancelScheduledNotificationAsync(reminder.notificationId)` to clear the operating system queue and mark the reminder in the repository.
- **Rationale**: Prevents Android from delivering queued overdue notifications 1-2 minutes after the user opens the app.

## Risks / Trade-offs

- **[Risk] Google Play Store Review for `USE_EXACT_ALARM`** → The app is a baby tracking and feeding alarm tool; declaration of core timer/reminder functionality in store listing satisfies Google Play policy requirements.
- **[Risk] Aggressive OEM Battery Management (Xiaomi MIUI, Huawei, OnePlus)** → Standard `USE_EXACT_ALARM` and `WAKE_LOCK` cover standard Android Doze; for extreme OEM killers, the app can optionally document setting battery usage to "Unrestricted" in device settings.
