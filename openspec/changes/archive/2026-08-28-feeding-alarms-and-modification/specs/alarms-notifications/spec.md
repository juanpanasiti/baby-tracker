## ADDED Requirements

### Requirement: Dual Alert Modes for Feeding Reminders
The system SHALL support two distinct alert modes for scheduled feeding reminders: Standard Notification (brief sound and banner suitable for daytime) and Loud Alarm (persistent high-priority sound, strong vibration, and alarm-usage audio channel suitable for waking caregivers at night).

#### Scenario: User schedules a loud alarm for next feeding
- **WHEN** the user selects "Alarm" mode when setting a feeding reminder interval
- **THEN** the system SHALL schedule a local alarm using the dedicated alarm channel with high-priority wake attributes, persistent sound, and custom vibration

#### Scenario: User schedules a standard notification for next feeding
- **WHEN** the user selects "Notification" mode when setting a feeding reminder interval
- **THEN** the system SHALL schedule a standard local notification with normal chime and heads-up banner

### Requirement: Modify Active Feeding Reminders
The system SHALL allow caregivers to view, modify the scheduled time, and change the alert mode of an active feeding reminder directly from the dashboard.

#### Scenario: User modifies active reminder time and mode
- **WHEN** the user taps the active reminder card or edit button and chooses a new time or alert mode in the edit modal
- **THEN** the system SHALL cancel the existing operating system notification, schedule a new notification with the updated parameters, and update the active reminder record

### Requirement: Quick Delay Actions on Active Reminders
The system SHALL provide inline quick-action buttons on the active reminder dashboard card to postpone the reminder by predefined intervals (+15 minutes, +30 minutes).

#### Scenario: User taps quick delay +15 min
- **WHEN** the caregiver taps the +15m button on the active reminder card
- **THEN** the system SHALL reschedule the pending alert to trigger 15 minutes later than its previous target time without requiring opening a modal
