## Purpose

Provides storage, validation, progression tracking, and management for infant weight and height growth measurements.

## Requirements

### Requirement: Record Growth Measurement
The system SHALL allow users to log growth records containing measurement date and time selected via native date/time pickers (preventing future dates), mandatory weight (in kilograms), optional height (in centimeters), and optional notes.

#### Scenario: User records a valid growth measurement
- **WHEN** the user inputs a positive weight (e.g. 5.250 kg), optional height (e.g. 58.5 cm), past or current date/time, and taps save
- **THEN** the system SHALL validate the input and persist the record associated with the active baby profile in the database

#### Scenario: User attempts to submit an empty or invalid weight
- **WHEN** the user attempts to submit a growth record without a valid positive weight value
- **THEN** the system SHALL reject the submission and highlight the weight input as required

#### Scenario: User attempts to select a future date
- **WHEN** the user selects a date or time in the future
- **THEN** the system SHALL enforce the maximum allowed date of today or display a validation error

### Requirement: Historical Growth Progression and Delta Calculation
The system SHALL maintain a chronologically ordered progression of growth records and calculate the difference in weight and height compared to the immediately preceding measurement.

#### Scenario: Calculating growth delta with a prior measurement
- **WHEN** multiple growth records exist for a baby and the user views the growth history
- **THEN** each record (except the earliest) SHALL display the calculated weight difference (e.g., "+350 g" or "-100 g") and height difference relative to the previous record

#### Scenario: Viewing the baseline measurement
- **WHEN** viewing the earliest recorded growth entry for a baby
- **THEN** the system SHALL render the measurement values without a comparative delta

### Requirement: Manage Growth Records
The system SHALL allow users to edit existing growth measurements and delete obsolete or erroneous growth entries with confirmation.

#### Scenario: User edits an existing measurement
- **WHEN** the user modifies the weight, height, date, or notes of an existing growth record and confirms
- **THEN** the system SHALL update the database record and recompute affected progression deltas

#### Scenario: User deletes a growth measurement
- **WHEN** the user confirms deletion of a growth record
- **THEN** the system SHALL permanently remove the record from the database and update subsequent growth deltas
