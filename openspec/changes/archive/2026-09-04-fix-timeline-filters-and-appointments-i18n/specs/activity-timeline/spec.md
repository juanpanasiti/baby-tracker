## Purpose

Provides a chronological activity history for all baby care events (feedings, diaper changes, and medication logs) with horizontally scrollable, localized category filters.

## ADDED Requirements

### Requirement: Horizontally Scrollable Activity Filter Bar
The system SHALL render category filter chips (`All`, `Feedings`, `Diapers`, `Medications`) in a horizontally scrollable view that allows users to access all filter options regardless of device width, screen scaling, or translation string length.

#### Scenario: User navigates category filters on mobile viewport
- **WHEN** the user opens the Timeline screen on a device where total filter chips width exceeds screen width
- **THEN** the system SHALL allow horizontal scrolling across all category filter chips without clipping or hiding any filter option

### Requirement: Localized Category Filter Labels
The system SHALL display localized and concise labels for each activity filter chip in the active application language, including item counts.

#### Scenario: Viewing timeline filters in English
- **WHEN** the active language is set to English
- **THEN** the filter chips SHALL display "All", "Feedings", "Diapers", and "Medications" alongside their respective counts

#### Scenario: Viewing timeline filters in Spanish
- **WHEN** the active language is set to Spanish
- **THEN** the filter chips SHALL display "Todos", "Tomas", "Pañales", and "Medicamentos" alongside their respective counts
