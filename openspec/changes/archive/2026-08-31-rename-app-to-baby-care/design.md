## Context

The project is an Expo React Native application with local SQLite persistence and EAS build configuration. Currently, all configuration manifests (`app.json`, `package.json`), localization dictionaries (`src/i18n/*.json`), permission dialogues, and source components reference "Baby Tracker" with bundle/package identifiers `com.babytracker.app`. See `proposal.md` for the motivation to rebrand to "Baby Care".

## Goals / Non-Goals

**Goals:**
- Update all occurrences of the app name and identifiers across configuration files, source code, translations, and documentation.
- Maintain consistent "Baby Care" naming across both English and Spanish locale resources.
- Bump the application version (from `1.1.1` to `1.2.0` / versionCode `4` / buildNumber `4`) to signify the rebrand release.

**Non-Goals:**
- In-place data migration across separate Android package sandboxes (clean install for `com.babycare.app`).
- Changing icon and splash image binaries (unless specified in a separate asset update change).

## Decisions

### 1. Rebrand Level & Identifiers
- **Decision**: Execute a Full Rebrand (Option C) covering display names, deep link schemes, and native identifiers:
  - Expo Name: `"Baby Care"`
  - Expo Slug: `"baby-care"`
  - Deep Link Scheme: `"babycare"`
  - Android Package: `"com.babycare.app"`
  - iOS Bundle Identifier: `"com.babycare.app"`
  - npm Package Name: `"baby-care"`
- **Rationale**: Ensures complete consistency across native OS manifests, build tools, store listings, and deep linking instead of leaving fragmented legacy identifiers.
- **Alternatives Considered**:
  - *Display Name Only*: Leaves `com.babytracker.app` and `babytracker://` intact. Discarded because it creates confusion in build outputs, package IDs, and app management.

### 2. Localization Strategy
- **Decision**: Keep the brand name "Baby Care" identical in English and Spanish strings (e.g., `About Baby Care` and `Acerca de Baby Care`).
- **Rationale**: Consistent global product identity across all supported languages.

### 3. Versioning Strategy
- **Decision**: Increment semantic version to `1.2.0`, Android `versionCode` to `4`, and iOS `buildNumber` to `"4"` in `app.json`.
- **Rationale**: Aligns with project versioning rules when releasing significant user-facing and configuration updates.

## Risks / Trade-offs

- **[Risk] Native Sandbox Separation on Existing Physical Devices** → **Mitigation**: Users installing the new APK with `com.babycare.app` will have a fresh sandbox. For internal testing and development, clean installs will be used.
- **[Risk] Broken External Deep Links targeting old `babytracker://`** → **Mitigation**: Update all documentation and integration points to use `babycare://`.

## Migration Plan

1. Update `app.json` with new name, slug, scheme, identifiers, permissions descriptions, and version.
2. Update `package.json` with new package name and description.
3. Update `src/i18n/en.json` and `src/i18n/es.json` with updated brand strings.
4. Update `App.tsx` and `src/screens/SettingsScreen.tsx` for loading and screen titles.
5. Update `README.md` and `openspec/config.yaml` to align project documentation and domain context.
6. Verify TypeScript compilation and automated tests pass.
