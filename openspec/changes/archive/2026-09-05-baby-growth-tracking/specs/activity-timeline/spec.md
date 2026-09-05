## MODIFIED Requirements

### Requirement: Horizontally Scrollable Activity Filter Bar
The system SHALL render category filter chips (`All`, `Feedings`, `Diapers`, `Medications`, `Growth`) in a horizontally scrollable view that allows users to access all filter options regardless of device width, screen scaling, or translation string length.

#### Scenario: User navigates category filters on mobile viewport
- **WHEN** the user opens the Timeline screen on a device where total filter chips width exceeds screen width
- **THEN** the system SHALL allow horizontal scrolling across all category filter chips without clipping or hiding any filter option

### Requirement: Localized Category Filter Labels
The system SHALL display localized and concise labels for each activity filter chip in the active application language, including item counts.

#### Scenario: Viewing timeline filters in English
- **WHEN** the active language is set to English
- **THEN** the filter chips SHALL display "All", "Feedings", "Diapers", "Medications", and "Growth" alongside their respective counts

#### Scenario: Viewing timeline filters in Spanish
- **WHEN** the active language is set to Spanish
- **THEN** the filter chips SHALL display "Todos", "Tomas", "Pañales", "Medicamentos", and "Crecimiento" alongside their respective counts

## ADDED Requirements

### Requirement: Growth Activity Timeline Events
The system SHALL render growth records within the unified chronological activity timeline, displaying weight, optional height, optional notes, and edit and delete action controls.

#### Scenario: User views growth entry in timeline
- **WHEN** the timeline renders an event of type growth
- **THEN** it SHALL display the growth icon, recorded weight in kg, height in cm if present, formatted timestamp, and action buttons for editing and deleting
