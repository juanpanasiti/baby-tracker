## Purpose

Provides scheduled local push notifications and alarms for upcoming feeding intervals and medical appointments without requiring remote server infrastructure.

## Requirements

### Requirement: Schedule Local Push Alarm
The system SHALL support scheduling local notifications with sound and banner alerts for future timestamps using native notification triggers.

#### Scenario: Scheduled feeding alarm triggers
- **WHEN** the scheduled time for a feeding alarm is reached
- **THEN** the system SHALL display a high-priority local notification with sound alerting the caregiver

### Requirement: Dismiss and Cancel Active Alarms
The system SHALL allow users to view scheduled active alarms and cancel or dismiss them before they trigger.

#### Scenario: User logs an early feeding
- **WHEN** the user logs a new feeding before an active alarm fires and chooses to cancel the pending alarm
- **THEN** the system SHALL cancel the pending notification via the notification service and update the alarm state

### Requirement: Appointment Advance Reminders
The system SHALL support scheduling advance reminder notifications for upcoming medical appointments (e.g., 24 hours prior and 2 hours prior).

#### Scenario: Advance reminder configured for appointment
- **WHEN** an appointment is saved with advance reminders enabled
- **THEN** the system SHALL schedule local notifications corresponding to the configured advance reminder intervals
