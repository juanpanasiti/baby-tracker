## Why

The application needs custom branding and visual identity. Currently, generic placeholder assets are configured. A new brand image (`assets/image.png`) has been provided to serve as the application's primary icon, splash screen icon, Android adaptive icon, and web favicon.

## What Changes

- Generate optimized icon variants from `assets/image.png`:
  - `assets/icon.png`: 1024x1024 px standard app icon for iOS and fallback.
  - `assets/adaptive-icon.png`: 1024x1024 px foreground image with appropriate padding (~66% safe zone) to ensure it is not clipped by Android launcher masks.
  - `assets/splash-icon.png`: 1024x1024 px centered splash screen icon.
  - `assets/favicon.png`: 48x48 px favicon for web platform.
- Ensure `app.json` configuration references all generated assets properly with appropriate dark mode background color (`#121212`).

## Capabilities

### New Capabilities
None (pure asset and branding configuration change).

### Modified Capabilities
None (`skip_specs: true` set).

## Impact

- `assets/`: Replaces `icon.png`, `adaptive-icon.png`, `splash-icon.png`, and `favicon.png` with rendered assets derived from `assets/image.png`.
- `app.json`: Verifies and keeps consistency across Expo icon, splash, adaptiveIcon, and web favicon configurations.
