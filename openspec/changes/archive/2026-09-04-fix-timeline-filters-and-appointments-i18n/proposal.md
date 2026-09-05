## Why

Users on the Timeline screen cannot access all activity category filters because the filter container does not support horizontal scrolling, causing chips to be cut off at the screen edge. Additionally, in the Appointments screen, the add button displays raw unresolved translation key text (`common.add`) instead of localized action text ("Add" / "Agregar") due to a missing translation key in the i18n dictionaries.

Fixing these two issues now restores usability and Polish to the Timeline and Appointments navigation flows on mobile devices.

## What Changes

- **Timeline Filter Scrolling & Localization**:
  - Replace the fixed `View` container in `TimelineScreen` with a horizontal `ScrollView` with `showsHorizontalScrollIndicator={false}` so all filter chips can be smoothly scrolled into view on any screen size.
  - Localize the filter tab labels with clean, concise category names (e.g. All, Feedings, Diapers, Medications) in both English and Spanish instead of hardcoded strings or long action modal titles.
- **Appointments Add Button Localization**:
  - Add missing `"add"` key under the `"common"` namespace in `src/i18n/en.json` ("Add") and `src/i18n/es.json` ("Agregar").
  - Provide a safe fallback default value in `AppointmentsScreen` for `t('common.add', { defaultValue: 'Add' })`.

## Capabilities

### New Capabilities
- `activity-timeline`: Provides chronological activity history with horizontally scrollable, localized category filters (All, Feedings, Diapers, Medications).

### Modified Capabilities
- `appointment-tracking`: Ensures appointment management screens display correctly localized action controls and labels without raw translation key fallbacks.

## Impact

- **UI Components**:
  - `src/screens/TimelineScreen.tsx` (scrollable filter row and localized filter tab names)
  - `src/screens/AppointmentsScreen.tsx` (add button translation with default value)
- **Localization**:
  - `src/i18n/en.json` (add `"common.add"`, timeline filter labels)
  - `src/i18n/es.json` (add `"common.add"`, timeline filter labels)
- **Dependencies & APIs**: No new dependencies or database schema migrations required.
