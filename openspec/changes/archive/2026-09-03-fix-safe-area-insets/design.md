# Design: Safe Area Insets for Top and Bottom System Bars

## Context

The application targets Android and iOS using Expo SDK 54 with New Architecture enabled. React Native core's `SafeAreaView` only functions on iOS; on Android, it defaults to a standard `View` with no insets. Modern Android devices default to edge-to-edge rendering, causing the physical status bar (notch, time, battery) and navigation bar (3-button navigation `◀ ● ■` or gesture pill) to draw directly over app components unless window insets are explicitly read and applied.

See `proposal.md` for motivation and `specs/layout-safe-areas/spec.md` for requirements.

## Goals / Non-Goals

**Goals:**
- Provide reliable, dynamic safe area insets on both Android and iOS across all device orientations and navigation styles (3-button, gesture navigation, hole punch / notch).
- Keep top screen headers comfortably below the status bar.
- Elevate `BottomNavBar` buttons and labels above the Android navigation bar while letting the navbar's surface background seamlessly paint the system navigation area.
- Ensure full-screen modals respect safe boundaries.

**Non-Goals:**
- Hiding system bars (immersive sticky mode) or altering native system navigation modes.
- Re-architecting screen navigation stacks or modifying domain stores.

## Decisions

### 1. Adopt `react-native-safe-area-context`
- **Decision**: Install and use `react-native-safe-area-context` (installed via Expo CLI for SDK compatibility).
- **Rationale**: It is the industry standard for React Native and Expo. It provides both component-based (`SafeAreaProvider`, `SafeAreaView`) and hook-based (`useSafeAreaInsets`) access to physical device insets, handling Android WindowInsets and iOS safe areas symmetrically.
- **Alternatives Considered**:
  - *Hardcoded status bar height & platform checks*: Unreliable on Android due to manufacturer-specific notches, camera punch-holes, and differing navigation bar heights (0dp, 16dp, 48dp, 56dp).
  - *Manifest flags (`androidNavigationBar`)*: Cannot prevent status bar overlap and does not solve Android 15 edge-to-edge enforcement.

### 2. Provider at Root and Separation of Top vs. Bottom Insets
- **Decision**: Place `<SafeAreaProvider>` at the root of `App.tsx`.
- **Top Strategy**: Apply top insets at the screen root level (`SafeAreaView edges={['top']}` or `insets.top`). This pushes headers (like `ProfileHeader`) below the status bar while keeping the status bar background matched to `colors.background`.
- **Bottom Strategy**: Do NOT apply `edges={['bottom']}` to the root `App.tsx` container. If applied at root, a plain background gap would appear beneath the navigation bar. Instead, delegate bottom inset handling to `BottomNavBar` using `useSafeAreaInsets()`.

```
┌───────────────────────────────────────────────┐
│              SafeAreaProvider                 │
│  ┌─────────────────────────────────────────┐  │
│  │     SafeAreaView (edges=['top'])        │  │
│  │  - StatusBar                            │  │
│  │  - Active Screen (Dashboard / etc.)     │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │  BottomNavBar                           │  │
│  │  - Tab buttons & labels                 │  │
│  │  - paddingBottom: max(insets.bottom, 8) │  │
│  │  - Background: colors.surface           │  │
│  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
```

### 3. Dynamic `BottomNavBar` Sizing
- **Decision**: Remove fixed `height: Platform.OS === 'ios' ? 84 : 68`. Compute dynamic bottom padding:
  ```ts
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  ```
  And style the container with:
  ```ts
  paddingTop: 8,
  paddingBottom: bottomPadding,
  minHeight: 56 + bottomPadding,
  ```
- **Rationale**: On 3-button Android devices, `insets.bottom` is ~48dp; the tab icons shift up by 48dp while `colors.surface` extends behind the system buttons. On gesture navigation devices (`insets.bottom` ~16-24dp) or devices with hardware keys (`insets.bottom` = 0), `Math.max(insets.bottom, 8)` guarantees a clean, ergonomic baseline.

### 4. Full-Screen Modal Safe Area Alignment
- **Decision**: In `FullScreenAlarmModal.tsx`, replace static `paddingTop: 54, paddingBottom: 40` with `Math.max(insets.top + 16, 44)` and `Math.max(insets.bottom + 20, 32)`.
- **Rationale**: Guarantees alarm buttons and header badges never conflict with cutouts or system navigation gestures during high-priority alarm events.

## Risks / Trade-offs

- **[Risk]** Double padding if both root and child screens apply top insets.
  → **Mitigation**: Standardize on root-level top inset in `App.tsx` (`edges={['top']}`) and remove manual top padding hacks from individual screens.
- **[Risk]** Modal backdrop rendering with letterboxing.
  → **Mitigation**: `FullScreenAlarmModal` already uses `transparent={false}` and full flex layout; dynamic insets will be applied only to inner padding.
- **[Risk]** Package version mismatch with Expo SDK 54.
  → **Mitigation**: Install using `npx expo install react-native-safe-area-context` to guarantee Expo-managed compatible version.

## Migration Plan

1. Install dependency: `npx expo install react-native-safe-area-context`.
2. Wrap `App` in `SafeAreaProvider`.
3. Update `App.tsx` top safe area container.
4. Update `BottomNavBar.tsx` dynamic insets and styles.
5. Update `FullScreenAlarmModal.tsx` insets.
6. Verify layout across Android (3-button & gestures) and bump version to `1.6.2`.
