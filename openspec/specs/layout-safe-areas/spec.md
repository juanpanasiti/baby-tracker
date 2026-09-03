## Purpose

Provides layout boundaries and safe area inset management across mobile devices to prevent screen content, navigation bars, and interactive modals from being occluded by system status bars, notches, or system navigation bars.

## Requirements

### Requirement: Top Safe Area Inset Protection
The application root and active screens SHALL account for device top insets (including status bar height and display cutouts/notches) so that all header elements, avatars, titles, and top interactive controls remain completely visible and unobstructed.

#### Scenario: Device with status bar and notch renders top header
- **WHEN** the application opens or renders any tab screen on a device with a top status bar or display cutout
- **THEN** the top header elements (such as profile avatar, name, age, action buttons, and segmented control tabs) are positioned below the status bar with non-overlapping vertical clearance

#### Scenario: Status bar background consistency
- **WHEN** the top safe area is applied
- **THEN** the status bar area background matches the active application theme background color (`colors.background`) without showing white or mismatched gaps

### Requirement: Bottom Navigation System Bar Protection
The bottom navigation bar SHALL dynamically calculate and apply bottom safe area insets so that tab icons and tab labels are placed strictly above system navigation bars (including 3-button navigation and gesture navigation bars).

#### Scenario: 3-button navigation active on Android
- **WHEN** the application runs on an Android device configured with 3-button navigation (`◀ ● ■`)
- **THEN** the bottom navigation tab icons and labels are rendered entirely above the system buttons with comfortable touch targets
- **THEN** the bottom navigation surface background color extends down behind the 3-button navigation bar to provide seamless edge-to-edge aesthetics

#### Scenario: Gesture navigation active
- **WHEN** the application runs on a device configured with gesture navigation (small pill indicator) or zero bottom inset
- **THEN** the bottom navigation maintains an ergonomic minimum bottom padding without excessive empty vertical space

### Requirement: Full-Screen Modal Safe Area Protection
All full-screen modals and alerts SHALL account for both top and bottom safe area insets so that close buttons, headers, and action confirmation buttons remain fully accessible.

#### Scenario: Full-screen alarm modal displays during alarm trigger
- **WHEN** an alarm rings and the full-screen alarm modal is displayed
- **THEN** the dismiss/silence button and top badge are positioned below the status bar
- **THEN** the primary action buttons (such as "Feed Baby", "Take Dose", "Snooze") are positioned above the system navigation bar with no clipping
