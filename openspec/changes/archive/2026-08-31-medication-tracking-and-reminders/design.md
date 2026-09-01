## Context

The baby tracker currently stores feedings, diapers, and medical appointments in SQLite via Drizzle ORM. Notifications and alarms are scheduled using `expo-notifications` and custom foreground alarm audio / lockscreen modal services.

To provide dedicated medication tracking and reminders, we need a data model that accommodates recurring schedules, dose administration logs, state management, and seamless integration into the existing notification and UI components.

## Goals / Non-Goals

**Goals:**
- Implement offline-first persistence with SQLite tables for medications and dose logs.
- Provide a robust scheduling calculator for fixed times (e.g., 10:00 & 18:00), intervals (e.g., every 8 hours), and specific days of the week.
- Support active, paused, and finished lifecycle statuses to enable stopping notifications without data loss.
- Integrate standard notifications and high-priority alarms with quick action handling (Take / Snooze / Silence).
- Introduce a dedicated 5th tab in bottom navigation along with Dashboard and Timeline integration.

**Non-Goals:**
- Merging appointments and medications into a single generic entity (kept separate for clarity).
- Cloud backend syncing or external push server dependencies.

## Decisions

### 1. Database Schema Design (SQLite & Drizzle ORM)
Create two dedicated SQLite tables in `src/db/schema.ts`:
- `medications`:
  - `id` (TEXT, PK)
  - `babyId` (TEXT, FK -> babies.id ON DELETE CASCADE)
  - `name` (TEXT, not null)
  - `dosage` (TEXT, nullable)
  - `scheduleType` (TEXT: `'fixed_times' | 'interval'`, not null)
  - `fixedTimesJson` (TEXT, nullable: e.g. `'["10:00","18:00"]'`)
  - `intervalHours` (INTEGER, nullable: e.g. `8`)
  - `intervalStartTime` (INTEGER, nullable)
  - `selectedDaysJson` (TEXT, nullable: e.g. `'[1,2,3,4,5,6,7]'`)
  - `endDate` (INTEGER, nullable timestamp)
  - `alertMode` (TEXT: `'notification' | 'alarm'`, default `'alarm'`)
  - `soundName` (TEXT, nullable)
  - `status` (TEXT: `'active' | 'paused' | 'finished'`, default `'active'`)
  - `createdAt` (INTEGER, not null)
  - `updatedAt` (INTEGER, not null)
- `medication_logs`:
  - `id` (TEXT, PK)
  - `babyId` (TEXT, FK -> babies.id ON DELETE CASCADE)
  - `medicationId` (TEXT, FK -> medications.id ON DELETE CASCADE)
  - `medicationName` (TEXT, not null snapshot)
  - `dosage` (TEXT, nullable)
  - `notes` (TEXT, nullable)
  - `timestamp` (INTEGER, not null)

*Rationale*: Storing schedule rules as structured JSON fields (`fixedTimesJson`, `selectedDaysJson`) allows maximum flexibility for varied schedule patterns without complex multi-table joins. `medication_logs` captures snapshot names so historical logs remain intact even if a medication is later edited.

### 2. Next Dose Calculation Engine
Implement pure utility functions in `src/utils/medicationSchedule.ts`:
- `calculateNextMedicationDose(medication, fromTimestamp)`:
  - For `fixed_times`: Iterates from the current date forward across configured active days of the week to find the earliest target time strictly greater than `fromTimestamp`.
  - For `interval`: Computes `lastDoseTime + (intervalHours * 3600 * 1000)` or `intervalStartTime + N * intervalHours`. Checks against optional `endDate`.
- Returns `targetTimestamp` or `null` if the medication schedule has finished.

### 3. Alarm and Notification Integration
- Extend `notificationService.ts`:
  - Add `medication-notifications` and `medication-alarms` channels (or reuse configured high-importance alarm channels).
  - Add `MEDICATION_ALARM_CATEGORY` supporting `TAKE_MEDICATION`, `SNOOZE_ALARM`, and `SILENCE_ALARM`.
  - Handle notification tap / action responses to automatically log the dose via `useMedicationStore.ts` and compute the next dose reminder.
- Update `useAlarmRingingStore.ts` and `FullScreenAlarmModal.tsx`:
  - Support `alarmType: 'feeding' | 'medication'`.
  - Display medication title, dosage, and a "✓ Take Medication" / "Snooze" action.

### 4. Navigation and UI Layout
- Update `BottomNavBar.tsx`:
  - Add `medications` tab key with `Pill` icon from `lucide-react-native`.
  - Layout: `Dashboard`, `Timeline`, `Medications`, `Appointments`, `Settings`.
- `MedicationsScreen.tsx`:
  - Section for **Active Treatments** with next scheduled dose indicators, status badges, and quick log button.
  - Section for **Paused / Completed Treatments** with reactivation and edit options.
  - FAB / header button to add a new medication.
- `DashboardScreen.tsx`:
  - Card for **Upcoming Medications** of the day with quick "✓ Mark as Taken" and "+15m" postponement actions.
  - Quick action button `+ Medication` in dashboard quick actions.
- `TimelineScreen.tsx` & `TimelineItem.tsx`:
  - Add `medication` type to `ActivityItem` union.
  - Render medication name, dosage pill tag, timestamp, and notes.

## Risks / Trade-offs

- **[Risk] Device reboot or app killed drops scheduled OS notifications** → *Mitigation*: Ensure `RECEIVE_BOOT_COMPLETED` trigger and initialize schedule check on app foregrounding to catch up any missed alarms.
- **[Risk] Conflicting overlapping fixed times** → *Mitigation*: The calculation engine sorts fixed times ascending and filters out duplicate times.
- **[Risk] Timezone changes while an interval or fixed schedule is running** → *Mitigation*: Store timestamps in UTC milliseconds and calculate daily hour/minute relative to local device clock at evaluation time.
