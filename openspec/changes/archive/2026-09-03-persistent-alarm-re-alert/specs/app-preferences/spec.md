## ADDED Requirements

### Requirement: Persistent Alarm Re-Alert Settings
The system SHALL provide user-configurable preferences for persistent alarm re-alerts ("nagging"), including an enable/disable toggle, re-alert interval duration, and maximum repeat count limit, persisting all selections locally across app restarts.

#### Scenario: User toggles persistent alarm re-alert
- **WHEN** the user enables or disables persistent alarm re-alerts in Settings
- **THEN** the system SHALL immediately update and persist the preference, and apply the setting to all subsequent alarm silencing actions

#### Scenario: User configures re-alert interval
- **WHEN** the user selects a re-alert interval in Settings (e.g., 2 min, 5 min, 10 min, 15 min; default 5 min)
- **THEN** the system SHALL persist the selected interval and use it to compute future re-alert target times

#### Scenario: User configures maximum repeat limit
- **WHEN** the user selects a maximum repeat limit in Settings (e.g., Indefinite / No limit, 3 times, 5 times, 10 times; default Indefinite)
- **THEN** the system SHALL persist the preference and enforce the limit when re-arming silenced alarms
