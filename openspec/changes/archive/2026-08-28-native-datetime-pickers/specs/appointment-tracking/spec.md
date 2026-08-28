## MODIFIED Requirements

### Requirement: Schedule Medical Appointment
The system SHALL allow users to create and manage medical appointments containing title, doctor/specialist name, medical specialty, date and time selected via native date and time picker dialogs, location, and preparation notes.

#### Scenario: User creates an appointment with native pickers
- **WHEN** the user provides appointment title, doctor name, selects date and time using native picker dialogs, and saves
- **THEN** the system SHALL validate the required fields and persist the appointment record in the database
