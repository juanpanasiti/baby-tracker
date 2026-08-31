## MODIFIED Requirements

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

## ADDED Requirements

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
