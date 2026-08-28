## MODIFIED Requirements

### Requirement: Create and Edit Baby Profile
The system SHALL allow users to create and update a baby profile with name, sex, birth date selected via a native date picker (preventing future dates), and an optional avatar photo.

#### Scenario: User selects birth date using native date picker
- **WHEN** the user opens the birth date selector in the profile modal, selects a past date from the native calendar picker, and saves
- **THEN** the system SHALL update the profile with the selected birth date and recalculate the baby's age

#### Scenario: User attempts to pick a future birth date
- **WHEN** the user attempts to pick or submit a date in the future
- **THEN** the system SHALL enforce the maximum allowed date of today or display a validation error message
