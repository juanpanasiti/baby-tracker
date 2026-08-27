## Why

Caregivers frequently need to log feedings (breastfeeding or bottle) and diaper changes retrospectively (e.g., logging a feeding session that took place 30 minutes earlier) or correct existing entries in the history (e.g., adjusting milk amounts, sides, timestamps, or notes). Currently, logs are automatically stamped with `Date.now()` without datetime selection, and timeline items only support deletion.

## What Changes

- Add custom date and time selection (with current time default and quick offset shortcuts) to feeding and diaper logging modals.
- Enable editing for all fields of existing feeding and diaper records directly from the History / Timeline screen.
- Provide a reusable and accessible DateTimePicker input component for consistent date and time entry.
- Implement repository update methods (`updateFeeding`, `updateDiaper`) and corresponding Zustand store actions.

### Goals
- Allow parents/caregivers to specify custom dates and times when creating feeding and diaper records.
- Allow full editing of any recorded feeding log (timestamp, breast side, duration, bottle ml, notes) from the timeline.
- Allow full editing of any recorded diaper log (timestamp, diaper type, rash indicator, notes) from the timeline.
- Maintain accurate reverse-chronological sorting and metric calculations when timestamps or values are updated.

### Non-Goals
- Migrating database schema (the existing `timestamp` integer column already supports custom Unix millisecond values).
- Changing medical appointment tracking (already includes custom date/time inputs).

## Capabilities

### Modified Capabilities
- `feeding-tracking`: Add support for specifying custom event datetime on creation and editing all attributes of existing feeding records.
- `diaper-tracking`: Add support for specifying custom event datetime on creation and editing all attributes of existing diaper records.

## Impact

- Affected files:
  - Repositories: `feedingRepository.ts`, `diaperRepository.ts`
  - Stores: `useFeedingStore.ts`, `useDiaperStore.ts`
  - UI Components: `FeedingModal.tsx`, `DiaperModal.tsx`, `TimelineItem.tsx`, `TimelineScreen.tsx`, and new reusable `DateTimePickerInput.tsx`
  - Localization: `en.json`, `es.json`
