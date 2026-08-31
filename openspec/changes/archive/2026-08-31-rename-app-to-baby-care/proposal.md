## Why

The application identity is transitioning from "Baby Tracker" to "Baby Care" to better reflect the broader vision of holistic infant care (including feeding, diapering, bathing, and health appointments) rather than solely tracking logs. Applying a full rebrand across user-facing interfaces, configuration manifests, localization catalogs, and platform identifiers aligns the entire codebase with the new product identity.

## What Changes

- **App Display & UI Identity**: Update the user-facing application name to "Baby Care" across the launcher, splash/loading states, Settings "About" section, and permission request dialogs.
- **Localization**: Update English (`en.json`) and Spanish (`es.json`) localization strings to reference "Baby Care" uniformly across both languages.
- **Configuration & Deep Linking**: Update Expo configuration in `app.json` (`name: "Baby Care"`, `slug: "baby-care"`, `scheme: "babycare"`).
- **Native Platform Identifiers (**BREAKING**)**: Update Android package name and iOS bundle identifier from `com.babytracker.app` to `com.babycare.app`.
- **Project Metadata & Documentation**: Update `package.json`, `README.md`, and OpenSpec project context to reflect "Baby Care".

## Goals and Non-Goals

### Goals
- Fully rebrand the application identity to "Baby Care" across UI, configuration, native manifests, and repository documentation.
- Maintain consistent branding across English and Spanish locales.
- Update deep link schemes and native identifiers to match the new name.
- Increment the application version appropriately.

### Non-Goals
- Automatic SQLite migration from old `com.babytracker.app` sandbox to `com.babycare.app` sandbox (new native package installs as a clean fresh application).
- Redesigning visual assets/logos beyond text and identifier branding.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `app-preferences`: Update requirements to specify the "About" information and app branding presentation as "Baby Care" in all supported locales.

## Impact

- **User Impact**: Users see "Baby Care" on their home screens, in-app splash/loading screen, Settings About card, and native OS permission dialogs. Note: on physical devices, the new Android package name installs as a new app with a separate SQLite container.
- **Deep Linking**: Deep links change to use the `babycare://` URI scheme.
- **Build & CI / EAS**: Package configuration and EAS project settings refer to `baby-care` and `com.babycare.app`.
