## Context

Currently, `FeedingModal` and `DiaperModal` create records stamping `Date.now()` without datetime controls. `TimelineScreen` only supports deleting records. The database schema already stores `timestamp` as an integer (Unix milliseconds) across `feedings` and `diapers`.

## Goals / Non-Goals

**Goals:**
- Provide a consistent, reusable `DateTimePickerInput` component supporting quick time presets (`Now`, `-15m`, `-30m`, `-1h`) and manual date/time input fields (DD, MM, YYYY, HH, MM).
- Integrate custom timestamp selection into `FeedingModal` and `DiaperModal`.
- Support full editing of existing feeding and diaper records directly from `TimelineItem` using the existing modals pre-populated with active record data.
- Update repository methods and Zustand stores to handle `updateFeeding` and `updateDiaper`.

**Non-Goals:**
- Schema modifications (existing `timestamp` column already supports arbitrary timestamps).
- Modifying appointment scheduling UI (already uses its own dedicated date/time flow).

## Decisions

### 1. Reusable DateTimePicker Component (`DateTimePickerInput`)
- **Decision**: Create a dedicated component `DateTimePickerInput` containing quick buttons (`Now`, `-15m`, `-30m`, `-1h`) and manual numeric inputs for Date (DD / MM / YYYY) and Time (HH : MM).
- **Rationale**: Keeps inputs cross-platform, fast, lightweight, and consistent across the app without requiring additional native dependencies or modal pickers.
- **Alternatives Considered**: Native `@react-native-community/datetimepicker` (rejected to avoid additional native build dependencies and maintain instant parity across iOS/Android/Web).

### 2. Modal Reuse for Creation and Editing
- **Decision**: Extend `useFeedingStore` and `useDiaperStore` with `editingFeeding: Feeding | null` and `editingDiaper: Diaper | null`, along with `openEditFeedingModal(feeding)` and `openEditDiaperModal(diaper)`.
- **Rationale**: Maximizes UI code reuse between create and edit workflows. The modal title and action button dynamically reflect "Create" vs "Edit" (or localized equivalent). When saving in edit mode, it calls repository update instead of insert.
- **Alternatives Considered**: Dedicated edit screens or separate edit modals (rejected as redundant and harder to maintain).

### 3. Timeline Item Edit Trigger
- **Decision**: Add an edit icon button (Pencil icon) alongside the existing delete button (Trash icon) in `TimelineItem`.
- **Rationale**: Immediate discovery and distinct action without confusing tap-to-expand vs tap-to-edit.

## Risks / Trade-offs

- **[Risk] User enters invalid date numbers (e.g. day 32 or hour 25)** → **Mitigation**: Validate date components on save with clear error messages and fallback to valid ranges.
- **[Risk] Updating a feeding record's timestamp changes timeline ordering** → **Mitigation**: Repositories already order by `timestamp DESC`, and the store re-fetches or sorts automatically upon update.
