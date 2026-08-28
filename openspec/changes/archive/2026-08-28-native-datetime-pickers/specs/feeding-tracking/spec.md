## MODIFIED Requirements

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
