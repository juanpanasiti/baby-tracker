## Why

Caregivers need different alert intensities depending on the time of day: during the daytime, a standard, brief push notification is sufficient; during the night, a louder, persistent alarm is essential to reliably wake the parent for scheduled feedings. In addition, caregivers frequently need to adjust or postpone scheduled feeding reminders without having to cancel and recreate them from scratch.

## What Changes

- **Alert Modes (Notification vs Loud Alarm)**: Support dual alert modes for feeding reminders: a standard discrete notification for daytime and a high-priority loud alarm for nighttime/heavy sleep.
- **Reminder Creation Prompt**: Enhance the feeding reminder prompt with a visual selector between "Notification" and "Alarm", preset time intervals, and custom time selection.
- **Smart Night Mode Suggestion (Configurable)**: Optional setting in Settings to automatically preselect "Alarm" mode when the scheduled target time falls within nighttime hours (e.g., 22:00 to 07:00), while allowing manual override.
- **Alarm Sound Customization**: Enable choosing the alarm sound in Settings (system default, digital alarm, soft bells, chime, etc.).
- **Active Reminder Card Actions & In-place Modification**:
  - Quick delay actions directly on the dashboard active reminder card (+15 min, +30 min).
  - Tapping the card or edit button opens an Edit Reminder Modal to modify target time, change alert mode (Notification ↔ Alarm), or cancel.
- **Database & Services**: Persist alert mode and selected sound in the local SQLite reminders table and manage corresponding Android notification channels.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `alarms-notifications`: Add requirements for dual alert modes (notification vs loud alarm), custom alarm sound configuration, direct reminder modification, quick postponement, and Android alarm-usage channels.
- `app-preferences`: Add requirements for storing user alarm sound preference and smart nighttime suggestion toggle.

## Impact

- **User Interface**: `FeedingReminderPrompt.tsx`, `DashboardScreen.tsx`, `SettingsScreen.tsx`, and a new `EditReminderModal.tsx`.
- **State & Services**: `useFeedingStore.ts`, `useThemeStore.ts` / `usePreferencesStore`, `notificationService.ts`.
- **Database**: SQLite `reminders` table schema update to track `alert_mode` and `sound_name`.
- **Assets**: Audio files for selectable alarm ringtones.
