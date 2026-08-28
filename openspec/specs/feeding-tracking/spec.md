## Purpose

Enables logging of breastfeeding sessions and bottle feedings, tracking volumes and durations, setting custom event timestamps, editing existing records, and triggering prompts to schedule next feeding alarms.

## Requirements

### Requirement: Log Breastfeeding Session
The system SHALL support logging breastfeeding sessions with active side tracking (Left, Right, or Both), duration in seconds or minutes, a configurable timestamp (defaulting to current date and time), quick time presets (Now, -15 min, -30 min, -1 hr), and native date and time picker dialogs.

#### Scenario: User logs breastfeeding with timer
- **WHEN** the user starts the breastfeeding timer for the left breast, finishes after 15 minutes, and saves
- **THEN** the system SHALL record a feeding entry with type 'breast', side 'left', duration of 900 seconds, and timestamp

#### Scenario: User logs breastfeeding with quick preset
- **WHEN** the user taps the '-30 min' preset button in the feeding modal and saves
- **THEN** the system SHALL set the feeding timestamp to exactly 30 minutes prior to the current time

#### Scenario: User logs breastfeeding with native date/time pickers
- **WHEN** the user taps the date or time button, selects a custom value from the native OS picker dialog, and confirms
- **THEN** the system SHALL update the displayed timestamp and persist the feeding log with the selected custom timestamp

### Requirement: Log Bottle Feeding Session
The system SHALL support logging bottle feedings with recorded volume in milliliters (ml), a configurable timestamp (defaulting to current date and time), quick time presets, native date/time picker controls, and optional notes.

#### Scenario: User logs bottle feeding with amount in ml
- **WHEN** the user enters 120 ml for a bottle feeding log and saves
- **THEN** the system SHALL validate that amount is a positive number and persist the bottle feeding record

#### Scenario: User logs bottle feeding with custom date and time via native picker
- **WHEN** the user taps the date or time button in the bottle feeding modal, chooses values using the native picker, and saves
- **THEN** the system SHALL persist the bottle feeding record with the selected custom timestamp

### Requirement: Quick Log Feeding Selection
The system SHALL support opening the feeding modal directly into the designated feeding mode ('breast' or 'bottle') when initiated from specific quick action controls on the dashboard.

#### Scenario: User taps Bottle quick action button
- **WHEN** the user taps the "Biberón" (Bottle) quick log button on the dashboard
- **THEN** the system SHALL open the feeding modal with the 'bottle' feeding type pre-selected and bottle inputs visible

#### Scenario: User taps Breast quick action button
- **WHEN** the user taps the "Pecho" (Breast) quick log button on the dashboard
- **THEN** the system SHALL open the feeding modal with the 'breast' feeding type pre-selected and breast timer/manual controls visible

### Requirement: Prompt for Next Feeding Reminder
The system SHALL display an interactive prompt upon saving any feeding log offering preset intervals (e.g., 2.5h, 3h, 3.5h, 4h, or custom time) to schedule a local push notification alarm.

#### Scenario: User accepts feeding reminder prompt
- **WHEN** the user saves a feeding log and selects "3 hours" from the post-save reminder prompt
- **THEN** the system SHALL schedule a local push alarm 3 hours from the feeding timestamp

#### Scenario: User dismisses feeding reminder prompt
- **WHEN** the user saves a feeding log and taps "Skip" or dismisses the reminder prompt
- **THEN** the system SHALL persist the log without scheduling an alarm

### Requirement: Edit Existing Feeding Record
The system SHALL allow users to edit all attributes of an existing feeding entry directly from the history timeline, including feeding type, side, duration, amount, notes, and timestamp.

#### Scenario: User opens and edits a breastfeeding log
- **WHEN** the user taps edit on a breastfeeding record in the history timeline, modifies duration and notes, and confirms save
- **THEN** the system SHALL update the database record and refresh the timeline and statistics with the modified values

#### Scenario: User opens and edits a bottle feeding log
- **WHEN** the user taps edit on a bottle feeding record, changes the milk volume from 100 ml to 130 ml, and saves
- **THEN** the system SHALL persist the updated amount and recalculate dashboard totals
