## 1. Database and Repositories

- [x] 1.1 Add `updateFeeding` method to `feedingRepository.ts` and verify it correctly updates feeding entries by ID in SQLite.
- [x] 1.2 Add `updateDiaper` method to `diaperRepository.ts` and verify it correctly updates diaper entries by ID in SQLite.

## 2. Zustand State Management

- [x] 2.1 Update `useFeedingStore.ts` to include `editingFeeding` state, `openEditFeedingModal`, and `updateFeeding` action, and verify the state correctly propagates to UI consumers.
- [x] 2.2 Update `useDiaperStore.ts` to include `editingDiaper` state, `openEditDiaperModal`, and `updateDiaper` action, and verify the state correctly propagates to UI consumers.

## 3. UI Components and Modals

- [x] 3.1 Create reusable `DateTimePickerInput.tsx` component with quick offset presets (`Now`, `-15m`, `-30m`, `-1h`) and manual date/time inputs, and verify standalone rendering.
- [x] 3.2 Update `FeedingModal.tsx` to embed `DateTimePickerInput`, support pre-filling existing values in edit mode, and call update/create accordingly; verify both create and edit flows.
- [x] 3.3 Update `DiaperModal.tsx` to embed `DateTimePickerInput`, support pre-filling existing values in edit mode, and call update/create accordingly; verify both create and edit flows.
- [x] 3.4 Update `TimelineItem.tsx` and `TimelineScreen.tsx` to add edit button triggers connecting to `openEditFeedingModal` and `openEditDiaperModal`, and verify edit interactions.
- [x] 3.5 Add localization strings for datetime presets and editing actions in `en.json` and `es.json`, and verify language switching.

## 4. Documentation and Testing

- [x] 4.1 Create/update unit tests for feeding repository, diaper repository, and store update operations, and verify tests pass with `npm test`.
- [x] 4.2 Review and update `README.md` to document the new custom datetime and history editing features.
- [x] 4.3 Execute final end-to-end validation across the app to confirm all requirements in `proposal.md` and spec scenarios are met.
