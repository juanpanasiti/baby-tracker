## Purpose

Provides scheduled local push notifications and alarms for upcoming feeding intervals and medical appointments without requiring remote server infrastructure.

## Requirements

### Requirement: Schedule Local Push Alarm
The system SHALL support scheduling exact local notifications and alarms with high-priority heads-up banners, full-screen intent over the lockscreen, and wake-lock capability for future timestamps using native notification triggers and high-importance alarm notification channels.

#### Scenario: Scheduled feeding alarm triggers
- **WHEN** the scheduled time for a feeding alarm is reached
- **THEN** the system SHALL wake the device, display the dedicated full-screen alarm activity over the lockscreen if locked, play the selected alarm tone continuously in a loop at alarm stream volume, and show a maximum-priority heads-up notification with sound and actions

#### Scenario: Scheduled feeding alarm triggers while device is locked
- **WHEN** the scheduled time for a feeding alarm is reached and the device is locked
- **THEN** the system SHALL wake the screen, display the dedicated full-screen alarm activity over the lockscreen, play the selected alarm tone continuously in a loop at alarm stream volume, and vibrate until dismissed or snoozed

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
The system SHALL provide a dedicated full-screen alarm interface and looping audio engine that keeps ringing at system alarm volume until the user explicitly dismisses or snoozes the alarm.

#### Scenario: Caregiver dismisses ringing alarm
- **WHEN** the caregiver taps the "Silence" or "Feed Baby" button on the ringing full-screen alarm
- **THEN** the system SHALL immediately stop the looping audio and vibration, dismiss the full-screen alarm, cancel the active alarm notification, and open the feeding log modal

#### Scenario: Caregiver snoozes ringing alarm
- **WHEN** the caregiver taps the "Snooze" button (e.g. +15m) on the ringing full-screen alarm
- **THEN** the system SHALL immediately stop the looping audio and vibration, dismiss the full-screen alarm, and reschedule the feeding alarm for 15 minutes later

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
- **THEN** the system SHALL trigger the high-priority alarm notification with full-screen interface, continuous looping audio if in alarm mode, and quick actions ("Take Dose", "Snooze +15m", "Silence")

#### Scenario: Caregiver silences ringing medication alarm
- **WHEN** the caregiver taps "Silence" on a ringing medication alarm
- **THEN** the system SHALL stop audio playback and vibration, dismiss the full-screen alarm, and preserve the reminder state

#### Scenario: Caregiver marks ringing medication alarm as taken
- **WHEN** the caregiver taps "Take / Mark as Taken" on a ringing medication alarm
- **THEN** the system SHALL stop audio playback, record the dose administration log, dismiss the alarm, and schedule the next recurring dose

