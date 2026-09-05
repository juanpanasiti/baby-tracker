## ADDED Requirements

### Requirement: Localized Appointment Action Controls
The system SHALL render fully resolved and localized action controls on the Appointments screen across all supported languages, preventing raw translation key paths from being displayed to the user.

#### Scenario: Add appointment button in English
- **WHEN** the user navigates to the Appointments screen while the application language is English
- **THEN** the creation action button SHALL display "+ Add" and never show raw dictionary keys like "common.add"

#### Scenario: Add appointment button in Spanish
- **WHEN** the user navigates to the Appointments screen while the application language is Spanish
- **THEN** the creation action button SHALL display "+ Agregar" and never show raw dictionary keys like "common.add"
