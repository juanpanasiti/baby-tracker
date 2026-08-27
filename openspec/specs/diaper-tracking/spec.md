## Purpose

Enables logging of diaper changes with categorization for wet, dirty, or mixed diapers, rash presence, and notes.

## Requirements

### Requirement: Log Diaper Change
The system SHALL allow users to log diaper change events categorized as 'pee', 'poop', or 'both' (pee and poop), along with a timestamp, diaper rash boolean indicator, and optional notes.

#### Scenario: User logs a mixed diaper change with rash note
- **WHEN** the user selects type 'both', toggles rash flag to true, and saves
- **THEN** the system SHALL store the diaper log with type 'both', rash flag set to true, and the recorded timestamp

#### Scenario: User views recent diaper history
- **WHEN** the user navigates to the history/timeline view
- **THEN** the system SHALL display diaper logs sorted in reverse chronological order with clear visual badges for pee/poop/both
