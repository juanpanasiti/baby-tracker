## Why

Parents need a way to track their baby's weight and length over time. While weight and height are measured infrequently compared to daily feeding and diaper routines (often during pediatric appointments or occasional home weigh-ins), tracking physical growth is a critical indicator of infant health and development. Providing simple growth logging, historical progression with gain calculations, and customizable dashboard visibility ensures parents can monitor growth milestones without cluttering their everyday care routine.

## What Changes

- **New Growth Tracking Capability**: Create a dedicated SQLite table and repository for recording weight (in kg) and height (in cm), along with timestamp, optional notes, and created date.
- **Growth History & Entry UI**: Provide an intuitive modal for logging new growth measurements and viewing historical records with calculated growth differences (weight gain/loss and height difference since previous measurement).
- **Profile Header Growth Pill**: Show the latest recorded weight and elapsed time (e.g., "5.250 kg • 2 weeks ago") directly in the Baby Profile header on the Dashboard.
- **Configurable Display Preferences**: Add user settings to toggle whether growth metrics appear in the baby profile header and whether incremental gain/difference calculations are shown, allowing parents to keep the UI clean if desired.
- **Timeline Integration**: Support growth measurement events in the Activity Timeline with a dedicated filter pill ("Growth") and edit/delete capabilities.
- **Localization**: Full English and Spanish localization for all growth-related labels, measurement units, and settings.

## Capabilities

### New Capabilities
- `growth-tracking`: Provides persistence, validation, progression calculation, and management for infant weight and height measurements.

### Modified Capabilities
- `baby-profile`: Supports displaying the latest recorded weight and measurement recency within the profile card, with interactive navigation to the growth history.
- `app-preferences`: Supports user preferences for toggling growth visibility on the profile header and showing gain calculations.
- `activity-timeline`: Supports rendering, filtering, and managing growth measurement events in the activity timeline.

## Impact

- **Database**: Adds a new table `growth_records` in Drizzle SQLite schema, with corresponding CRUD operations in repository and store.
- **State Management**: Introduces `useGrowthStore` and extends `usePreferencesStore` with growth display settings.
- **UI Components**:
  - `ProfileHeader.tsx`: Adds optional growth metric pill.
  - `GrowthModal.tsx` / `GrowthHistoryModal.tsx`: New modals for recording measurements and browsing historical progression.
  - `TimelineItem.tsx` and `TimelineScreen.tsx`: New growth item renderer and filter tab.
  - `SettingsScreen.tsx`: New Growth Tracking preference toggles.
- **i18n**: Updates `en.json` and `es.json` with growth tracking translations.
