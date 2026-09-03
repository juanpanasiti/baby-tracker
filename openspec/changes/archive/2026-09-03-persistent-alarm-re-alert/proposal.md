## Why

When scheduled feeding or medication alarms trigger (especially during nighttime or busy caregiving moments), caregivers frequently tap "Silence" to stop loud ringing and prevent disturbing the household. Currently, silencing an alarm completely cancels it without verifying if the necessary care action (feeding the baby or administering medication) was actually performed. If the caregiver falls back asleep or gets distracted, the baby may miss their feeding or medication dose.

Implementing an unconfirmed alarm re-alert ("nagging") mechanism ensures that silencing an alarm only temporarily mutes the sound, automatically re-arming the alarm to ring again after a configurable interval (default 5 minutes) until the corresponding care record is saved or the reminder is explicitly dismissed.

## What Changes

- **Persistent Alarm Re-alert Cycle ("Nagging")**: When a feeding or medication alarm rings and the caregiver taps "Silence" (or dismisses the full-screen modal without saving a record), the audio stops immediately, but a re-alert timer is automatically scheduled (default: 5 minutes later) using high-priority OS alarms.
- **Log Detection & Cycle Completion**: Saving a new feeding log (`createFeeding`) or logging a medication dose (`logDose`) automatically cancels any pending re-alert timers and completes the reminder cycle, transitioning to normal scheduling.
- **Explicit Dismissal Option**: Caregivers can explicitly dismiss or discard an active reminder from the ringing modal or dashboard without being forced to log a false record, preventing unwanted looping.
- **Settings & Preferences**: Caregivers can configure the re-alert behavior in Settings:
  - Toggle to enable or disable persistent re-alerting (enabled by default).
  - Re-alert interval selector (2, 5, 10, 15 minutes; default: 5 minutes).
  - Maximum repeats limit selector (Indefinite / No limit by default, or 3, 5, 10 repeats).
- **Dashboard & Full-Screen UI Feedback**: The active reminder card on the Dashboard and the full-screen alarm modal indicate when an alarm is silenced and awaiting action, displaying countdown to next re-alert and quick action buttons ("Log Now", "Dismiss").

## Capabilities

### Modified Capabilities
- `alarms-notifications`: Update alarm silencing and lifecycle requirements to support repeat re-alerting upon silence until a corresponding feeding or medication record is logged or explicitly dismissed.
- `app-preferences`: Add configuration preferences for persistent alarm re-alerts (toggle enabled, re-alert interval minutes, and maximum repeat count limit).

## Impact

- **State Management**: Update `useAlarmRingingStore`, `useFeedingStore`, `useMedicationStore`, and `usePreferencesStore`.
- **Services & Background Handlers**: Update `notificationService.ts` and background event handler in `index.ts` to support re-scheduling alarms on `SILENCE_ALARM` with repeat count tracking.
- **UI Components**: Update `FullScreenAlarmModal.tsx`, `SettingsScreen.tsx`, and Dashboard active reminder card.
- **Localization**: Add new English and Spanish translation keys in `en.json` and `es.json`.
- **Database & Repositories**: Update reminder records and queries to track re-alerting state, target times, and repeat counts.
