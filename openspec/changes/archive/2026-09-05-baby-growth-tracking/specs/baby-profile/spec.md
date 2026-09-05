## ADDED Requirements

### Requirement: Display Growth Metrics in Profile Card
The system SHALL display the baby's most recently recorded weight along with relative time elapsed (e.g., "5.250 kg • 2 weeks ago") in the Baby Profile card when growth display is enabled in preferences and at least one growth record exists.

#### Scenario: Profile card with recorded weight and elapsed time
- **WHEN** growth display preference is enabled and a growth record exists for the baby
- **THEN** the profile header SHALL render the latest recorded weight and how long ago it was measured

#### Scenario: Interacting with the growth indicator in profile card
- **WHEN** the user taps the growth metric element in the profile header
- **THEN** the system SHALL open the growth tracking history sheet / log modal

#### Scenario: Growth display disabled in user preferences
- **WHEN** the user disables growth display in application preferences
- **THEN** the profile header SHALL hide the growth metric element regardless of recorded entries
