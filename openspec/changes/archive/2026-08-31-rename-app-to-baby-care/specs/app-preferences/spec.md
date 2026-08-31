## ADDED Requirements

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
