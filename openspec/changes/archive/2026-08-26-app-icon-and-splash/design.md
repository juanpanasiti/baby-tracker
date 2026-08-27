## Context

The application needs cohesive visual branding across platforms based on `assets/image.png` (a 1254x1254 PNG with transparency).

## Goals / Non-Goals

**Goals:**
- Generate optimized, high-resolution visual assets for Expo (`icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png`).
- Implement safe-zone padding (~66% inner viewport) on `adaptive-icon.png` to avoid Android launcher icon clipping.
- Configure `app.json` to properly display the new assets with consistent background colors.

**Non-Goals:**
- Dynamic / runtime theming of app icons (Android 13+ monochrome icons).
- Video or animated splash screens.

## Decisions

### Decision 1: Asset Generation Method
- **Choice**: Use a Python image processing script (Pillow / PIL) to generate high-fidelity PNG assets with Lanczos resampling.
- **Rationale**: Python is natively available in the environment and Pillow provides accurate alpha blending, high-quality downsampling, and canvas centering.
- **Alternatives Considered**:
  - *Manual editing*: Error-prone and difficult to reproduce.
  - *Directly pointing to `image.png` in `app.json`*: Causes clipping on Android adaptive icon masks and inefficient file sizes for favicon.

### Decision 2: Android Adaptive Icon Safe Zone
- **Choice**: Render `image.png` scaled down to ~680x680 px and centered on a 1024x1024 transparent canvas for `adaptive-icon.png`.
- **Rationale**: Android adaptive icon masks crop outer areas outside the central 66-72dp diameter. Padding ensures key illustration elements remain visible.

### Decision 3: Splash Screen and Background Configuration
- **Choice**: Generate `splash-icon.png` at 1024x1024 and maintain `resizeMode: "contain"` with `backgroundColor: "#121212"` in `app.json`.
- **Rationale**: Preserves seamless dark-mode visual continuity during application boot.

## Risks / Trade-offs

- **[Risk]** Logo details could look small if padded too much on adaptive icons.
  - **Mitigation**: Scale graphic to ~66-68% (approx 680-700px), matching official Android adaptive icon guidelines.
