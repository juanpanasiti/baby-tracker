## Why

Parents and caregivers often hold the baby and need quick, at-a-glance visibility into when the next feeding is scheduled and when the next medication dose is due, without needing to unlock the phone, search for the app, and navigate through screens. Native Android home screen widgets provide instant visibility and one-tap deep links directly to logging actions.

## What Changes

- Add native Android home screen widgets using `react-native-android-widget`.
- Implement 3 widget sizes tailored for upcoming feeding and medication schedules:
  - **1x1 (Compact / Micro)**: Displays both next feeding and next medication in a compact split layout.
  - **1x2 (Horizontal Bar)**: Displays next feeding time and last feeding on the left, next medication and dosage on the right, with independent tap targets.
  - **2x2 (Full Dashboard Card)**: Comprehensive card showing baby name/header, feeding details with countdown, medication details with dosage, and direct quick-action buttons.
- Implement deep linking (`babycare://feeding/new`, `babycare://medications/dose`, etc.) to open relevant modals directly upon widget interaction.
- Add an automatic synchronization service (`syncBabyWidgetsData`) that updates widgets whenever feedings, feeding reminders, medications, or medication logs are added, updated, or deleted, as well as on app startup/foreground.

## Capabilities

### New Capabilities
- `home-screen-widgets`: Android home screen widgets in 1x1, 1x2, and 2x2 sizes displaying upcoming feeding and medication dose times with contextual deep links.

### Modified Capabilities
<!-- None: existing core tracking logic remains unchanged -->

## Impact

- **Dependencies**: Adds `react-native-android-widget` and `expo-linking`.
- **Configuration**: Configures `react-native-android-widget` plugin in `app.json` with widget metadata and preview assets.
- **Application Startup**: Registers widget task handler in the root application lifecycle and listens for incoming deep links.
- **Stores**: Integrates widget update pushes into `useFeedingStore` and `useMedicationStore`.
- **Build**: Requires native Android build (EAS build / prebuild) for widget rendering.
