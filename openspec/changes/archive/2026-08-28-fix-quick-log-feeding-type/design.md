## Context

See proposal.md for background and motivation.
Currently, `openFeedingModal()` takes no parameters and `FeedingModal` resets `feedingType` to `'breast'` on open whenever `editingFeeding` is null.

## Goals / Non-Goals

**Goals:**
- Provide a clean, type-safe way for callers of `openFeedingModal` to indicate the preferred initial tab (`'breast' | 'bottle'`).
- Ensure `DashboardScreen` passes `'bottle'` when tapping the Bottle quick action and `'breast'` when tapping the Breast quick action.
- Maintain backward compatibility so calling `openFeedingModal()` without arguments defaults to `'breast'`.

**Non-Goals:**
- Modifying the underlying SQLite schema or database migrations.
- Changing diaper, bath, sleep, or appointment tracking.

## Decisions

### Decision 1: Pass initial feeding type through `useFeedingStore`
- **Choice**: Add `initialFeedingType?: 'breast' | 'bottle'` to `FeedingState` and accept `initialType?: 'breast' | 'bottle'` in `openFeedingModal(initialType?: 'breast' | 'bottle')`.
- **Rationale**: State synchronization in `FeedingModal` already relies on Zustand store properties (`isFeedingModalOpen`, `editingFeeding`). Having `initialFeedingType` stored in the store maintains a single unidirectional data flow pattern consistent with the rest of the application.
- **Alternatives Considered**:
  - *Passing props directly to FeedingModal*: `FeedingModal` is rendered globally at the root navigation/screen level rather than conditionally inline inside `DashboardScreen`, so store-driven state is the established architectural pattern.

### Decision 2: Fallback to `'breast'` if no parameter is provided
- **Choice**: Default `initialType` to `'breast'` when omitted.
- **Rationale**: Preserves compatibility for any other triggers or tests invoking `openFeedingModal()` without arguments.

## Risks / Trade-offs

- **[Risk]** When editing an existing feeding, `editingFeeding.type` must take precedence over `initialFeedingType`.
  - **Mitigation**: The `useEffect` in `FeedingModal` checks `if (editingFeeding)` first and assigns `editingFeeding.type`. `initialFeedingType` is only applied in the `else` branch (creating a new log).
