## Why

Babies frequently require regular supplements (such as daily Vitamin D and Iron) as well as temporary medications (such as antibiotics or pain relievers every 6 to 8 hours). Caregivers currently have no dedicated way to configure recurring medication schedules, receive timed notifications or loud alarms, log administered doses, or temporarily pause/cancel treatments without losing history.

## What Changes

- Add a dedicated **Medications** section / 5th tab in the bottom navigation bar (`Dashboard`, `Timeline`, `Medications`, `Appointments`, `Settings`).
- Introduce data models and SQLite persistence for medications (`medications`) and administered dose logs (`medication_logs`).
- Support 3 scheduling patterns:
  1. **Fixed daily times** (e.g., 10:00 AM and 6:00 PM).
  2. **Cyclic intervals** (e.g., Every 8 hours starting from a given time, with optional duration limit in days).
  3. **Specific days of the week** (e.g., Daily, or selected days such as Mon/Wed/Fri).
- Support treatment status management: `active`, `paused`, and `finished` (archived without deleting dose logs or schedule configurations).
- Provide dual alert modes matching feeding alarms: **Standard Notification** (daytime chime) and **Loud Alarm** (continuous audio loop, full-screen lockscreen intent, system alarm volume).
- Enable quick actions on reminders and alarm screens: **Mark as Taken** (logs dose to Timeline and advances schedule) and **Postpone** (+15m / +30m).
- Add a dashboard summary widget for upcoming medication doses of the day with quick actions and a quick "+ Medication" button.
- Integrate medication dose logs into the Chronological Timeline alongside feedings and diapers.
- Support full English and Spanish localization (i18n) and Light/Dark themes for all medication UI.

## User Impact

Caregivers can reliably track baby medications and supplements, avoid missed or duplicate doses, receive appropriate alerts at any hour, pause treatments when completed, and review full dose history alongside feeding and diaper logs.

## Goals

- Enable adding, editing, pausing, reactivating, and completing medication treatments.
- Support fixed times, hourly intervals, and specific days of the week.
- Support standard notifications and loud full-screen alarms for medication reminders.
- Log medication doses directly into the SQLite database and display them in the chronological Timeline.
- Integrate upcoming doses widget and quick actions on the Dashboard.
- Preserve all medication history when a treatment is paused or completed.
- Provide full i18n support (English and Spanish) and responsive Dark/Light themes.

## Non-Goals

- Refactoring or generalizing the Appointments tab in this change (kept as a separate future milestone).
- Cloud synchronization or multi-device remote notifications (stays offline-first with local SQLite).
- Drug interaction checking or automated medical dosage recommendations.

## Capabilities

### New Capabilities
- `medication-tracking`: Comprehensive management of medication profiles, recurrence schedules (fixed times, intervals, day filters), treatment lifecycle statuses (active, paused, finished), dose administration logging, and Timeline integration.

### Modified Capabilities
- `alarms-notifications`: Extend notification channel routing, full-screen alarm handler, category quick actions, and schedule calculation to handle medication reminder alarms and dose logging responses.

## Impact

- **Database**: New SQLite tables `medications` and `medication_logs` added to `src/db/schema.ts` and initialized in `src/db/client.ts`.
- **Services**: `notificationService.ts` and `useAlarmRingingStore.ts` extended to handle medication alert triggers, categories, and actions.
- **State Management**: New Zustand store `useMedicationStore.ts` for managing active medications, dose logs, and pending reminders.
- **UI Components & Screens**: New `MedicationsScreen.tsx`, `MedicationModal.tsx`, `LogDoseModal.tsx`, and updates to `BottomNavBar.tsx`, `DashboardScreen.tsx`, and `TimelineItem.tsx`.
- **Localization**: New translation keys in `src/i18n/locales/en.json` and `src/i18n/locales/es.json`.
