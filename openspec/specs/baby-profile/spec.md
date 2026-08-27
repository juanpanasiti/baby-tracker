## Purpose

Provides storage and management for the baby profile details including name, sex, birth date, and avatar photo.

## Requirements

### Requirement: Create and Edit Baby Profile
The system SHALL allow users to create and update a baby profile with name, sex, birth date, and an optional avatar photo.

#### Scenario: User saves baby profile details
- **WHEN** the user inputs the baby's name, selects sex, picks the birth date, optionally chooses a photo, and submits
- **THEN** the system SHALL validate the required fields (name, birth date, sex) and persist the record locally

#### Scenario: Missing required profile fields
- **WHEN** the user attempts to submit without a name or birth date
- **THEN** the system SHALL display a validation error message and prevent saving
