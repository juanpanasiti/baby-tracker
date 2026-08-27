## MODIFIED Requirements

### Requirement: Log Breastfeeding Session
The system SHALL support logging breastfeeding sessions with active side tracking (Left, Right, or Both), duration in seconds or minutes, a configurable timestamp (defaulting to current date and time), and optional notes.

#### Scenario: User logs breastfeeding with timer
- **WHEN** the user starts the breastfeeding timer for the left breast, finishes after 15 minutes, and saves
- **THEN** the system SHALL record a feeding entry with type 'breast', side 'left', duration of 900 seconds, and timestamp

#### Scenario: User logs breastfeeding with custom past timestamp
- **WHEN** the user sets a custom date/time (e.g. 30 minutes in the past) and saves a breastfeeding log
- **THEN** the system SHALL record the feeding entry with the specified custom timestamp

### Requirement: Log Bottle Feeding Session
The system SHALL support logging bottle feedings with recorded volume in milliliters (ml), a configurable timestamp (defaulting to current date and time), and optional notes.

#### Scenario: User logs bottle feeding with amount in ml
- **WHEN** the user enters 120 ml for a bottle feeding log and saves
- **THEN** the system SHALL validate that amount is a positive number and persist the bottle feeding record

#### Scenario: User logs bottle feeding with custom date and time
- **WHEN** the user modifies the date and time values in the bottle feeding modal and saves
- **THEN** the system SHALL persist the bottle feeding record with the selected custom timestamp

## ADDED Requirements

### Requirement: Edit Existing Feeding Record
The system SHALL allow users to edit all attributes of an existing feeding entry directly from the history timeline, including feeding type, side, duration, amount, notes, and timestamp.

#### Scenario: User opens and edits a breastfeeding log
- **WHEN** the user taps edit on a breastfeeding record in the history timeline, modifies duration and notes, and confirms save
- **THEN** the system SHALL update the database record and refresh the timeline and statistics with the modified values

#### Scenario: User opens and edits a bottle feeding log
- **WHEN** the user taps edit on a bottle feeding record, changes the milk volume from 100 ml to 130 ml, and saves
- **THEN** the system SHALL persist the updated amount and recalculate dashboard totals
