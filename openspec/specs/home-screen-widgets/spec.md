## Purpose

Provides native Android home screen widgets displaying upcoming feeding and medication schedules across multiple widget sizes (1x1, 1x2, and 2x2) with direct deep link actions.

## Requirements

### Requirement: Android Home Screen Widget Sizes
The system SHALL provide three native home screen widget configurations for Android: a compact 1x1 widget, a horizontal 1x2 bar widget, and an expanded 2x2 dashboard widget.

#### Scenario: User adds 1x1 widget to home screen
- **WHEN** the user adds the 1x1 widget to their Android launcher
- **THEN** the widget displays the next scheduled feeding time and next medication time in a split compact layout

#### Scenario: User adds 1x2 widget to home screen
- **WHEN** the user adds the 1x2 widget to their Android launcher
- **THEN** the widget displays the feeding schedule on the left half and the next medication on the right half with independent tap areas

#### Scenario: User adds 2x2 widget to home screen
- **WHEN** the user adds the 2x2 widget to their Android launcher
- **THEN** the widget displays the baby header, next feeding details (time and last feeding), next medication details (name, dosage, and time), and quick-action touch buttons

### Requirement: Feeding and Medication State Display
The widgets SHALL display accurate schedule information based on active reminders and upcoming medication doses, or display graceful fallback states when no events are scheduled.

#### Scenario: Active feeding reminder exists
- **WHEN** there is an active feeding reminder
- **THEN** the widgets display the scheduled target time formatted in HH:MM

#### Scenario: No active feeding reminder exists
- **WHEN** there is no active feeding reminder
- **THEN** the widgets display the time of the most recent feeding, or an unscheduled indicator if no feedings exist

#### Scenario: Upcoming medication dose exists
- **WHEN** an active medication has an upcoming scheduled dose
- **THEN** the widgets display the medication name, dose quantity, and upcoming scheduled time formatted in HH:MM

#### Scenario: No active medication or pending doses
- **WHEN** there are no active medications or no upcoming doses
- **THEN** the widgets display a status indicating that medication is up to date

### Requirement: Widget Synchronization
The system SHALL automatically refresh all placed widgets on the home screen when relevant app events occur and during app foregrounding.

#### Scenario: User logs a feeding or sets a reminder
- **WHEN** a feeding is saved or a feeding reminder is created, updated, or canceled
- **THEN** the system pushes updated feeding and medication data to all installed Android widgets

#### Scenario: User logs a medication dose or modifies medication
- **WHEN** a medication dose is recorded or a medication status/schedule is updated
- **THEN** the system pushes updated feeding and medication data to all installed Android widgets

#### Scenario: App returns to active foreground
- **WHEN** the application transitions from background to active foreground state
- **THEN** the system recalculates upcoming schedules and pushes fresh data to all installed widgets

### Requirement: Deep Linking from Widgets
The widgets SHALL support tap interactions that deep link into specific views or action modals within the app.

#### Scenario: Tapping feeding section
- **WHEN** the user taps the feeding area or "Log Feeding" button on a widget
- **THEN** the app opens directly with the feeding creation modal displayed

#### Scenario: Tapping medication section
- **WHEN** the user taps the medication area or "Log Dose" button on a widget
- **THEN** the app opens directly with the medication dose logging modal or medications screen displayed
