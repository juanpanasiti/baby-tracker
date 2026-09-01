## Purpose

Provides comprehensive tracking for baby medications and supplements, flexible schedule configurations (fixed times, intervals, day-of-week recurrence), treatment lifecycle states, dose administration logging, and timeline history visualization.

## ADDED Requirements

### Requirement: Medication Management and Configuration
The system SHALL allow caregivers to create, edit, pause, resume, finish, and view medication and supplement treatments for a baby. Each medication SHALL store a name, optional dosage instruction, optional notes, recurrence schedule configuration, alert mode preference, and lifecycle status (`active`, `paused`, `finished`).

#### Scenario: Caregiver creates a new fixed-time medication
- **WHEN** the caregiver adds a medication with name "Vitamin D", dosage "4 drops", and scheduled times "10:00" and "18:00"
- **THEN** the system SHALL persist the medication in local storage with `active` status and schedule the next pending reminder

#### Scenario: Caregiver creates an interval-based medication
- **WHEN** the caregiver adds a medication with name "Amoxicillin", dosage "2.5 ml", interval "every 8 hours", start time "08:00", and duration "7 days"
- **THEN** the system SHALL persist the medication and calculate sequential reminder triggers every 8 hours until the end date is reached

#### Scenario: Caregiver pauses an active medication
- **WHEN** the caregiver toggles an active medication to `paused`
- **THEN** the system SHALL cancel all pending system notifications for that medication, retain all past dose logs, and retain the schedule configuration

#### Scenario: Caregiver reactivates a paused medication
- **WHEN** the caregiver reactivates a previously paused medication
- **THEN** the system SHALL set the status to `active` and schedule the next upcoming reminder based on the configured schedule

### Requirement: Log Administered Medication Doses
The system SHALL support logging administered doses for any medication, capturing the timestamp, dose amount, administering caregiver notes, and linking to the medication profile.

#### Scenario: Caregiver logs a dose from the application
- **WHEN** the caregiver taps "Log Dose" for "Vitamin D" and confirms the timestamp
- **THEN** the system SHALL insert a record into the medication dose logs and update the chronological activity Timeline

#### Scenario: Caregiver logs a dose via reminder notification action
- **WHEN** the caregiver taps the "Take / Mark as Taken" action on an active medication alarm or notification
- **THEN** the system SHALL record an administered dose log for the current timestamp, dismiss the active alarm, and schedule the next recurring reminder

### Requirement: Chronological Timeline Integration
The system SHALL display medication administration events in the unified Chronological Timeline interleaved by timestamp with feeding and diaper change activities.

#### Scenario: Medication event rendered in Timeline
- **WHEN** the caregiver navigates to the Timeline screen
- **THEN** the system SHALL render medication entries displaying the medication name, administered dosage, time, and notes with a distinct pill/medicine icon and styling

### Requirement: Dashboard Upcoming Medication Summary
The system SHALL display an upcoming medications card on the main Dashboard showing pending doses for the current day with inline quick actions to mark as taken or postpone.

#### Scenario: Caregiver views upcoming doses on Dashboard
- **WHEN** one or more active medications have scheduled doses for today
- **THEN** the Dashboard SHALL show the next upcoming dose time, medication name, dosage, and quick action buttons

#### Scenario: Caregiver postpones upcoming dose from Dashboard
- **WHEN** the caregiver taps "+15m" or "+30m" on an upcoming medication card
- **THEN** the system SHALL postpone the next scheduled reminder notification by the selected minutes without modifying the underlying recurring schedule
