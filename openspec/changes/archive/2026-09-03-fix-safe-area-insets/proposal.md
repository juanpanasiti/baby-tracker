# Proposal: Fix Safe Area Insets for System Bars

## Why

On Android devices (especially with modern Android 15 edge-to-edge enforcement and 3-button system navigation), the application content overlaps with the top status bar and bottom system navigation bar. The header elements (such as profile avatar, child name, and status text) get drawn behind the status bar clock and battery icons, while the bottom tab navigation buttons and labels get occluded by the system navigation bar (back, home, and recents buttons). This creates touch target conflicts and visual degradation. Implementing proper safe area inset handling resolves these overlaps across all device form factors.

## What Changes

- Add `react-native-safe-area-context` dependency using Expo's compatible package version.
- Integrate `SafeAreaProvider` at the application root in `App.tsx`.
- Replace React Native's iOS-only `SafeAreaView` with a cross-platform safe area implementation that dynamically respects top system status bar insets.
- Update `BottomNavBar` to read dynamic bottom safe area insets via `useSafeAreaInsets()`, ensuring navigation buttons and labels sit comfortably above system navigation gestures and 3-button bars while extending the surface background color into the system navigation area.
- Verify and adapt full-screen modals (e.g., `FullScreenAlarmModal`, form modals) so interactive controls and action buttons are never obscured by top notches or bottom navigation bars.
- Bump application patch version to `1.6.2` according to semantic versioning for bug fixes.

### Goals
- Ensure all top header and screen contents are padded below the device status bar and notch.
- Ensure the bottom tab navigation bar and action buttons are positioned above the system navigation bar (both gesture bar and 3-button navigation).
- Seamlessly extend theme surface colors into the system bar area for a polished edge-to-edge look.
- Maintain full compatibility across Android versions and iOS.

### Non-Goals
- Redesign the bottom navigation layout or replace tab icons.
- Change domain data models or store state logic.
- Force immersive/fullscreen mode that hides system navigation bars permanently.

## Capabilities

### New Capabilities
- `layout-safe-areas`: Defines requirements and scenarios for rendering application screens, persistent navigation bars, and modals within device safe boundaries, preventing occlusions from status bars, display cutouts, and system navigation controls.

### Modified Capabilities
*(None. Existing domain tracking capabilities remain unchanged).*

## Impact

- **Dependencies**: Adds `react-native-safe-area-context` to `package.json`.
- **Root Layout**: Wraps `App.tsx` in `SafeAreaProvider` and updates root view containers.
- **Navigation**: Modifies `src/components/BottomNavBar.tsx` container styles to dynamically compute padding based on bottom safe area insets.
- **Modals**: Adjusts full-screen modals (such as `FullScreenAlarmModal.tsx`) to account for safe area insets.
- **Versioning**: Updates `package.json` and `app.json` versions to `1.6.2`.
