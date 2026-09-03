## MODIFIED Requirements

### Requirement: Full-Screen Feeding Alarm and Continuous Audio Loop
The system SHALL provide a dedicated full-screen alarm interface and background-persistent looping audio engine that keeps ringing at system alarm volume across all application states (foreground, background, screen locked) until the user silences, snoozes, dismisses, or logs the action.

#### Scenario: Caregiver dismisses ringing alarm
- **WHEN** the caregiver taps the "Silence" button on the ringing full-screen alarm or notification action
- **THEN** the system SHALL immediately stop the audio playback and vibration, cancel the active foreground service, and automatically schedule a re-alert alarm to fire after the configured interval (default 5 minutes) unless a feeding record is saved or the reminder is explicitly dismissed

#### Scenario: Caregiver snoozes ringing alarm
- **WHEN** the caregiver taps the "Snooze" button (e.g. +15m) on the ringing full-screen alarm or notification action
- **THEN** the system SHALL immediately stop the looping audio and vibration, dismiss the full-screen alarm, and reschedule the feeding alarm for 15 minutes later

#### Scenario: Caregiver logs dose or feeding directly from alarm
- **WHEN** the caregiver taps "Feed Baby" or "Mark as Taken" on the ringing alarm
- **THEN** the system SHALL immediately silence the audio loop, dismiss the alarm interface, open the corresponding log flow, and maintain the pending re-alert cycle until the record is saved

### Requirement: Medication Reminders and Alarms
The system SHALL support scheduling local notifications and high-priority alarms for medication reminders according to their defined schedule mode, supporting standard notification chimes and loud persistent alarm modes.

#### Scenario: Medication alarm triggers
- **WHEN** a scheduled medication alarm target time is reached
- **THEN** the system SHALL trigger the high-priority alarm notification with full-screen interface, continuous looping audio if in alarm mode, and quick actions ("Take Dose", "Snooze +15m", "Silence", "Dismiss")

#### Scenario: Caregiver silences ringing medication alarm
- **WHEN** the caregiver taps "Silence" on a ringing medication alarm
- **THEN** the system SHALL stop audio playback and vibration, dismiss the full-screen alarm, and automatically schedule a re-alert alarm after the configured interval unless the dose is marked as taken or dismissed

#### Scenario: Caregiver marks ringing medication alarm as taken
- **WHEN** the caregiver taps "Take / Mark as Taken" on a ringing medication alarm
- **THEN** the system SHALL stop audio playback, record the dose administration log, dismiss the alarm, cancel any pending medication re-alerts, and schedule the next recurring dose

## ADDED Requirements

### Requirement: Unconfirmed Alarm Re-Alert and Log Detection
The system SHALL monitor pending feeding and medication alarm re-alerts and automatically terminate the re-alert cycle upon saving a corresponding care record, explicit dismissal, or reaching the configured maximum repeat limit.

#### Scenario: Feeding logged cancels pending feeding re-alert
- **WHEN** a feeding record is saved in the database while a feeding alarm re-alert is scheduled or ringing
- **THEN** the system SHALL cancel the pending re-alert notification, mark the reminder cycle completed, and prompt or schedule the next interval

#### Scenario: Medication dose logged cancels pending medication re-alert
- **WHEN** a medication dose log is recorded in the database while a re-alert for that medication is scheduled or ringing
- **THEN** the system SHALL cancel the pending re-alert notification and advance the medication reminder schedule

#### Scenario: Caregiver explicitly dismisses reminder without logging
- **WHEN** the caregiver chooses "Dismiss Reminder" from the ringing alarm modal or dashboard reminder card
- **THEN** the system SHALL immediately stop audio playback, cancel all pending re-alert notifications for that reminder, and deactivate the reminder without requiring a false log entry

#### Scenario: Re-alert reaches maximum configured repeat limit
- **WHEN** the re-alert count reaches the user's configured maximum repeat limit (e.g., 3, 5, or 10 repeats)
- **THEN** the system SHALL stop scheduling further re-alerts and leave the reminder marked as overdue without continuously ringing
