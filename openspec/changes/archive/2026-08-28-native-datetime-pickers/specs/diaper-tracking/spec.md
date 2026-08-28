## MODIFIED Requirements

### Requirement: Log Diaper Change
The system SHALL allow users to log diaper change events categorized as 'pee', 'poop', or 'both' (pee and poop), along with a configurable timestamp (defaulting to current date and time), quick time presets (Now, -15 min, -30 min, -1 hr), native date and time picker dialogs, diaper rash boolean indicator, and optional notes.

#### Scenario: User logs a mixed diaper change with rash note
- **WHEN** the user selects type 'both', toggles rash flag to true, and saves
- **THEN** the system SHALL store the diaper log with type 'both', rash flag set to true, and the recorded timestamp

#### Scenario: User logs a diaper change with native date and time picker
- **WHEN** the user taps the date or time button in the diaper modal, picks a custom date/time using the native dialog, and saves
- **THEN** the system SHALL store the diaper log with the selected custom timestamp

#### Scenario: User logs a diaper change with quick preset
- **WHEN** the user taps the '-15 min' preset button and saves
- **THEN** the system SHALL set the diaper log timestamp to 15 minutes prior to the current time

#### Scenario: User views recent diaper history
- **WHEN** the user navigates to the history/timeline view
- **THEN** the system SHALL display diaper logs sorted in reverse chronological order with clear visual badges for pee/poop/both
