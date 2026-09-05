## Context

In `TimelineScreen.tsx`, category filters are wrapped in a static `View` that does not scroll horizontally, causing chips to overflow screen bounds on small viewports or long text strings. In `AppointmentsScreen.tsx`, the creation button queries `t('common.add')`, but `"add"` is omitted in the i18n dictionaries, resulting in raw translation key strings rendered on the screen.

See `proposal.md` for motivation and background context.

## Goals / Non-Goals

**Goals:**
- Enable smooth horizontal scrolling for timeline category filter chips (`All`, `Feedings`, `Diapers`, `Medications`).
- Provide dedicated, concise localization strings for timeline filters in English and Spanish.
- Supply `"add"` under `"common"` in `en.json` ("Add") and `es.json` ("Agregar").
- Use safe translation syntax in `AppointmentsScreen` with i18next default fallback.

**Non-Goals:**
- Modifying timeline activity sorting, filtering algorithms, or database storage.
- Changing appointment modal structures or calendar sync logic.

## Decisions

### Decision 1: Horizontal ScrollView for Category Filters
- **Choice**: Replace `<View style={styles.filtersRow}>` with `<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>`.
- **Rationale**: Since the category list is small and static (4 filter chips), `ScrollView` avoids the overhead of `FlatList` while providing fluid momentum scrolling and edge padding via `contentContainerStyle`.
- **Alternative considered**: `flexWrap: 'wrap'`. Rejected because multi-line chips consume valuable vertical space needed for activity items.

### Decision 2: Global `common.add` Translation Key
- **Choice**: Add `"add": "Add"` to `en.json` and `"add": "Agregar"` to `es.json` in the `"common"` block.
- **Rationale**: The word "Add" is a foundational verb alongside `"save"`, `"cancel"`, `"edit"`, and `"delete"`. Placing it in `"common"` benefits all present and future modules.
- **Alternative considered**: Using a scoped `appointments.addButton` key. Rejected because `common.add` is a standard convention already expected by `AppointmentsScreen`.

### Decision 3: Dedicated Timeline Filter Translations
- **Choice**: Add `timeline.filters` in `en.json` and `es.json`:
  - `en.json`: `"all": "All"`, `"feedings": "Feedings"`, `"diapers": "Diapers"`, `"medications": "Medications"`
  - `es.json`: `"all": "Todos"`, `"feedings": "Tomas"`, `"diapers": "Pañales"`, `"medications": "Medicamentos"`
- **Rationale**: Currently `filterTabs` borrows modal titles (`feeding.title` = "Log Feeding"), which are verb-heavy and overly wide for filter pills. Dedicated filter nouns provide cleaner UI and better fit.

## Risks / Trade-offs

- **[Touch event interference with vertical list scroll]** → Nested horizontal `ScrollView` within a vertical layout is natively supported by React Native and standard for chip filter bars. Setting `showsHorizontalScrollIndicator={false}` ensures clean visuals without scrollbar clutter.
