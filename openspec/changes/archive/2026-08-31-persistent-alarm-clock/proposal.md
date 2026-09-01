# Proposal: Persistent Alarm Clock Implementation with Continuous Looping Audio

## Summary
Transform scheduled feeding and medication alarms into a reliable, continuous alarm clock mechanism that plays audio in an infinite loop, vibrates insistently, and wakes the device screen even when the app is minimized or the phone is locked, stopping only when explicitly silenced or handled by the caregiver.

## Problem Statement & Motivation
Currently, when a feeding or medication alarm fires while the device is locked or the application is in the background, the Android operating system plays the notification channel sound file as a one-shot notification (lasting only ~3 seconds). If sleeping parents miss this brief single chime at 3:00 AM, the baby risks missing essential feedings or scheduled medications. 

To ensure newborn health and caregiver peace of mind, loud alarms must behave as true alarm clocks: waking the device, displaying full-screen controls, and looping audio continuously at high volume until the user wakes up and presses Silence, Snooze, or Logs the action.

## User Impact
- **Caregiver Reliability**: Parents can rely on Baby Care alarms to wake them up during deep sleep.
- **Lockscreen Immediate Action**: When an alarm triggers with the screen off, the device screen lights up with full-screen interactive buttons ("Silence", "Snooze +15m", "Feed Baby" / "Take Dose") without requiring device unlocking first.
- **Safety**: Prevents prolonged delays in infant nutrition and medication adherence.

## Goals
1. Implement persistent, continuous looping audio and vibration for all high-priority feeding and medication alarms when triggered in background and locked states.
2. Enable full-screen lockscreen wakeup (`USE_FULL_SCREEN_INTENT`, `turnScreenOn`, and `showWhenLocked`) so the interactive alarm screen appears over the lockscreen immediately upon firing.
3. Provide robust notification and lockscreen action handlers to stop audio, snooze (+15m), or open direct logging flows from native notification actions and full-screen UI.
4. Maintain full offline functionality and compatibility with Android 12+ battery optimization and exact alarm policies.

## Non-Goals
- Altering the behavior of daytime discrete notifications (which remain gentle, non-looping single chimes).
- Introducing cloud push services (all alarms remain 100% local and offline-first).

## Constraints & Dependencies
- **Platform**: Android (mobile-first).
- **Permissions**: `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`, `USE_FULL_SCREEN_INTENT`, `WAKE_LOCK`, `VIBRATE`.
- **Libraries**: `@notifee/react-native` or native foreground alarm service integration compatible with Expo EAS prebuild workflow.
