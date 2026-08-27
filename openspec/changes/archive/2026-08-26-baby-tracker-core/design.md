## Context

The project is an offline-first mobile application built with React Native and Expo, targeting Android as the primary platform. See `proposal.md` for background and user requirements. This design document establishes the architectural patterns, database schemas, and integration points for local storage, notifications, and device calendar sync.

## Goals / Non-Goals

**Goals:**
- Provide a robust, strictly typed data access layer using Drizzle ORM on top of `expo-sqlite`.
- Structure modular state management using Zustand for fast UI reactivity and clean separation of concerns.
- Implement reliable local push notifications using `expo-notifications` for feeding interval alarms and appointment reminders.
- Integrate native calendar event export using `expo-calendar`.
- Ensure instant dark theme rendering on cold start and full English/Spanish i18n support.

**Non-Goals:**
- Remote backend synchronisation, cloud auth, or peer-to-peer data sync.
- Complex multi-child switching UI in the initial milestone (database schema retains `baby_id` foreign keys for clean future extension).

## Decisions

### 1. Storage & ORM: `expo-sqlite` + Drizzle ORM
- **Decision**: Use `expo-sqlite` (modern `useSQLiteContext` / `openDatabaseAsync`) combined with `drizzle-orm`.
- **Rationale**: Drizzle ORM provides full compile-time TypeScript type safety without the bloat of heavy ORMs, while `expo-sqlite` provides battle-tested SQLite bindings on Android and iOS.
- **Alternatives considered**: Raw SQL strings (prone to runtime typing bugs), WatermelonDB (overly complex configuration and Babel decorator requirements).

### 2. Database Schema Design

```typescript
// babies table
export const babies = sqliteTable('babies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  birthDate: integer('birth_date').notNull(),
  sex: text('sex', { enum: ['male', 'female'] }).notNull(),
  photoUri: text('photo_uri'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// feedings table
export const feedings = sqliteTable('feedings', {
  id: text('id').primaryKey(),
  babyId: text('baby_id').notNull().references(() => babies.id),
  type: text('type', { enum: ['breast', 'bottle'] }).notNull(),
  breastSide: text('breast_side', { enum: ['left', 'right', 'both'] }),
  durationSeconds: integer('duration_seconds'),
  amountMl: integer('amount_ml'),
  notes: text('notes'),
  timestamp: integer('timestamp').notNull(),
});

// diapers table
export const diapers = sqliteTable('diapers', {
  id: text('id').primaryKey(),
  babyId: text('baby_id').notNull().references(() => babies.id),
  type: text('type', { enum: ['pee', 'poop', 'both'] }).notNull(),
  hasRash: integer('has_rash', { mode: 'boolean' }).default(false).notNull(),
  notes: text('notes'),
  timestamp: integer('timestamp').notNull(),
});

// appointments table
export const appointments = sqliteTable('appointments', {
  id: text('id').primaryKey(),
  babyId: text('baby_id').notNull().references(() => babies.id),
  title: text('title').notNull(),
  doctorName: text('doctor_name'),
  specialty: text('specialty'),
  appointmentDate: integer('appointment_date').notNull(),
  location: text('location'),
  notes: text('notes'),
  calendarEventId: text('calendar_event_id'),
  reminderNotificationId: text('reminder_notification_id'),
  createdAt: integer('created_at').notNull(),
});
```

### 3. State Management & Preferences
- **Decision**: Use Zustand for UI stores (active timer state, modal triggers) and lightweight persistence (MMKV or AsyncStorage) for theme and language preference settings.
- **Rationale**: Minimal boilerplate, hook-friendly, and decouples state from the component tree.

### 4. Feeding Alarm Scheduling Workflow
- **Decision**: Upon saving a feeding log, render a post-save prompt (dialog / action sheet) asking if the user wants to schedule a reminder for the next feeding (with interval buttons: 2.5h, 3.0h, 3.5h, 4.0h, Custom, or Skip).
- **Rationale**: Keeps the user in control without forcing rigid automatic alarms, accommodating variable feeding routines.

### 5. Local Notifications & Android Channels
- **Decision**: Configure `expo-notifications` with a high-priority Android notification channel (`feeding-alarms` and `appointment-reminders`) with custom vibration and alarm sound settings.
- **Rationale**: On Android, foreground and background delivery requires channel configuration in `app.json` plugins.

## Risks / Trade-offs

- **[Risk]** Android aggressive battery optimization killing background notifications → **Mitigation**: Use `expo-notifications` exact alarm permissions (`SCHEDULE_EXACT_ALARM`) and standard notification channels.
- **[Risk]** Image files in baby profile lost on app cache clear → **Mitigation**: Copy selected profile photos to the app's persistent `FileSystem.documentDirectory`.
- **[Risk]** Database schema migrations during app updates → **Mitigation**: Integrate standard Drizzle migrations or a lightweight schema init runner on app boot.
