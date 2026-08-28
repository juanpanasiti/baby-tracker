## Purpose

Provides scheduled local push notifications and alarms for upcoming feeding intervals and medical appointments without requiring remote server infrastructure.

## Requirements

### Requirement: Schedule Local Push Alarm
The system SHALL support scheduling exact local notifications with sound, high-priority heads-up banners, and wake-lock capability for future timestamps using native notification triggers and high-importance notification channels.

#### Scenario: Scheduled feeding alarm triggers
- **WHEN** the scheduled time for a feeding alarm is reached
- **THEN** the system SHALL wake the device briefly if needed and display a maximum-priority local notification with sound and heads-up banner alerting the caregiver

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

### Requirement: Stale Alarm Cleanup and Catch-up
The system SHALL detect past-due scheduled alarms upon application startup or return to foreground, cancel any lingering operating system scheduled notifications, and ensure the active reminder state accurately reflects that the target time has passed.

#### Scenario: App opened after reminder time has elapsed
- **WHEN** the user opens the application after an active reminder's scheduled target time has passed
- **THEN** the system SHALL cancel the pending operating system notification and update the store reminder status to avoid delayed ghost notifications
