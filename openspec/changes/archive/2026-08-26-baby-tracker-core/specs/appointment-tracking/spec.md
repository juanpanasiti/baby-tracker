## Purpose

Provides scheduling and management for pediatrician and medical appointments with reminder alerts and device calendar synchronization.

## ADDED Requirements

### Requirement: Schedule Medical Appointment
The system SHALL allow users to create and manage medical appointments containing title, doctor/specialist name, medical specialty, date and time, location, and preparation notes.

#### Scenario: User creates an appointment
- **WHEN** the user provides appointment title, pediatrician name, selects date/time, and saves
- **THEN** the system SHALL validate the required fields and persist the appointment record in the database

### Requirement: Native Calendar Export
The system SHALL support exporting/syncing scheduled appointments to the native device calendar using device calendar permissions.

#### Scenario: User enables device calendar sync
- **WHEN** the user taps "Add to Device Calendar" on an appointment
- **THEN** the system SHALL request calendar permission (if not granted), create a native calendar event, and store the returned native event ID
