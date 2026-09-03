# Tasks: Fix Safe Area Insets for System Bars

## 1. Setup & Dependencies

- [x] 1.1 Install `react-native-safe-area-context` using `npx expo install react-native-safe-area-context` and verify `package.json` reflects the installed dependency.

## 2. Root Layout & Safe Area Provider

- [x] 2.1 Wrap the root application tree in `SafeAreaProvider` within `App.tsx` and verify clean initialization without provider errors.
- [x] 2.2 Replace React Native core's `SafeAreaView` in `App.tsx` with `SafeAreaView` from `react-native-safe-area-context` scoped to `edges={['top']}`, ensuring the top status bar area has dynamic padding matching `insets.top`.

## 3. Navigation Bar & Modal Inset Adaptations

- [x] 3.1 Refactor `BottomNavBar.tsx` to read `useSafeAreaInsets()`, applying dynamic `paddingBottom: Math.max(insets.bottom, 8)` and removing hardcoded heights so tab buttons sit above the Android system navigation bar.
- [x] 3.2 Update `FullScreenAlarmModal.tsx` to apply dynamic top and bottom safe area insets to its container padding, ensuring dismiss and action buttons are never obscured.

## 4. Documentation & Versioning

- [x] 4.1 Bump application patch version to `1.6.2` in `package.json` and `app.json` following semantic versioning for bug fixes.
- [x] 4.2 Review and update `README.md` to document safe area handling and layout architecture.

## 5. Testing & Final Validation

- [x] 5.1 Run TypeScript typecheck (`npx tsc --noEmit`) and test suite (`npm test`) to verify zero regressions.
- [x] 5.2 Validate that the implementation satisfies all requirements established in the proposal: headers are clear of the status bar, bottom navigation buttons are clear of the Android 3-button navigation bar, and full-screen modals maintain proper safe boundaries.
