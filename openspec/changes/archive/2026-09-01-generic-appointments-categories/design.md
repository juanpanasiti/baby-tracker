## Context

The baby tracker app uses Expo (React Native), SQLite with Drizzle ORM for local persistence, Zustand for state management, and Expo Notifications/Calendar for device integrations. The current appointment architecture is tightly coupled to medical visits (`doctorName`, `specialty`). We need to generalize this system while preserving backward compatibility and delivering an intuitive user experience.

## Goals / Non-Goals

**Goals:**
- Add four predefined appointment categories (`medical`, `vaccine`, `administrative`, `other`).
- Render form inputs dynamically in `AppointmentModal`: show medical-specific fields (Doctor, Specialty) only when `medical` is selected, and keep a clean interface for all other categories.
- Update `AppointmentsScreen` and `DashboardScreen` to display category icons, badges, and colors.
- Adapt notification scheduling in `notificationService` to support category-aware messaging.
- Maintain backward compatibility for existing records in SQLite.

**Non-Goals:**
- Dynamic user-defined custom categories (fixed categories cover all identified use cases cleanly without complex category CRUD).
- Recurring appointment schedules (handled separately if needed).

## Decisions

### 1. Database Schema & Category Enum
- **Decision**: Add `category: text('category', { enum: ['medical', 'vaccine', 'administrative', 'other'] }).default('medical').notNull()` to the `appointments` table.
- **Rationale**: Adding a column with a default value of `'medical'` ensures zero data loss and flawless backward compatibility for existing appointment records.
- **Alternatives considered**: Separate tables for each appointment type (rejected due to unnecessary duplication of date/time, location, notes, and notifications logic).

### 2. Form Adaptation & UX
- **Decision**: Place a horizontal category chip/pill selector at the top of `AppointmentModal`.
  - When `medical` is selected: display "Doctor / Specialist" and "Specialty" inputs.
  - When `vaccine`, `administrative`, or `other` is selected: omit those fields, keeping universal fields ("Title", "Date & Time", "Location", "Notes / Requirements", and reminder switches).
- **Rationale**: Simplifies the form without visual clutter, making creating a vaccine or passport appointment fast and straightforward.

### 3. Visual Identity per Category
- **Decision**: Define icons and semantic accents for each category:
  - `medical`: `Stethoscope` / `HeartPulse` icon, primary appointment accent.
  - `vaccine`: `Syringe` icon, teal/cyan accent.
  - `administrative`: `FileText` / `Landmark` icon, indigo/blue accent.
  - `other`: `Calendar` icon, purple/neutral accent.
- **Rationale**: Parents can quickly scan their upcoming calendar and immediately distinguish medical visits from administrative tasks or vaccines.

### 4. Localized Notifications
- **Decision**: Update `notificationService.scheduleAppointmentReminder` to accept `category` and generate contextual alarm/notification messages via i18n keys.
- **Rationale**: Prevents awkward alerts like "Turno con Pediatra" for a DNI renewal or routine vaccine.

## Risks / Trade-offs

- **[Risk]** Existing SQLite tables without migration might crash if column `category` is missing on existing databases.
  - **Mitigation**: Ensure database initialization runs an `ALTER TABLE appointments ADD COLUMN category TEXT DEFAULT 'medical'` if the column does not already exist.

## Migration Plan

1. Update Drizzle schema definition.
2. In the database initialization / migration runner, execute column check / alter statement for `category`.
3. Update repository queries and TypeScript types.
