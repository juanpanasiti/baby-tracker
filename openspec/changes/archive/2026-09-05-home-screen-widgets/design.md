## Context

See `proposal.md` for motivation. The application is an Expo React Native application targeting Android. Reminders and feeding events are tracked in `useFeedingStore` with SQLite persistence, and medications/doses are calculated via `calculateNextMedicationDose` in `useMedicationStore`. Currently, users must launch the app to see upcoming times. Android home screen widgets operate as separate native processes (`AppWidgetProvider`) outside the JS runtime, requiring explicit serialized data pushes and URI-based deep links for interaction.

## Goals / Non-Goals

**Goals:**
- Provide 3 distinct widget sizes:
  - `BabySchedule1x1`: 1x1 cell (~60x60dp) split view.
  - `BabySchedule1x2`: 1x2 cell (~120x60dp) horizontal dual-card view.
  - `BabySchedule2x2`: 2x2 cell (~140x140dp) comprehensive dashboard view with interactive quick-action buttons.
- Calculate and format the next scheduled feeding time and next scheduled medication dose.
- Display clear, non-misleading fallback states when no events are scheduled (e.g., showing last feeding time instead of an artificial estimate).
- Provide instant deep linking into feeding logging and medication dose logging.
- Automatically synchronize widget state whenever feeding or medication state updates in the app.

**Non-Goals:**
- iOS WidgetKit widgets (this change focuses on Android via `react-native-android-widget`; iOS widgets can be tackled in a future cross-platform phase).
- In-widget interactive forms or text inputs (native Android widget limitations restrict inputs to click actions).
- Second-by-second countdown timers on the widget (OS battery optimizations throttle updates; absolute times such as "14:30" are displayed).

## Decisions

### 1. Widget Engine: `react-native-android-widget`
- **Choice**: Use `react-native-android-widget` with Expo config plugin.
- **Rationale**: Allows building Android widgets using React-like declarative JSX syntax (`FlexWidget`, `TextWidget`) that compiles down to native RemoteViews.
- **Alternatives Considered**: Writing custom native Java/Kotlin AppWidgetProvider classes (higher maintenance and detached from React Native code) or `@bittingz/expo-widgets` (heavier abstraction).

### 2. Centralized Widget Sync Service (`widgetSyncService.ts`)
- **Choice**: Create a dedicated service `syncBabyWidgetsData()` that queries active reminder data from `useFeedingStore` and next medication doses from `useMedicationStore`, formats the payload into a typed `BabyWidgetPayload`, and calls `requestWidgetUpdate` for all 3 widgets.
- **Data Payload**:
  ```typescript
  export interface BabyWidgetPayload {
    babyName: string;
    nextFeedingTime: string | null;      // e.g. "14:30"
    lastFeedingTime: string | null;      // e.g. "11:30"
    nextMedicationName: string | null;   // e.g. "Paracetamol"
    nextMedicationDosage: string | null; // e.g. "2.5 ml"
    nextMedicationTime: string | null;   // e.g. "15:00"
    updatedAt: number;
  }
  ```
- **Rationale**: Decouples the widget rendering logic from individual stores and ensures atomic, consistent data across all 3 widget sizes.

### 3. Widget Sizes & Layout Design
- **1x1 Widget (`BabySchedule1x1Widget.tsx`)**:
  - Top half: 🍼 icon + Next feeding time (or "—").
  - Bottom half: 💊 icon + Next medication time (or "Al día").
  - Click action: Deep link to dashboard or nearest event.
- **1x2 Widget (`BabySchedule1x2Widget.tsx`)**:
  - Left column: 🍼 Next feeding time + last feeding time. Tap targets `babycare://feeding/new`.
  - Right column: 💊 Next medication name, dosage & time. Tap targets `babycare://medications/dose`.
- **2x2 Widget (`BabySchedule2x2Widget.tsx`)**:
  - Header: Baby name + current status.
  - Feeding Section: Card with feeding details and last feeding.
  - Medication Section: Card with medicine name, dosage, and scheduled time.
  - Action Footer: Two separate tap buttons (`+ Comida`, `✓ Remedio`).

### 4. Deep Linking Architecture
- Configure `babycare://` URL scheme handling in `App.tsx` via `expo-linking`:
  - `babycare://feeding/new`: Sets tab to `dashboard` and opens `openFeedingModal()`.
  - `babycare://medications/dose`: Sets tab to `medications` or opens `openLogDoseModal()`.
  - `babycare://dashboard`: Sets tab to `dashboard`.

### 5. Fallback States
- When no active feeding reminder is set: Display "Última: HH:MM" (based on latest feeding) or "Sin programar".
- When no active medication dose is pending: Display "Al día ✨" or "Sin pendientes".

## Risks / Trade-offs

- **[Risk] Widget updates fail if widget is not placed on home screen**
  → **Mitigation**: Handle `widgetNotFound` gracefully without throwing or blocking app flow.
- **[Risk] Expo Go incompatibility**
  → **Mitigation**: `react-native-android-widget` requires native code. Local testing and production use EAS build / `npx expo run:android`. The project already has established EAS build workflows and builds APKs.
- **[Risk] Stale widget display after phone reboot**
  → **Mitigation**: Android system requests a widget render on boot via `AppWidgetProvider.onUpdate`, handled by `widgetTaskHandler` which reads last cached widget data or fallback defaults.
