## 1. Storage and Database Schema Updates

- [x] 1.1 Update `src/db/schema.ts` reminders table to add `alertMode` ('notification' | 'alarm') and `soundName` columns, and verify drizzle types compile
- [x] 1.2 Update `src/db/repositories/reminderRepository.ts` to support saving and updating `alertMode` and `soundName`
- [x] 1.3 Create or update preference store (`usePreferencesStore.ts` or `useThemeStore.ts`) to persist `alarmSound` and `smartNightMode` settings with AsyncStorage

## 2. Notification Service & Sound Enhancements

- [x] 2.1 Update `src/services/notificationService.ts` to create distinct channels (`feeding-notifications` and `feeding-alarms`) with appropriate audio attributes (`USAGE_ALARM`), sound configuration, and vibration patterns
- [x] 2.2 Update `scheduleFeedingAlarm` in `notificationService.ts` to accept `alertMode` and `soundName` and trigger through the corresponding channel
- [x] 2.3 Implement sound preview utility for Settings to test and preview alarm sound options

## 3. Settings Screen Configuration UI

- [x] 3.1 Add "Alarms & Reminders" section to `src/screens/SettingsScreen.tsx` with alarm sound selector modal/picker and sound preview button
- [x] 3.2 Add Smart Night Mode suggestion switch to `SettingsScreen.tsx` with toggle persistence
- [x] 3.3 Add English and Spanish translation keys in `src/i18n/` for all new settings, alarm labels, and options

## 4. Feeding Reminder Prompt Enhancements

- [x] 4.1 Update `src/components/FeedingReminderPrompt.tsx` with a visual toggle for Alert Mode (`🔔 Notification` vs `⏰ Alarm`)
- [x] 4.2 Integrate Smart Night Mode check in `FeedingReminderPrompt.tsx` to automatically default to Alarm when target time falls within nighttime hours (22:00 - 07:00) if enabled
- [x] 4.3 Add custom exact time picker option to `FeedingReminderPrompt.tsx` alongside preset interval buttons

## 5. Dashboard Active Reminder Actions & Edit Modal

- [x] 5.1 Create `src/components/EditReminderModal.tsx` allowing caregivers to modify target time with `DateTimePickerInput`, toggle Alert Mode, or cancel the reminder
- [x] 5.2 Update `src/store/useFeedingStore.ts` with actions: `postponeActiveReminder(babyId, minutes)` and `updateActiveReminder(babyId, newTargetTime, alertMode)`
- [x] 5.3 Enhance the active reminder card in `src/screens/DashboardScreen.tsx` with distinct notification vs alarm badges, inline `+15m` / `+30m` quick delay buttons, and tap-to-edit action opening `EditReminderModal`

## 6. Testing & Documentation

- [x] 6.1 Update and add unit tests in `src/__tests__/` covering reminder scheduling, postponement, mode switching, and repository methods
- [x] 6.2 Run test suite (`npm test`) and verify all automated tests pass
- [x] 6.3 Update `package.json` version and review/update `README.md` with the new alarm customization and quick action capabilities
- [x] 6.4 Perform final verification across all requirements and scenarios outlined in proposal and specs
