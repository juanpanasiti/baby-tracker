## MODIFIED Requirements

### Requirement: Log Diaper Change
The system SHALL allow users to log diaper change events categorized as 'pee', 'poop', or 'both' (pee and poop), along with a configurable timestamp (defaulting to current date and time), diaper rash boolean indicator, and optional notes.

#### Scenario: User logs a mixed diaper change with rash note
- **WHEN** the user selects type 'both', toggles rash flag to true, and saves
- **THEN** the system SHALL store the diaper log with type 'both', rash flag set to true, and the recorded timestamp

#### Scenario: User logs a diaper change with past timestamp
- **WHEN** the user adjusts the date and time in the diaper modal to a past time and saves
- **THEN** the system SHALL store the diaper log with the selected past timestamp

#### Scenario: User views recent diaper history
- **WHEN** the user navigates to the history/timeline view
- **THEN** the system SHALL display diaper logs sorted in reverse chronological order with clear visual badges for pee/poop/both

## ADDED Requirements

### Requirement: Edit Existing Diaper Record
The system SHALL allow users to edit all attributes of an existing diaper entry directly from the history timeline, including type (pee, poop, both), rash indicator, notes, and timestamp.

#### Scenario: User updates an existing diaper record
- **WHEN** the user taps edit on a diaper record in the history timeline, changes the type from 'pee' to 'both', updates the notes, and saves
- **THEN** the system SHALL persist the updated diaper record in the database and immediately refresh the timeline view
