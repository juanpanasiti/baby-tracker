## 1. Store and State Updates

- [x] 1.1 Update `useFeedingStore.ts` to add `initialFeedingType?: 'breast' | 'bottle'` to state and update `openFeedingModal` signature to accept optional `initialType?: 'breast' | 'bottle'`. Verify TypeScript compiles cleanly without errors.
- [x] 1.2 Update `FeedingModal.tsx` to read `initialFeedingType` and set `feedingType` to `initialFeedingType || 'breast'` when opening a new feeding entry. Verify that editing existing records still uses `editingFeeding.type`.

## 2. Dashboard UI Integration

- [x] 2.1 Update quick action button handlers in `DashboardScreen.tsx` so the Bottle button passes `'bottle'` to `openFeedingModal('bottle')` and the Breast button passes `'breast'` to `openFeedingModal('breast')`.

## 3. Testing and Verification

- [x] 3.1 Update and add unit tests in `src/__tests__/tracking.test.ts` to verify `openFeedingModal` correctly sets `initialFeedingType` for bottle and breast modes.
- [x] 3.2 Run test suite with `npm test` to verify all tests pass.
- [x] 3.3 Bump patch version in `package.json` and review `README.md` if any documentation updates are required.
- [x] 3.4 Perform final validation to confirm that quick action buttons open the modal with the intended feeding type selected.
