## 1. Database & Domain Foundation

- [x] 1.1 Add `growth_records` table to `src/db/schema.ts` with TypeScript types and update `src/db/client.ts` table creation DDL, verifying initialization with schema tests
- [x] 1.2 Implement `src/db/repositories/growthRepository.ts` with CRUD methods (create, get by baby, update, delete, get latest) and verify database operations with unit tests


- [x] 1.3 Create `src/utils/growth.ts` with delta calculation logic (weight gain/loss and height difference) and verify with comprehensive unit tests in `src/__tests__/growth.test.ts`


## 2. State Management & Preferences

- [x] 2.1 Extend `src/store/usePreferencesStore.ts` to include `showGrowthInProfile` and `showGrowthGain` toggles with AsyncStorage persistence, verifying behavior with unit tests
- [x] 2.2 Implement `src/store/useGrowthStore.ts` for managing growth records and modal states, and wire record loading in `App.tsx`, verifying with store unit tests



## 3. UI Modals & Profile Integration

- [x] 3.1 Create `src/components/GrowthModal.tsx` for logging and editing weight/height records with native pickers and validation, verifying modal interactions
- [x] 3.2 Create `src/components/GrowthHistoryModal.tsx` displaying chronological measurements with calculated delta badges and action controls, verifying list rendering

- [x] 3.3 Update `src/components/ProfileHeader.tsx` to display the interactive growth badge with recency when enabled in preferences, verifying component rendering


## 4. Timeline & Settings Integration

- [x] 4.1 Update `src/components/TimelineItem.tsx` and `src/screens/TimelineScreen.tsx` to support growth events and a "Growth" filter tab, verifying timeline filtering and actions
- [x] 4.2 Update `src/screens/SettingsScreen.tsx` with a Growth Tracking settings section containing visibility and delta switches, verifying toggle updates


- [x] 4.3 Add English and Spanish translations for all growth tracking keys in `src/i18n/en.json` and `src/i18n/es.json`, verifying localization completeness via `src/__tests__/i18n.test.ts`


## 5. Verification & Documentation

- [x] 5.1 Run test suite (`npm test`) and TypeScript check (`npx tsc --noEmit`) to ensure clean compilation and zero test regressions
- [x] 5.2 Update `README.md` to document the new Growth Tracking capability and updated database structure
- [x] 5.3 Bump version to 1.8.0, increment iOS buildNumber to 13, and Android versionCode to 13 in `app.json`, `package.json`, and `package-lock.json`



