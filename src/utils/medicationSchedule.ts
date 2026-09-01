import { type Medication } from '../db/schema';

/**
 * Parses fixed times JSON string into a sorted array of HH:mm strings.
 */
export function parseFixedTimes(fixedTimesJson?: string | null): string[] {
  if (!fixedTimesJson) return [];
  try {
    const parsed = JSON.parse(fixedTimesJson);
    if (Array.isArray(parsed)) {
      return parsed.filter((t): t is string => typeof t === 'string' && /^\d{1,2}:\d{2}$/.test(t)).sort();
    }
  } catch {
    // Fallback on error
  }
  return [];
}

/**
 * Parses selected days JSON string into an array of numbers (0 = Sunday, 6 = Saturday).
 * If undefined or empty, returns all days [0, 1, 2, 3, 4, 5, 6].
 */
export function parseSelectedDays(selectedDaysJson?: string | null): number[] {
  if (!selectedDaysJson) return [0, 1, 2, 3, 4, 5, 6];
  try {
    const parsed = JSON.parse(selectedDaysJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((d): d is number => typeof d === 'number' && d >= 0 && d <= 6);
    }
  } catch {
    // Fallback on error
  }
  return [0, 1, 2, 3, 4, 5, 6];
}

/**
 * Calculates the next upcoming scheduled timestamp (in ms) for a medication.
 * Returns null if the medication is paused/finished or if the end date has passed.
 */
export function calculateNextMedicationDose(
  medication: Medication,
  fromTimestamp: number = Date.now()
): number | null {
  if (medication.status !== 'active') {
    return null;
  }

  if (medication.endDate && fromTimestamp >= medication.endDate) {
    return null;
  }

  if (medication.scheduleType === 'fixed_times') {
    const fixedTimes = parseFixedTimes(medication.fixedTimesJson);
    if (fixedTimes.length === 0) return null;

    const selectedDays = parseSelectedDays(medication.selectedDaysJson);
    if (selectedDays.length === 0) return null;

    const baseDate = new Date(fromTimestamp);

    // Search up to 30 days ahead for the next matching slot
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const checkDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + dayOffset);
      const dayOfWeek = checkDate.getDay();

      if (!selectedDays.includes(dayOfWeek)) {
        continue;
      }

      for (const timeStr of fixedTimes) {
        const [hStr, mStr] = timeStr.split(':');
        const candidateDate = new Date(
          checkDate.getFullYear(),
          checkDate.getMonth(),
          checkDate.getDate(),
          parseInt(hStr, 10),
          parseInt(mStr, 10),
          0,
          0
        );

        const candidateTime = candidateDate.getTime();
        if (candidateTime > fromTimestamp) {
          if (medication.endDate && candidateTime > medication.endDate) {
            return null;
          }
          return candidateTime;
        }
      }
    }

    return null;
  }

  if (medication.scheduleType === 'interval') {
    const intervalHours = medication.intervalHours && medication.intervalHours > 0 ? medication.intervalHours : 8;
    const intervalMs = intervalHours * 60 * 60 * 1000;
    const startTime = medication.intervalStartTime || fromTimestamp;

    let nextTargetTime = startTime;
    if (fromTimestamp >= startTime) {
      const elapsed = fromTimestamp - startTime;
      const steps = Math.floor(elapsed / intervalMs) + 1;
      nextTargetTime = startTime + steps * intervalMs;
    }

    if (medication.endDate && nextTargetTime > medication.endDate) {
      return null;
    }

    return nextTargetTime;
  }

  return null;
}
