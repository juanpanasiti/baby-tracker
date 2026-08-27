## Why

Parents and caregivers need an intuitive, offline-first mobile application to quickly track daily baby care activities (feeding times, diaper changes, medical appointments) without relying on internet connectivity. In the middle of the night or during pediatrician visits, logging must be frictionless, fast, and coupled with local alarms and reminders for next feedings and scheduled appointments.

## What Changes

- Initialize the React Native Expo application with strictly-typed TypeScript and Expo SDK.
- Configure local SQLite database persistence using `expo-sqlite` and Drizzle ORM for type-safe schema definitions and queries.
- Implement Baby Profile management (single baby profile: name, birth date, sex, and avatar photo).
- Implement Milk Feeding tracking supporting Breastfeeding (with side tracking & timer/duration) and Bottle feeding (volume in ml).
- Implement interactive feeding reminder prompt: upon saving a feeding log, prompt the user with preset intervals (e.g., 2.5h, 3h, 3.5h, 4h or custom) to schedule a local push alarm.
- Implement Diaper Change tracking (pee, poop, both, rash indicator, and optional notes).
- Implement Medical Appointment management with pediatrician/doctor details, scheduled date/time, local reminders, and optional native device calendar export via `expo-calendar`.
- Implement Local Scheduled Push Notifications using `expo-notifications` for feeding alarms and appointment reminders.
- Implement Settings & Preferences with Dark/Light theme (Dark default) and English/Spanish localization (English default).

### Goals
- Fully offline-first storage with instant startup and fast writes.
- Type-safe database operations using Drizzle ORM over `expo-sqlite`.
- Reliable local notifications without external backend dependencies.
- Simple, focused UI optimized for one-tap/quick logging.

### Non-Goals
- Multi-baby profile switching in the initial release (data model maintains foreign key `baby_id` for future scalability, but UI focuses on a single baby).
- Solids and complementary feeding food logs in the initial release (reserved for a follow-up feature).
- Remote cloud backend synchronization or multi-user live sharing.

## Capabilities

### New Capabilities
- `baby-profile`: Create, view, and edit a baby profile (name, sex, birth date, photo avatar).
- `feeding-tracking`: Log breast and bottle feedings, track duration and amounts, and prompt to schedule next feeding alarm.
- `diaper-tracking`: Log diaper changes (pee, poop, both, diaper rash flag, and notes).
- `appointment-tracking`: Schedule doctor visits, configure advance reminders, and sync with native device calendar.
- `alarms-notifications`: Schedule, view, and cancel local push notifications for feeding intervals and appointments.
- `app-preferences`: Persist and switch theme (Dark/Light) and language (English/Spanish).

### Modified Capabilities
*(None - this is the initial application feature set)*

## Impact

- **Dependencies**: React Native, Expo SDK, `expo-sqlite`, `drizzle-orm`, `drizzle-kit`, `expo-notifications`, `expo-calendar`, `expo-image-picker`, `zustand`, `react-native-async-storage/async-storage` or `react-native-mmkv`, `i18next` / `expo-localization`, `react-native-svg` / `lucide-react-native`.
- **APIs / Native Modules**: Device calendar permissions (`expo-calendar`), notification permissions and alarm channels (`expo-notifications`), camera/media library permissions (`expo-image-picker`).
- **Storage**: Local SQLite database file stored in the app document sandbox.
