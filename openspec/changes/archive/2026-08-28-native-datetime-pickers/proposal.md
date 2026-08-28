## Why

Currently, forms across the application (`FeedingModal`, `DiaperModal`, `AppointmentModal`, and `ProfileModal`) require users to manually type dates and times across multiple separate text input fields (`DD`, `MM`, `YYYY`, `HH`, `MM`). This is tedious, error-prone on mobile screens, and inconsistent across different screens. Integrating standard native date and time pickers with intuitive touch controls and quick-adjustment presets significantly streamlines logging baby activities and scheduling appointments.

## What Changes

- Install and integrate `@react-native-community/datetimepicker`.
- Create a reusable, localized `DateTimePickerInput` component featuring formatted date and time touch triggers, native OS picker modals (calendar / clock), and optional quick presets (`Now`, `-15 min`, `-30 min`, `-1 hr`).
- Create a dedicated `DatePickerInput` component for date-only selections (such as baby birth date in `ProfileModal`, enforcing maximum date restrictions).
- Refactor `FeedingModal` to use `DateTimePickerInput` for milk and meal timestamps.
- Refactor `DiaperModal` to use `DateTimePickerInput` for diaper change timestamps.
- Refactor `AppointmentModal` to use `DateTimePickerInput` for scheduling appointments.
- Refactor `ProfileModal` to use `DatePickerInput` for baby birth date selection.
- Update helper utilities in `src/utils/date.ts` to support localized date and time formatted strings.

## Capabilities

### New Capabilities
*(None)*

### Modified Capabilities
- `feeding-tracking`: Update timestamp input requirements in feeding logs to use intuitive native date/time pickers and quick presets.
- `diaper-tracking`: Update timestamp input requirements in diaper logs to use intuitive native date/time pickers and quick presets.
- `appointment-tracking`: Update appointment date and time selection requirements to use native date/time pickers.
- `baby-profile`: Update birth date selection requirements to use a native date picker with future date validation.

## Impact

- **Dependencies**: Adds `@react-native-community/datetimepicker`.
- **Affected Components**: `src/components/DateTimePickerInput.tsx`, `src/components/DatePickerInput.tsx`, `src/components/FeedingModal.tsx`, `src/components/DiaperModal.tsx`, `src/components/AppointmentModal.tsx`, `src/components/ProfileModal.tsx`.
- **Utilities**: `src/utils/date.ts`.
- **Platforms**: Android and iOS native UI dialogs.
