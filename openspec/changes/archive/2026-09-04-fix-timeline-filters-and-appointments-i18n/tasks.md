## 1. Localization Updates

- [x] 1.1 Add `"add": "Add"` to `"common"` in `src/i18n/en.json` and `"add": "Agregar"` to `src/i18n/es.json`, and verify the keys exist in both dictionary files.
- [x] 1.2 Add `"timeline"` dictionary entries with `"filters"` (`all`, `feedings`, `diapers`, `medications`) in `src/i18n/en.json` and `src/i18n/es.json`, and verify bilingual consistency.

## 2. UI Component Enhancements

- [x] 2.1 Update `AppointmentsScreen.tsx` add button to use `t('common.add', { defaultValue: 'Add' })` and verify "+ Add" / "+ Agregar" renders without raw dictionary keys.
- [x] 2.2 Update `TimelineScreen.tsx` to wrap the filter chips in a horizontal `ScrollView` with `showsHorizontalScrollIndicator={false}` and `contentContainerStyle={styles.filtersRow}`.
- [x] 2.3 Update `TimelineScreen.tsx` `filterTabs` array to utilize localized strings (`timeline.filters.*`) for all filter tabs.

## 3. Verification & Validation

- [x] 3.1 Run TypeScript type check (`npx tsc --noEmit`) and verify zero errors.
- [x] 3.2 Verify UI in both English and Spanish on Android emulator to confirm horizontal filter scrolling in Timeline and proper "+ Add" / "+ Agregar" button rendering in Appointments.
- [x] 3.3 Bump version to 1.7.1, increment iOS buildNumber to 12, and Android versionCode to 12 in `app.json` and `package.json`.
