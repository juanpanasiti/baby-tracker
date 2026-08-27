## 1. Project Initialization and Dependency Setup

- [x] 1.1 Initialize Expo project structure with TypeScript and verify app runs with `npx expo start`
- [x] 1.2 Install core dependencies (`expo-sqlite`, `drizzle-orm`, `drizzle-kit`, `expo-notifications`, `expo-calendar`, `expo-image-picker`, `zustand`, `react-native-svg`, `lucide-react-native`, `i18next`, `react-i18next`) and verify dependency resolution without errors
- [x] 1.3 Configure Expo `app.json` for Android permissions, notification plugins, and notification channels, and verify configuration validity

## 2. Database Layer and Drizzle Schema

- [x] 2.1 Define Drizzle schema for `babies`, `feedings`, `diapers`, and `appointments` tables with strict TypeScript types and verify schema exports
- [x] 2.2 Implement SQLite database initialization and client factory using `expo-sqlite` and verify successful database open and table creation on app start
- [x] 2.3 Create repository service functions for CRUD operations on baby profiles, feedings, diapers, and appointments, and verify query execution

## 3. Localization and Theming Layer

- [x] 3.1 Setup i18n localization store supporting English (default) and Spanish, and verify translation strings for all app domains
- [x] 3.2 Setup Theme store with Dark (default) and Light color palettes and persistent storage, and verify theme switching

## 4. Feature Implementation: Baby Profile

- [x] 4.1 Create Baby Profile creation and editing form with avatar picker using `expo-image-picker` and verify form validation and persistence
- [x] 4.2 Build Profile Header and Summary component for displaying baby info and age calculations, and verify rendering

## 5. Feature Implementation: Feeding Tracking and Alarms

- [x] 5.1 Implement Feeding logging UI with Breastfeeding timer (Left/Right/Both) and Bottle feeding (amount in ml), and verify record creation
- [x] 5.2 Implement post-saving interactive Prompt dialog offering interval options (2.5h, 3h, 3.5h, 4h, custom, skip) to schedule next feeding reminder
- [x] 5.3 Implement local notification scheduling service using `expo-notifications` for feeding alarms, and verify alarm registration and cancel flows

## 6. Feature Implementation: Diaper Tracking

- [x] 6.1 Implement Diaper change logging form (pee, poop, both, diaper rash flag, notes), and verify database persistence
- [x] 6.2 Implement Diaper history list and badge indicators in the activity timeline, and verify reverse chronological ordering

## 7. Feature Implementation: Medical Appointments and Calendar Sync

- [x] 7.1 Implement Appointment scheduling form with date/time pickers, doctor name, specialty, and preparation notes, and verify database storage
- [x] 7.2 Implement Native Calendar export integration using `expo-calendar`, requesting user permissions and verifying calendar event creation
- [x] 7.3 Implement appointment advance notification reminders (24h and 2h before), and verify scheduled triggers

## 8. Dashboard and Activity History

- [x] 8.1 Build Dashboard screen with quick-action buttons (1-tap log), active alarm banners, and next appointment preview, and verify UI responsiveness
- [x] 8.2 Build Activity History / Timeline screen combining feedings and diaper events with filter controls, and verify list rendering

## 9. Testing and Documentation

- [x] 9.1 Add unit and integration tests for repository layer and notification helper utilities, and verify all tests pass
- [x] 9.2 Review and update `README.md` to reflect project structure, setup instructions, architecture, and feature documentation
- [x] 9.3 Perform final end-to-end validation of all requirements and capabilities defined in `proposal.md` and verify acceptance criteria
