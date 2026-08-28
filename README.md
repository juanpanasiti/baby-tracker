# Baby Tracker

A modern, local-first mobile application built with React Native and Expo (primarily targeting Android) to effortlessly track baby care activities, feeding times, diaper changes, and medical appointments with local alarms and calendar synchronization.

## Overview

Baby Tracker helps parents and caregivers log and monitor essential baby routines with zero cloud dependency:
- **Baby Profile**: Store and manage baby information including photo avatar, name, sex, and birth date with automated age calculations.
- **Feedings & Reminders**:
  - **Breastfeeding**: Nursing timer with left, right, or both side tracking and manual duration setting.
  - **Bottle Feeding**: Milliliter (ml) volume logging with quick-preset pill selectors.
  - **Custom Date & Time**: Set exact event timestamp with quick offsets (`Now`, `-15m`, `-30m`, `-1h`) and manual date/time inputs.
  - **Dual Alert Modes (Notification vs Loud Alarm)**: Choose between discrete daytime push notifications and loud, insistent nighttime waking alarms using Android `USAGE_ALARM` audio streams.
  - **Next Feeding Alarms & Exact Time**: Interactive prompt following each log with intervals (2h, 2.5h, 3h, 3.5h, 4h) or custom exact time picker.
  - **Interactive Dashboard Banner & Quick Postpone**: Postpone active reminders with 1-tap buttons (`+15m`, `+30m`) or tap to open the full **Edit Reminder Modal** to adjust target time, toggle alert mode, or cancel.
- **Diaper Changes**: Track diaper events (pee, poop, or both), rash indicators, custom timestamps, and care notes.
- **Timeline & History Editing**:
  - Reverse chronological timeline with filter tabs for all events, feedings, or diapers.
  - Full inline editing support: tap the edit pencil icon on any feeding or diaper log to update timestamp, amounts, duration, sides, rash status, or notes.
- **Medical Appointments & Calendar**:
  - Schedule pediatrician checkups and specialist visits.
  - Sync events directly to the native device calendar (`expo-calendar`).
  - Configure automated advance notifications (24 hours and 2 hours prior).
- **Theming, Localization & Preferences**:
  - **Themes**: Dark Mode (default) and Light Mode, persisted locally.
  - **Localization**: English (default) and Spanish, persisted locally.
  - **Alarm Sound Customization**: Configurable alarm ringtone (System default, Digital clock, Gentle chimes, Soft bells, Lullaby harp) with test preview.
  - **Smart Night Mode**: Optional automatic suggestion that preselects Loud Alarm mode during nighttime hours (22:00 to 07:00).

## Tech Stack

- **Framework**: React Native + Expo (SDK 54)
- **Language**: TypeScript (strictly typed, `noImplicitAny`)
- **Database & Storage**: `expo-sqlite` + `drizzle-orm` (type-safe SQLite persistence)
- **State Management**: `zustand` + `@react-native-async-storage/async-storage`
- **Native Integrations**:
  - `@react-native-community/datetimepicker`: Native OS date and time picker dialogs (Android Material & iOS modal)
  - `expo-notifications`: High-priority exact local push notifications (`USE_EXACT_ALARM`, `WAKE_LOCK`) with `MAX` importance Android channels for reliable alerts during Doze mode
  - `expo-calendar`: Native device calendar event creation and sync
  - `expo-image-picker`: Baby profile avatar selection
- **Localization**: `i18next` + `react-i18next` + `expo-localization`
- **Icons**: `lucide-react-native`

## Project Structure

```
├── App.tsx                        # Main application root & providers
├── app.json                       # Expo configuration, plugins & Android permissions
├── assets/                        # Brand & visual assets (icon, adaptive-icon, splash, favicon)
├── src/
│   ├── components/                # Reusable UI components & modals
│   │   ├── AppointmentModal.tsx   # Medical appointment scheduler
│   │   ├── BottomNavBar.tsx       # Bottom navigation tabs
│   │   ├── DatePickerInput.tsx    # Reusable date-only picker with constraints
│   │   ├── DateTimePickerInput.tsx # Reusable datetime picker with native dialogs & presets
│   │   ├── DiaperModal.tsx        # Diaper change logger & editor
│   │   ├── EditReminderModal.tsx  # Interactive reminder editor & alert mode selector
│   │   ├── FeedingModal.tsx       # Breast & bottle feeding logger & editor
│   │   ├── FeedingReminderPrompt.tsx # Next feeding alarm scheduler
│   │   ├── ProfileHeader.tsx      # Baby info & age calculation banner
│   │   ├── ProfileModal.tsx       # Baby profile creation & editor
│   │   ├── QuickActionButton.tsx  # 1-tap quick action buttons
│   │   └── TimelineItem.tsx       # Interactive activity card with edit & delete
│   ├── db/
│   │   ├── client.ts              # SQLite database client & table init
│   │   ├── schema.ts              # Drizzle ORM schema & types
│   │   └── repositories/          # Type-safe CRUD repositories
│   ├── i18n/                      # English & Spanish translations
│   ├── screens/                   # Main screens (Dashboard, Timeline, Appointments, Settings)
│   ├── services/                  # Notification & Calendar native services
│   ├── store/                     # Zustand stores (Theme, Locale, Baby, Feeding, Diaper, Appointment)
│   ├── theme/                     # Dark & Light color palettes
│   └── utils/                     # Age calculation, ID generator & date formatters
└── openspec/                      # Specification & change proposals
```

## Development & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ LTS recommended)
- [Expo Go](https://expo.dev/go) app on a physical device, or Android Studio Emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd baby-tracker

# Install dependencies
npm install
```

### Running the App

```bash
# Start the Expo development server
npx expo start
```

### Running Tests

```bash
# Execute Jest unit test suite
npm test
```

## Contributing & Specification Workflow

This project uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for specification-driven development:
- Propose changes: `/opsx-propose "change name"`
- Implement changes: `/opsx-apply "change name"`
- Sync and archive: `/opsx-sync` and `/opsx-archive`

All code, comments, documentation, and pull requests must strictly be in **English**.

