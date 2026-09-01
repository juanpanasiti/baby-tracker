## ADDED Requirements

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
