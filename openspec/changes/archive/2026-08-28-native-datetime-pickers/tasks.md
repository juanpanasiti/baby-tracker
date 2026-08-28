## 1. Setup and Dependency Installation

- [x] 1.1 Install `@react-native-community/datetimepicker` using `npx expo install @react-native-community/datetimepicker` and verify package.json is updated.
- [x] 1.2 Add localized date formatting helper functions (`formatDateOnly`, `formatTimeOnly`, `formatDateTimeDisplay`) in `src/utils/date.ts` and verify with unit tests.

## 2. Reusable Picker Components

- [x] 2.1 Rebuild `src/components/DateTimePickerInput.tsx` to render formatted Date and Time pill buttons, trigger native platform pickers, and support optional quick presets (`Now`, `-15 min`, `-30 min`, `-1 hr`). Verify rendering and theme styling.
- [x] 2.2 Create `src/components/DatePickerInput.tsx` for date-only selections supporting `maximumDate` and `minimumDate` constraints. Verify rendering and constraints.

## 3. Form Refactoring

- [x] 3.1 Refactor `src/components/FeedingModal.tsx` to use the new `DateTimePickerInput` for breastfeeding and bottle timestamps, and verify timestamp selection works across both tabs.
- [x] 3.2 Refactor `src/components/DiaperModal.tsx` to use `DateTimePickerInput` for diaper change timestamps, and verify timestamp selection.
- [x] 3.3 Refactor `src/components/AppointmentModal.tsx` to use `DateTimePickerInput` for appointment scheduling, removing duplicate text input fields, and verify appointment date/time persistence.
- [x] 3.4 Refactor `src/components/ProfileModal.tsx` to use `DatePickerInput` for the baby's birth date with maximum date set to today, and verify age calculations.

## 4. Testing, Documentation, and Validation

- [x] 4.1 Update existing unit tests and add new tests in `src/__tests__/utils.test.ts` and `src/__tests__/tracking.test.ts` to verify date formatting and store interactions. Run `npm test` and verify all tests pass.
- [x] 4.2 Review and update `README.md` to document the native datetime picker components and updated dependency list.
- [x] 4.3 Update application version in `package.json` and `app.json` (e.g. to version 1.1.0).
- [x] 4.4 Perform final validation of all forms across light and dark themes to verify adherence to all requirements specified in proposal.md and specs.
