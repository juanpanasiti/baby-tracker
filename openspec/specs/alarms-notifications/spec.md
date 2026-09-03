## Purpose

Provides scheduled local push notifications and alarms for upcoming feeding intervals and medical appointments without requiring remote server infrastructure.

## Requirements

### Requirement: Schedule Local Push Alarm
The system SHALL support scheduling exact local alarms with high-priority heads-up banners, full-screen intent over the lockscreen, wake-lock capability, and continuous audio looping that persists until explicit caregiver dismissal.

#### Scenario: Scheduled feeding alarm triggers while device is locked
- **WHEN** the scheduled time for a feeding alarm is reached and the device is locked
- **THEN** the system SHALL wake the device screen, display the dedicated full-screen alarm interface over the lockscreen, play the selected alarm tone continuously in a loop at alarm stream volume, and vibrate rhythmically until the user taps Silence, Snooze, or Feed Baby

#### Scenario: Scheduled feeding alarm triggers while device is in background/minimized
- **WHEN** the scheduled time for a feeding alarm is reached and the application is in background
- **THEN** the system SHALL launch the full-screen alarm activity, sound the looping alarm continuously, and display actionable notification buttons to Silence or Snooze without opening the full application

#### Scenario: Scheduled feeding alarm triggers while device is unlocked
- **WHEN** the scheduled time for a feeding alarm is reached and the caregiver is actively using the device
- **THEN** the system SHALL display a persistent high-priority heads-up banner with quick actions ("Silence", "Snooze"), play the continuous looping alarm audio, and open the full-screen alarm interface upon interaction

### Requirement: Dual Alert Modes for Feeding Reminders
The system SHALL support two distinct alert modes for scheduled feeding reminders: Standard Notification (brief sound and banner suitable for daytime) and Loud Alarm (persistent looping sound at alarm-usage audio volume, strong vibration, full-screen intent, and alarm-usage channel suitable for waking caregivers).

#### Scenario: User schedules a loud alarm for next feeding
- **WHEN** the user selects "Alarm" mode when setting a feeding reminder interval
- **THEN** the system SHALL schedule a local alarm using the dedicated alarm channel with high-priority wake attributes, continuous looping sound, custom vibration, and full-screen intent

#### Scenario: User schedules a standard notification for next feeding
- **WHEN** the user selects "Notification" mode when setting a feeding reminder interval
- **THEN** the system SHALL schedule a standard local notification with normal chime and heads-up banner

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

### Requirement: Custom Audio Ringtone Playback
The system SHALL support selecting and playing bundled alarm ringtones (`default`, `digital`, `chime`, `bells`, `gentle`) on the device alarm audio stream (`AUDIO_STREAM_ALARM`) that ignores silent / vibrate mode.

#### Scenario: Alarm rings with user-selected tone
- **WHEN** a feeding alarm rings and the user has chosen a custom sound in settings (e.g., "digital")
- **THEN** the system SHALL stream `alarm_digital.wav` continuously on the alarm audio channel at the system alarm volume level

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


