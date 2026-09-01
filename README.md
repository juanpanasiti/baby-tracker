# Baby Care

A modern, local-first mobile application built with React Native and Expo (primarily targeting Android) to effortlessly track baby care activities, feeding times, diaper changes, and medical appointments with local alarms and calendar synchronization.

## Overview

Baby Care helps parents and caregivers log and monitor essential baby routines with zero cloud dependency:
- **Baby Profile**: Store and manage baby information including photo avatar, name, sex, and birth date with automated age calculations.
- **Feedings & Reminders**:
  - **Breastfeeding**: Nursing timer with left, right, or both side tracking and manual duration setting.
  - **Bottle Feeding**: Milliliter (ml) volume logging with quick-preset pill selectors.
  - **Custom Date & Time**: Set exact event timestamp with quick offsets (`Now`, `-15m`, `-30m`, `-1h`) and manual date/time inputs.
  - **Dual Alert Modes (Notification vs Loud Alarm)**: Choose between discrete daytime push notifications and loud, insistent nighttime waking alarms using Android `USAGE_ALARM` audio streams.
  - **Persistent Looping Alarm & Lockscreen Wakeup**: Feeding and medication alarms ring continuously in an infinite audio and vibration loop via `@notifee/react-native` with foreground service persistence (`loopSound: true`, `asForegroundService: true`, `SET_ALARM_CLOCK`). When triggered with the phone locked, Android wakes the screen and immediately launches the interactive full-screen alarm over the lockscreen with direct actions to silence, snooze (+15m), or log the dose/feeding without unlocking the device.
  - **Next Feeding Alarms & Exact Time**: Interactive prompt following each log with intervals (2h, 2.5h, 3h, 3.5h, 4h) or custom exact time picker.
  - **Interactive Dashboard Banner & Quick Postpone**: Postpone active reminders with 1-tap buttons (`+15m`, `+30m`) or tap to open the full **Edit Reminder Modal** to adjust target time, toggle alert mode, or cancel.
- **Medications & Treatment Reminders**:
  - **Comprehensive Scheduling**: Support for fixed daily times (e.g. 10:00 & 18:00), hourly intervals (e.g. every 8 hours), and specific days of the week (e.g. Mon/Wed/Fri).
  - **Dosage & Notes**: Configurable dosage instructions (e.g. "4 drops", "2.5 ml", "1 tablet") and doctor's notes.
  - **Treatment Lifecycle**: Mark treatments as active, paused, or finished without losing administration history.
  - **Dual Alert Modes**: Choose between standard notification chimes or insistent loud alarms with full-screen lockscreen intent and continuous looping sound.
  - **Dedicated Medications Screen & Quick Logging**: 5th tab in bottom navigation with active treatments, upcoming dose countdowns, quick "+ Log Dose" modal, and direct dashboard integration with 1-tap "Mark as Taken" and postpone buttons.
- **Diaper Changes**: Track diaper events (pee, poop, or both), rash indicators, custom timestamps, and care notes.
- **Timeline & History Editing**:
  - Reverse chronological timeline with filter tabs for all events, feedings, diapers, or medications.
  - Full inline editing support: tap the edit pencil icon on any feeding or diaper log to update timestamp, amounts, duration, sides, rash status, or notes.
- **Medical Appointments & Calendar**:
  - Schedule pediatrician checkups and specialist visits.
  - Sync events directly to the native device calendar (`expo-calendar`).
  - Configure automated advance notifications (24 hours and 2 hours prior).
- **Theming, Localization & Preferences**:
  - **Themes**: Dark Mode (default) and Light Mode, persisted locally.
  - **Localization**: English (default) and Spanish, persisted locally.
  - **Alarm Sound Customization**: Configurable alarm ringtone (System default, Digital clock, Gentle chimes, Soft bells, Lullaby harp) with bundled high-quality `.wav` audio assets and test preview.
  - **Smart Night Mode**: Optional automatic suggestion that preselects Loud Alarm mode during nighttime hours (22:00 to 07:00).

## Tech Stack

- **Framework**: React Native + Expo (SDK 54)
- **Language**: TypeScript (strictly typed, `noImplicitAny`)
- **Database & Storage**: `expo-sqlite` + `drizzle-orm` (type-safe SQLite persistence)
- **State Management**: `zustand` + `@react-native-async-storage/async-storage`
- **Native Integrations**:
  - `@notifee/react-native`: Android persistent alarm clock engine, infinite audio looping (`loopSound`), lockscreen wakeup (`USE_FULL_SCREEN_INTENT`), and background action handlers (`onBackgroundEvent`)
  - `@react-native-community/datetimepicker`: Native OS date and time picker dialogs (Android Material & iOS modal)
  - `expo-notifications`: High-priority local push notifications & appointment reminders
  - `expo-av`: System alarm stream audio playback and vibration support
  - `expo-calendar`: Native device calendar event creation and sync
  - `expo-image-picker`: Baby profile avatar selection
- **Localization**: `i18next` + `react-i18next` + `expo-localization`
- **Icons**: `lucide-react-native`

## Project Structure

```
├── App.tsx                        # Main application root & providers
├── app.json                       # Expo configuration, plugins & Android permissions
├── assets/                        # Brand, visual & audio assets (sounds, icon, splash)
├── src/
│   ├── components/                # Reusable UI components & modals
│   │   ├── AppointmentModal.tsx   # Medical appointment scheduler
│   │   ├── BottomNavBar.tsx       # Bottom navigation tabs (5 tabs)
│   │   ├── DatePickerInput.tsx    # Reusable date-only picker with constraints
│   │   ├── DateTimePickerInput.tsx # Reusable datetime picker with native dialogs & presets
│   │   ├── DiaperModal.tsx        # Diaper change logger & editor
│   │   ├── EditReminderModal.tsx  # Interactive reminder editor & alert mode selector
│   │   ├── FeedingModal.tsx       # Breast & bottle feeding logger & editor
│   │   ├── FeedingReminderPrompt.tsx # Next feeding alarm scheduler
│   │   ├── FullScreenAlarmModal.tsx # Full-screen ringing alarm with pulse animation & snooze
│   │   ├── LogDoseModal.tsx       # Quick medication dose logger
│   │   ├── MedicationModal.tsx    # Medication & treatment schedule creator/editor
│   │   ├── ProfileHeader.tsx      # Baby info & age calculation banner
│   │   ├── ProfileModal.tsx       # Baby profile creation & editor
│   │   ├── QuickActionButton.tsx  # 1-tap quick action buttons
│   │   └── TimelineItem.tsx       # Interactive activity card with edit & delete
│   ├── db/
│   │   ├── client.ts              # SQLite database client & table init
│   │   ├── schema.ts              # Drizzle ORM schema & types
│   │   └── repositories/          # Type-safe CRUD repositories
│   ├── i18n/                      # English & Spanish translations
│   ├── screens/                   # Main screens (Dashboard, Timeline, Medications, Appointments, Settings)
│   ├── services/                  # Notification, Alarm Audio & Calendar native services
│   ├── store/                     # Zustand stores (Theme, Locale, Baby, Feeding, Diaper, Appointment, Medication, AlarmRinging)
│   ├── theme/                     # Dark & Light color palettes
│   └── utils/                     # Age calculation, ID generator, schedule & date formatters
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
cd baby-care

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

