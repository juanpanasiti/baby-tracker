## Purpose

Manages local application preferences including theme (Dark and Light), localization (English and Spanish), alarm sounds, and smart nighttime suggestions with local persistence.

## Requirements

### Requirement: Theme Selection and Persistence
The system SHALL support Dark and Light color themes, defaulting to Dark theme, and SHALL persist the user's theme selection across app restarts.

#### Scenario: User toggles theme to Light
- **WHEN** the user selects Light theme in settings
- **THEN** the UI SHALL immediately update its color tokens to the light palette and persist the setting locally

#### Scenario: App cold start restores saved theme
- **WHEN** the app starts up
- **THEN** the system SHALL read the saved theme preference (defaulting to Dark if unset) and apply it before initial render

### Requirement: Language Selection and Persistence
The system SHALL support English and Spanish languages, defaulting to English, and SHALL persist the user's selected language across app restarts.

#### Scenario: User switches language to Spanish
- **WHEN** the user selects Spanish in settings
- **THEN** all app labels, buttons, messages, and placeholders SHALL immediately render in Spanish and the choice is persisted locally

### Requirement: Alarm Sound Selection and Persistence
The system SHALL allow users to select their preferred alarm sound from available sound options (including system default and bundled alarm tones) in Settings, and SHALL persist this choice locally.

#### Scenario: User selects a custom alarm sound
- **WHEN** the user selects a sound in Settings
- **THEN** the system SHALL preview the sound, persist the selection in local preferences, and configure subsequent loud alarms to use the selected sound

### Requirement: Smart Night Mode Suggestion Configuration
The system SHALL allow users to enable or disable an automatic night mode alert suggestion in Settings, which automatically preselects "Alarm" mode during nighttime hours (22:00 to 07:00) when setting a reminder.

#### Scenario: Night mode suggestion enabled during night hours
- **WHEN** smart night mode is enabled and the user creates a feeding reminder whose target time falls between 22:00 and 07:00
- **THEN** the reminder prompt SHALL default its alert mode toggle to "Alarm" while preserving the caregiver's ability to switch to "Notification" manually

### Requirement: App Branding and About Information
The system SHALL present the application name as "Baby Care" across the splash/loading screen, Settings About card, and permission requests, maintaining consistent brand naming across English and Spanish locales.

#### Scenario: User views About section in Settings
- **WHEN** the user navigates to the Settings screen
- **THEN** the About card SHALL display the title "Baby Care" along with the current app version and offline storage status

#### Scenario: User launches application during initial load
- **WHEN** the application is cold starting and initializing local storage and database schemas
- **THEN** the loading indicator screen SHALL display "Loading Baby Care..."

#### Scenario: User switches language between English and Spanish
- **WHEN** the user switches language preference in Settings
- **THEN** the About title header in Settings SHALL preserve the brand name "Baby Care" in both locales ("About Baby Care" in English and "Acerca de Baby Care" in Spanish)

### Requirement: Persistent Alarm Re-Alert Settings
The system SHALL provide user-configurable preferences for persistent alarm re-alerts ("nagging"), including an enable/disable toggle, re-alert interval duration, and maximum repeat count limit, persisting all selections locally across app restarts.

#### Scenario: User toggles persistent alarm re-alert
- **WHEN** the user enables or disables persistent alarm re-alerts in Settings
- **THEN** the system SHALL immediately update and persist the preference, and apply the setting to all subsequent alarm silencing actions

#### Scenario: User configures re-alert interval
- **WHEN** the user selects a re-alert interval in Settings (e.g., 2 min, 5 min, 10 min, 15 min; default 5 min)
- **THEN** the system SHALL persist the selected interval and use it to compute future re-alert target times

#### Scenario: User configures maximum repeat limit
- **WHEN** the user selects a maximum repeat limit in Settings (e.g., Indefinite / No limit, 3 times, 5 times, 10 times; default Indefinite)
- **THEN** the system SHALL persist the preference and enforce the limit when re-arming silenced alarms


