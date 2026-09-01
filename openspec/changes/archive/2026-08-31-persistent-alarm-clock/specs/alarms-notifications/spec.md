## Purpose
Specifies delta requirements for persistent looping alarm clock playback and lockscreen wakeup for feeding and medication alarms.

## Requirements

### MODIFIED Requirement: Schedule Local Push Alarm
The system SHALL support scheduling exact local alarms with high-priority heads-up banners, full-screen intent over the lockscreen, wake-lock capability, and continuous audio looping that persists until explicit caregiver dismissal.

#### Scenario: Scheduled feeding alarm triggers while device is locked
- **WHEN** the scheduled time for a feeding alarm is reached and the device is locked
- **THEN** the system SHALL wake the device screen, display the dedicated full-screen alarm interface over the lockscreen, play the selected alarm tone continuously in a loop at alarm stream volume, and vibrate rhythmically until the user taps Silence, Snooze, or Feed Baby

#### Scenario: Scheduled feeding alarm triggers while device is in background/minimized
- **WHEN** the scheduled time for a feeding alarm is reached and the application is in background
- **THEN** the system SHALL launch the full-screen alarm activity, sound the looping alarm continuously, and display actionable notification buttons to Silence or Snooze without opening the full application

### MODIFIED Requirement: Full-Screen Feeding Alarm and Continuous Audio Loop
The system SHALL provide a dedicated full-screen alarm interface and background-persistent looping audio engine that keeps ringing at system alarm volume across all application states (foreground, background, screen locked) until the user explicitly dismisses or snoozes the alarm.

#### Scenario: Caregiver silences alarm from lockscreen or notification action
- **WHEN** the caregiver taps "Silence" on the lockscreen action button or notification action
- **THEN** the system SHALL immediately terminate the continuous looping audio and vibration, cancel the active notification/foreground service, and dismiss the alarm state

#### Scenario: Caregiver snoozes alarm from lockscreen or notification action
- **WHEN** the caregiver taps "Snooze (+15m)" on the lockscreen action button or notification action
- **THEN** the system SHALL immediately stop the audio loop and vibration, dismiss the alarm, and schedule a new persistent alarm for 15 minutes later

#### Scenario: Caregiver logs dose or feeding directly from alarm
- **WHEN** the caregiver taps "Feed Baby" or "Mark as Taken" on the ringing alarm
- **THEN** the system SHALL immediately silence the audio loop, dismiss the alarm, record the action in the database, and compute the next scheduled reminder
