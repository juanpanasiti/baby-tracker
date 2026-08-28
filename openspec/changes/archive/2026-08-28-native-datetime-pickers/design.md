## Context

Currently, forms across the application (`FeedingModal`, `DiaperModal`, `AppointmentModal`, and `ProfileModal`) manage dates and times using 3 to 5 separate text inputs for day, month, year, hours, and minutes. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Provide a clean, touch-friendly UI for selecting dates and times using platform-native dialogs (`@react-native-community/datetimepicker`).
- Ensure consistent component architecture with reusable `<DateTimePickerInput />` and `<DatePickerInput />` components.
- Retain and enhance quick-time adjustment presets (`Now`, `-15m`, `-30m`, `-1h`) for rapid event capture.
- Support both English and Spanish formatting based on the active locale.
- Support Dark and Light theme styling seamlessly.

**Non-Goals:**
- Building a custom JavaScript calendar or wheel picker from scratch (relying on OS-native pickers).
- Changing database schema or timestamp representations (all timestamps remain Unix epoch milliseconds).

## Decisions

### 1. Library Selection: `@react-native-community/datetimepicker`
- **Rationale**: It is the official, well-maintained community package for Expo/React Native projects providing native Material pickers on Android and native modal/inline pickers on iOS.
- **Alternatives Considered**:
  - *Custom text mask input*: Still requires keyboard interactions and prone to input errors.
  - *Custom JS calendar modal*: Adds heavy JavaScript bundle overhead and lacks native OS tactile feel.

### 2. Component Design & Separation of Concerns
- **`DateTimePickerInput`**:
  - Displays two tactile pill buttons: `[ 📅 Formatted Date ]` and `[ 🕒 Formatted Time ]`.
  - Tapping either button triggers the native OS picker in `date` or `time` mode.
  - Optional `showPresets` prop (defaults to true) to render quick preset chips (`Now`, `-15 min`, `-30 min`, `-1 hr`).
- **`DatePickerInput`**:
  - Dedicated component for date-only fields (e.g. `ProfileModal` birth date).
  - Supports `maximumDate` and `minimumDate` constraints.
- **Alternatives Considered**: Combining everything into a single monolithic component with multiple boolean switches. Kept separated for cleaner prop interfaces and clearer semantic use in forms.

### 3. Native Picker Lifecycle Handling
- On Android, `DateTimePicker` opens as an imperative dialog that calls `onChange` on dismiss or select, requiring hiding the picker state immediately.
- On iOS, `DateTimePicker` renders within a modal container or with confirmed actions to match iOS design conventions.
- State updates update the parent timestamp via `onChange(newTimestamp)`.

### 4. Localized Date & Time Formatting Utilities
- Update `src/utils/date.ts` to provide localized formatting functions (`formatDate`, `formatTime`, `formatShortDate`) respecting the current language (English / Spanish).

## Risks / Trade-offs

- **[Risk] Platform Picker Behavioral Differences (Android dialog vs iOS modal)** → **Mitigation**: Encapsulate platform-specific picker rendering and visibility state inside `DateTimePickerInput` and `DatePickerInput` so consuming modal components have an identical, platform-agnostic API.
- **[Risk] Timezone/Locale inconsistencies** → **Mitigation**: Use standard JavaScript `Date` objects and epoch timestamps (ms) consistently across stores and database layers.

## Migration Plan

1. Install `@react-native-community/datetimepicker` via `npx expo install @react-native-community/datetimepicker`.
2. Add date/time formatting helpers in `src/utils/date.ts`.
3. Create `src/components/DatePickerInput.tsx` and rewrite `src/components/DateTimePickerInput.tsx`.
4. Update `FeedingModal.tsx` and `DiaperModal.tsx` to consume the updated `DateTimePickerInput`.
5. Update `AppointmentModal.tsx` to consume `DateTimePickerInput`.
6. Update `ProfileModal.tsx` to consume `DatePickerInput`.
7. Verify all unit tests and run end-to-end component validation.
