## ADDED Requirements

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
