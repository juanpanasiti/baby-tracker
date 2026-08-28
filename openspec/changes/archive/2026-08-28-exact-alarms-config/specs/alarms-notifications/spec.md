## MODIFIED Requirements

### Requirement: Schedule Local Push Alarm
The system SHALL support scheduling exact local notifications with sound, high-priority heads-up banners, and wake-lock capability for future timestamps using native notification triggers and high-importance notification channels.

#### Scenario: Scheduled feeding alarm triggers
- **WHEN** the scheduled time for a feeding alarm is reached
- **THEN** the system SHALL wake the device briefly if needed and display a maximum-priority local notification with sound and heads-up banner alerting the caregiver

## ADDED Requirements

### Requirement: Stale Alarm Cleanup and Catch-up
The system SHALL detect past-due scheduled alarms upon application startup or return to foreground, cancel any lingering operating system scheduled notifications, and ensure the active reminder state accurately reflects that the target time has passed.

#### Scenario: App opened after reminder time has elapsed
- **WHEN** the user opens the application after an active reminder's scheduled target time has passed
- **THEN** the system SHALL cancel the pending operating system notification and update the store reminder status to avoid delayed ghost notifications
