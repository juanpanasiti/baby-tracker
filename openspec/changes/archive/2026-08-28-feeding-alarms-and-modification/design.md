## Context

See `proposal.md` for motivation. Currently, `notificationService.ts` schedules feeding reminders on a single `feeding-alarms` Android channel using the default notification sound. The active reminder in `DashboardScreen.tsx` displays only target time and a cancel button, with no editing or snooze capability. Reminders are saved in SQLite with `id`, `babyId`, `type`, `targetTime`, `notificationId`, and `isActive`.

## Goals / Non-Goals

**Goals:**
- Provide two distinct alert modalities: discrete daytime notification vs loud, waking nighttime alarm.
- Implement Android notification channels with appropriate audio usage flags (`USAGE_ALARM` vs `USAGE_NOTIFICATION`) and distinct vibration patterns.
- Enable user-configurable alarm tones in Settings and save the selected preference.
- Provide optional smart suggestion that preselects "Alarm" during nighttime hours (22:00 to 07:00).
- Support quick delay inline actions (+15 min, +30 min) directly on the Dashboard reminder card.
- Implement an `EditReminderModal` allowing caregivers to adjust target time, switch alert mode, or cancel the active reminder.

**Non-Goals:**
- Full-screen native system alarm clock app takeovers (we use Expo Notifications maximum priority heads-up and alarm stream).
- Remote push notifications / cloud synchronization (offline-first local notifications).

## Decisions

### 1. Alert Modes & Android Notification Channel Architecture
- **Decision**: Create two dedicated Android notification channels:
  - `feeding-notifications`: Importance HIGH, standard brief sound, normal vibration.
  - `feeding-alarms`: Importance MAX, AudioAttributes `USAGE_ALARM`, lockscreen visibility `PUBLIC`, long looping vibration pattern `[0, 500, 250, 500, 250, 500]`, and configured alarm sound.
- **Rationale**: Android treats channels with `USAGE_ALARM` as alarm streams, ensuring they ring at alarm volume even when standard ringtones or notifications are muted.
- **Alternatives Considered**: Using a single channel with dynamic sound. Rejected because Android channel attributes (sound, vibration, importance) are immutable once created; separate channels are required for distinct behavior.

### 2. Preference Storage & Sound Asset Management
- **Decision**: Manage preferences (`alarmSound`, `smartNightMode`) in a dedicated `usePreferencesStore` (or `useSettingsStore`) backed by AsyncStorage. Provide a sound asset catalog (`default`, `digital`, `chimes`, `bells`, `gentle`) with audio playback preview in Settings using `expo-av` or system sounds.
- **Rationale**: Fast local reads on app startup and easy sound preview without recreating channels prematurely.

### 3. Database Schema Evolution
- **Decision**: Add optional columns `alertMode` (text: `'notification' | 'alarm'`) and `soundName` (text) to the `reminders` table schema.
- **Rationale**: Retains full state of what kind of alert is pending so the UI can render appropriate icons (🔔 vs ⏰) and handle rescheduling seamlessly.

### 4. Interactive Dashboard Reminder Card & Rescheduling Flow
- **Decision**:
  - **Inline Quick Actions**: Tapping `+15m` or `+30m` calls `postponeActiveReminder(babyId, minutes)` in `useFeedingStore`, which cancels the OS notification, calculates `newTarget = oldTarget + delta`, reschedules via `notificationService`, and updates the database record.
  - **Full Edit Modal**: Tapping the card opens `EditReminderModal`, allowing custom time selection via `DateTimePickerInput` and toggling between Notification and Alarm modes before saving.

## Risks / Trade-offs

- **[Android Custom Notification Sounds in Expo Go vs Production Build]** → Notification sound assets must be configured in `app.json` plugins for custom sounds. When running in Expo Go or if a custom sound is missing, fallback cleanly to `default` system alarm sound.
- **[Device Do Not Disturb (DND) / Battery Optimization]** → Android Doze mode can delay standard timers. Notifications use `SchedulableTriggerInputTypes.DATE` with max priority channels to wake the device.
