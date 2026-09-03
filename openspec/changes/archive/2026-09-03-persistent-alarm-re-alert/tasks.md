## 1. Preferences & Configuration

- [x] 1.1 Add persistent alarm re-alert settings (`alarmNaggingEnabled`, `alarmNaggingInterval`, `alarmNaggingMaxRepeats`) to `usePreferencesStore` with AsyncStorage persistence, and verify default state and update methods.
- [x] 1.2 Add English and Spanish translation keys in `en.json` and `es.json` for alarm re-alert settings, status labels, and modal buttons.
- [x] 1.3 Add persistent alarm re-alert controls (toggle switch, interval selector, max repeats selector) to `SettingsScreen`, and verify visual rendering and state updates.

## 2. Notification Service & Background Handlers

- [x] 2.1 Update `notificationService.ts` to embed re-alert metadata (`isReAlert`, `repeatCount`, `originalTargetTime`) and implement `scheduleReAlertAlarm` for feeding and medication alarms.
- [x] 2.2 Update `useAlarmRingingStore.ts` and `FullScreenAlarmModal.tsx` to handle silencing with auto-rearm, provide an explicit "Dismiss Reminder" action, and verify action bindings.
- [x] 2.3 Update headless background event handler in `index.ts` to schedule re-alerts on `SILENCE_ALARM` when enabled, respecting repeat count limits.

## 3. Log Detection & Reminder State Sync

- [x] 3.1 Update `useFeedingStore.createFeeding` to automatically detect and cancel pending feeding re-alert notifications upon saving a feeding log.
- [x] 3.2 Update `useMedicationStore.logDose` to automatically detect and cancel pending medication re-alert notifications upon marking a dose as taken.
- [x] 3.3 Update `DashboardScreen.tsx` active reminder card to display the silenced re-alert countdown and quick action buttons ("Log Now", "Dismiss").

## 4. Versioning, Testing & Documentation

- [x] 4.1 Bump minor version in `package.json` and `app.json` from `1.6.2` to `1.7.0`.
- [x] 4.2 Create unit tests in `src/__tests__/alarmReAlert.test.ts` verifying re-alert scheduling on silence, auto-cancellation on log creation, explicit dismissal, and max repeat limits.
- [x] 4.3 Run automated test suite (`npm test`) and verify all tests pass cleanly without regressions.
- [x] 4.4 Review and update `README.md` to document the persistent alarm re-alert functionality and configuration options.
- [x] 4.5 Perform final end-to-end validation to confirm all requirements defined in `proposal.md` and capability delta specs are satisfied.
