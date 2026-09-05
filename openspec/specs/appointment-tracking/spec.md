## Purpose

Provides scheduling and management for appointments (medical checkups, vaccinations, administrative procedures, and general commitments) with reminder alerts and device calendar synchronization.

## Requirements

### Requirement: Schedule Medical Appointment
The system SHALL allow users to create and manage appointments under distinct categories: medical, vaccine, administrative, and other. For all categories, appointments contain title, date and time selected via native date and time picker dialogs, location, preparation/procedural notes, calendar sync preference, and advance notification preferences. When the category is `medical`, the appointment additionally supports doctor/specialist name and medical specialty.

#### Scenario: User creates an appointment with native pickers
- **WHEN** the user provides appointment title, selects category, selects date and time using native picker dialogs, and saves
- **THEN** the system SHALL validate the required fields and persist the appointment record in the database

#### Scenario: User creates a medical appointment
- **WHEN** the user selects the "Medical" category, enters a title, doctor name, specialty, selects date/time, and saves
- **THEN** the system SHALL validate required fields and persist the record with category `medical` along with doctor and specialty details

#### Scenario: User creates a non-medical appointment (vaccine, administrative, or other)
- **WHEN** the user selects a non-medical category (such as "Vaccine", "Administrative", or "Other"), enters a title, selects date/time, enters optional location and notes, and saves
- **THEN** the system SHALL hide medical-specific fields, validate universal required fields, and persist the record with the selected category

### Requirement: Native Calendar Export
The system SHALL support exporting/syncing scheduled appointments to the native device calendar using device calendar permissions.

#### Scenario: User enables device calendar sync
- **WHEN** the user taps "Add to Device Calendar" on an appointment
- **THEN** the system SHALL request calendar permission (if not granted), create a native calendar event, and store the returned native event ID

### Requirement: Categorized Appointment Filtering and Identification
The system SHALL visually differentiate appointments by category using distinct icons, badges, and colors, and allow filtering or tabbed viewing of scheduled commitments.

#### Scenario: Viewing appointments on dashboard and list screens
- **WHEN** an appointment is rendered in the upcoming banner or appointments list
- **THEN** the system SHALL display its category badge with the corresponding icon and styling

### Requirement: Category-Aware Reminders and Notifications
The system SHALL generate localized advance notifications and alarms with copy and context tailored to the appointment's category.

#### Scenario: Reminder triggered for scheduled appointment
- **WHEN** a scheduled reminder fires for an appointment
- **THEN** the system SHALL display the notification using category-appropriate wording (e.g., vaccine or administrative notice rather than assuming a doctor visit)

### Requirement: Localized Appointment Action Controls
The system SHALL render fully resolved and localized action controls on the Appointments screen across all supported languages, preventing raw translation key paths from being displayed to the user.

#### Scenario: Add appointment button in English
- **WHEN** the user navigates to the Appointments screen while the application language is English
- **THEN** the creation action button SHALL display "+ Add" and never show raw dictionary keys like "common.add"

#### Scenario: Add appointment button in Spanish
- **WHEN** the user navigates to the Appointments screen while the application language is Spanish
- **THEN** the creation action button SHALL display "+ Agregar" and never show raw dictionary keys like "common.add"

