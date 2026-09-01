## Why

Currently, the appointments module is restricted to pediatrician and medical visits, expecting doctors and medical specialties. However, parents also need to manage appointments for routine vaccinations, administrative paperwork (e.g., identity cards, health insurance procedures), and general family appointments. Generalizing appointments with distinct categories allows users to organize all their baby-related commitments in one place with tailored information.

## What Changes

- Add appointment categorization supporting four initial types: Medical (`medical`), Vaccine (`vaccine`), Administrative (`administrative`), and Other (`other`).
- Adapt the appointment creation modal dynamically based on the selected category:
  - **Medical**: Displays doctor name and medical specialty fields.
  - **Vaccine / Administrative / Other**: Hides medical-specific fields to provide a clean, relevant input form while retaining universal fields (title, date/time, location/venue, notes, calendar sync, and advance notifications).
- Enhance appointment lists and dashboard previews with category-specific badges, icons, and themes.
- Generalize notification titles, reminders, and localized copy in English and Spanish to accommodate non-medical appointments without awkward doctor-centric wording.
- Maintain backward compatibility by defaulting existing stored appointments to the `medical` category.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `appointment-tracking`: Updated to support multi-category appointment scheduling (medical, vaccine, administrative, other) with dynamic field validation and generalized reminder messaging.

## Impact

- **Database**: SQLite schema update on the `appointments` table to include a `category` column (defaulting to `'medical'`).
- **UI Components**: `AppointmentModal`, `AppointmentsScreen`, `DashboardScreen` appointment banners, and category selectors.
- **Store & Repositories**: `useAppointmentStore` and `appointmentRepository` to handle the `category` property.
- **Localization**: Updated strings in `src/i18n/en.json` and `src/i18n/es.json`.
- **Services**: `notificationService` and `calendarService` handling generic appointment alerts and calendar event descriptions.
