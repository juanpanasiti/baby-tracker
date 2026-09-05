## ADDED Requirements

### Requirement: Growth Display and Delta Calculation Preferences
The system SHALL provide configurable toggles in Settings for controlling growth visibility in the profile header and showing or hiding comparative growth gain calculations, persisting all selections locally across app restarts.

#### Scenario: User toggles growth metric visibility in profile header
- **WHEN** the user enables or disables "Show growth in profile" in Settings
- **THEN** the system SHALL persist the preference and immediately update the profile card visibility

#### Scenario: User toggles growth gain calculation visibility
- **WHEN** the user enables or disables "Show growth delta calculations" in Settings
- **THEN** the system SHALL persist the preference and update growth views to show or hide incremental gains
