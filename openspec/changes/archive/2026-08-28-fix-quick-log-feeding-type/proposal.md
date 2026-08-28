## Why

When tapping the "Biberón" (Bottle) quick action button on the dashboard, the feeding modal currently opens with the "Pecho" (Breast) tab selected by default instead of "Biberón". This forces the user to manually switch the active tab to bottle each time they want to log bottle feeding from the quick action grid.

## User Impact
- **Goals**: 
  - Ensure tapping the "Biberón" (Bottle) quick action opens the feeding modal with the Bottle tab selected.
  - Ensure tapping the "Pecho" (Breast) quick action opens the feeding modal with the Breast tab selected.
  - Retain existing editing behavior when editing an existing feeding record from history/timeline.
- **Non-Goals**:
  - Changing the internal data schema or database structure for feedings.
  - Adding new feeding types.

## What Changes

- Update `useFeedingStore` to allow passing an optional initial feeding type (`'breast' | 'bottle'`) to `openFeedingModal`.
- Update `DashboardScreen` quick action buttons so the bottle button calls `openFeedingModal('bottle')` and the breast button calls `openFeedingModal('breast')`.
- Update `FeedingModal` to initialize and reset the selected tab based on `initialFeedingType` when logging a new entry.
- Update test cases to verify the new quick log modal opening behavior.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `feeding-tracking`: Update quick action opening behavior to respect the chosen feeding type (bottle vs breast).

## Impact

- **Affected Code**: `src/store/useFeedingStore.ts`, `src/screens/DashboardScreen.tsx`, `src/components/FeedingModal.tsx`, `src/__tests__/tracking.test.ts`.
- **Dependencies**: No new dependencies required.
