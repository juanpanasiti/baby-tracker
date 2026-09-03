## Context

Currently, alarms trigger using Notifee and full-screen intents (`FullScreenAlarmModal`), but pressing "Silence" immediately stops playback and cancels all notifications without checking if the baby was fed or medication was given. See `proposal.md` for problem background.

Existing reminders are tracked in SQLite via `reminders` table and Zustand stores (`useFeedingStore`, `useMedicationStore`, `useAlarmRingingStore`, `usePreferencesStore`).

## Goals / Non-Goals

**Goals:**
- Provide a robust re-alert ("nagging") mechanism when alarms are silenced without corresponding log entries.
- Support both feeding and medication reminders.
- Ensure the re-alert cycle works reliably across foreground, background, and app-killed states on Android.
- Automatically cancel re-alert cycles upon saving a corresponding feeding or medication dose log.
- Provide an explicit "Dismiss Reminder" escape hatch to avoid trapping users in infinite loops when they choose to skip an event.
- Allow users to configure whether re-alerts are enabled, the re-alert interval, and maximum repeats limit.

**Non-Goals:**
- Creating automated recurring alarms that fire at multiple fixed hours without user-scheduled intervals or medication routines.
- Changing the sound files or physical audio stream configuration (`AUDIO_STREAM_ALARM`).

## Decisions

### 1. State Tracking via Notification Payload and Reminder Records
- **Decision**: Store `isReAlert: true`, `repeatCount: number`, and `originalTargetTime: number` inside the notification's custom `data` object and synchronize it with the SQLite `reminders` table.
- **Rationale**: Android notifications can be silenced while the app is in the background or completely closed. Storing repeat count and configuration in the notification payload allows Notifee's headless `onBackgroundEvent` in `index.ts` to re-schedule the next alarm without requiring full React component mounting or heavy background state synchronization.
- **Alternatives Considered**:
  - *Keep state only in React / Zustand memory*: Fails if the user silences the alarm from the lockscreen while the app process is suspended or killed by the OS.

### 2. Auto-Cancellation on Care Record Creation
- **Decision**: Hook into `feedingStore.createFeeding(...)` and `medicationStore.logDose(...)` to actively check for and cancel pending re-alert notifications.
- **Rationale**: This creates an effortless workflow for the caregiver: they simply open the app, log the feeding or medication, and the nagging alarm automatically stops.
- **Alternatives Considered**:
  - *Require caregivers to manually confirm completion in an extra modal prompt*: Frustrating and redundant when the caregiver already logged the feeding.

### 3. Explicit Dismissal Option ("Dismiss Reminder")
- **Decision**: Expose a clear, dedicated "Dismiss / Cancel Reminder" action in the `FullScreenAlarmModal` (secondary button row) and on the active reminder card in `DashboardScreen`.
- **Rationale**: If a feeding was skipped, given by someone else, or a false alarm occurred, the caregiver must have an unambiguous way to turn off the alarm cycle without having to create an artificial or fake feeding entry in the baby's timeline.
- **Alternatives Considered**:
  - *Allow swipe-to-dismiss notification to cancel completely*: Caregivers often accidentally swipe away notifications while handling their device. Accidental swipe should silence (and trigger re-alert) rather than permanently cancel.

### 4. Re-Alert Preferences Architecture
- **Decision**: Add three new preferences in `usePreferencesStore`:
  - `alarmNaggingEnabled`: boolean (default `true`)
  - `alarmNaggingInterval`: number (default `5` minutes; choices: 2, 5, 10, 15)
  - `alarmNaggingMaxRepeats`: number | null (default `null` for indefinite; choices: `null`, 3, 5, 10)
- **Rationale**: Matches existing settings conventions (`alarmSound`, `smartNightMode`) using `AsyncStorage` and clear UI controls in `SettingsScreen`.

## Risks / Trade-offs

- **[Risk]** Notification spam or battery drain if an alarm rings indefinitely while phone is unattended.
  → *Mitigation*: Each alarm rings for its default notification timeout before becoming silent, and re-alert intervals are spaced at least 2-15 minutes apart. The user can also set a maximum repeat limit (e.g. 3 or 5 times) in Settings if desired.
- **[Risk]** Headless background handler execution limits on Android.
  → *Mitigation*: Notifee `onBackgroundEvent` with `AlarmType.SET_ALARM_CLOCK` uses Android `AlarmManager`, which bypasses Doze mode and guarantees exact wake execution.
- **[Risk]** Timezone or clock changes while a re-alert is pending.
  → *Mitigation*: Target times are stored as absolute epoch timestamps (`Date.now() + interval * 60 * 1000`).
