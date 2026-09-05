## Context

Parents want to track infant physical growth (weight and height) without cluttering the daily fast-log routines (such as diaper changes and feedings). See `proposal.md` for background and motivation.

Current architecture:
- Local database: SQLite managed via Drizzle ORM and initialized in `src/db/client.ts`.
- State management: Domain-specific Zustand stores (`useBabyStore`, `useFeedingStore`, `useDiaperStore`, `useMedicationStore`, `useAppointmentStore`, `usePreferencesStore`).
- Theming and Localization: Centralized theme store and i18next (`en.json`, `es.json`).
- UI: React Native with Expo, modular modals triggered from stores, and an Activity Timeline.

## Goals / Non-Goals

**Goals:**
- Provide a robust offline SQLite schema and repository for recording baby growth entries (weight in kg, height in cm, timestamps, notes).
- Implement chronological progression with automatic delta calculation between successive measurements (weight diff in grams/kg and height diff in cm).
- Display the latest measurement and elapsed recency on the Dashboard `ProfileHeader`, toggleable via user preferences.
- Provide a dedicated Growth Modal for logging/editing and a Growth History Sheet for reviewing progression.
- Integrate growth records into the Activity Timeline with dedicated filter tabs.
- Full localization in English and Spanish.

**Non-Goals:**
- WHO percentile curve calculation / charts (can be explored as a future enhancement).
- Automatic photo attachments to growth logs.
- Imperial unit conversions (lb/oz) in this phase (standard metric kg/cm first, aligned with existing app metrics like ml).

## Decisions

### 1. Database Schema (`growth_records`)
- **Table Definition**:
  - `id`: `text('id').primaryKey()` (UUID)
  - `babyId`: `text('baby_id').notNull().references(() => babies.id, { onDelete: 'cascade' })`
  - `weightKg`: `real('weight_kg').notNull()` (e.g., 5.250)
  - `heightCm`: `real('height_cm')` (e.g., 58.5, nullable)
  - `timestamp`: `integer('timestamp').notNull()`
  - `notes`: `text('notes')`
  - `createdAt`: `integer('created_at').notNull()`
- **Rationale**: Real numbers allow natural decimal representation in kg and cm. Storing timestamp as an integer epoch aligns with all existing tables in the database.
- **Alternatives considered**: Storing weight as integer grams. While it avoids floating point inaccuracies, the UI deals with kilograms; using standard rounding utilities (`Number(val.toFixed(3))`) on floats is clean and transparent.

### 2. State Management via `useGrowthStore`
- Create `src/store/useGrowthStore.ts` following existing patterns (`useFeedingStore`, `useDiaperStore`).
- Handles:
  - `records: GrowthRecord[]`: sorted by `timestamp` descending.
  - `latestRecord: GrowthRecord | null`.
  - Modals: `isGrowthModalOpen`, `isHistoryModalOpen`, `editingRecord`.
  - CRUD operations updating SQLite and refreshing the store.
- **Progression calculation**: A helper function `calculateGrowthDeltas(records: GrowthRecord[])` computes weight and height differences relative to the next oldest record in chronological order.

### 3. User Preferences in `usePreferencesStore`
- Add two new keys in `usePreferencesStore`:
  - `showGrowthInProfile: boolean` (default: `true`, storage key: `@baby_tracker_show_growth_in_profile`)
  - `showGrowthGain: boolean` (default: `true`, storage key: `@baby_tracker_show_growth_gain`)
- Expose toggles in `SettingsScreen` under a dedicated "Growth Tracking" section.

### 4. UI Architecture & Placement
- **Dashboard ProfileHeader**:
  - Positioned beneath the baby's age.
  - When `showGrowthInProfile` is enabled:
    - If a record exists: renders a stylish chip/pill showing Scale icon (`Scale`), weight in kg, relative time (`"2 weeks ago"`), and gain badge if enabled. Tapping opens the Growth History Sheet.
    - If no record exists: renders an optional subtle "+ Log weight" prompt.
- **Growth Modal (`GrowthModal.tsx`)**:
  - Form dialog for creating/editing records.
  - Includes native date and time pickers, numeric inputs for weight and height, and notes.
- **Growth History Sheet (`GrowthHistoryModal.tsx`)**:
  - Displays list of measurements in chronological reverse order.
  - Shows date, weight, height, calculated gain/diff badge (`▲ +350g`, `▼ -100g`), notes, and Edit/Delete controls.
  - Quick action header button to log a new measurement.
- **Timeline Integration (`TimelineScreen.tsx` & `TimelineItem.tsx`)**:
  - Extends `ActivityItem` union with `{ itemType: 'growth' } & GrowthRecord`.
  - Adds `'growth'` filter chip with localized title and badge count.
  - Renders growth item with distinct icon (`Scale`), weight, height, and action buttons.

## Risks / Trade-offs

- **[Floating point arithmetic in deltas]** → Use a utility function that rounds grams to the nearest whole gram and height to 1 decimal place.
- **[Back-dated entries reordering history]** → Ensure delta calculations always sort by measurement `timestamp` ascending before computing differences, regardless of insertion order.
- **[UI clutter in ProfileHeader]** → Compact badge design with setting toggle ensures parents can hide it completely if preferred.
