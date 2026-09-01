## 1. Database Schema & Migration

- [x] 1.1 Update Drizzle schema in `src/db/schema.ts` to add `category` enum column (`'medical' | 'vaccine' | 'administrative' | 'other'`) with default `'medical'` and export updated types.
- [x] 1.2 Update database initialization in `src/db/client.ts` with backward-compatible migration logic (`ALTER TABLE appointments ADD COLUMN category TEXT DEFAULT 'medical'`) and verify existing SQLite tables load properly.
- [x] 1.3 Update `appointmentRepository.ts` to include `category` in inserts and queries.

## 2. Localization & Services

- [x] 2.1 Update `src/i18n/en.json` and `src/i18n/es.json` with localized strings for categories, dynamic form field labels, and generic appointment reminders.
- [x] 2.2 Update `notificationService.ts` and `useAppointmentStore.ts` to support category-aware reminder notifications and calendar sync.

## 3. UI Components & Screens

- [x] 3.1 Create/integrate Category selector component in `src/components/AppointmentModal.tsx` with dynamic field rendering (showing doctor/specialty only for `medical` and hiding them for `vaccine`, `administrative`, and `other`).
- [x] 3.2 Update `src/screens/AppointmentsScreen.tsx` to render category badges, icons, and styling for scheduled appointments.
- [x] 3.3 Update `src/screens/DashboardScreen.tsx` to render the upcoming appointment banner with category-specific icon and styling.

## 4. Documentation, Versioning & Validation

- [x] 4.1 Update app version in `package.json` / `app.json` if applicable.
- [x] 4.2 Review and update `README.md` to reflect the generic appointment tracking capabilities.
- [x] 4.3 Run existing unit/integration tests and typechecks (`npm test`, `npx tsc --noEmit`) to verify all changes pass without regressions.
- [x] 4.4 Perform final end-to-end validation to ensure all requirements defined in the proposal and delta specs are satisfied.
