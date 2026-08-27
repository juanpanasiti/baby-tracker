## Purpose

Enables logging of breastfeeding sessions and bottle feedings, tracking volumes and durations, and triggering prompts to schedule next feeding alarms.

## ADDED Requirements

### Requirement: Log Breastfeeding Session
The system SHALL support logging breastfeeding sessions with active side tracking (Left, Right, or Both), duration in seconds or minutes, start timestamp, and optional notes.

#### Scenario: User logs breastfeeding with timer
- **WHEN** the user starts the breastfeeding timer for the left breast, finishes after 15 minutes, and saves
- **THEN** the system SHALL record a feeding entry with type 'breast', side 'left', duration of 900 seconds, and timestamp

### Requirement: Log Bottle Feeding Session
The system SHALL support logging bottle feedings with recorded volume in milliliters (ml), timestamp, and optional notes.

#### Scenario: User logs bottle feeding with amount in ml
- **WHEN** the user enters 120 ml for a bottle feeding log and saves
- **THEN** the system SHALL validate that amount is a positive number and persist the bottle feeding record

### Requirement: Prompt for Next Feeding Reminder
The system SHALL display an interactive prompt upon saving any feeding log offering preset intervals (e.g., 2.5h, 3h, 3.5h, 4h, or custom time) to schedule a local push notification alarm.

#### Scenario: User accepts feeding reminder prompt
- **WHEN** the user saves a feeding log and selects "3 hours" from the post-save reminder prompt
- **THEN** the system SHALL schedule a local push alarm 3 hours from the feeding timestamp

#### Scenario: User dismisses feeding reminder prompt
- **WHEN** the user saves a feeding log and taps "Skip" or dismisses the reminder prompt
- **THEN** the system SHALL persist the log without scheduling an alarm
