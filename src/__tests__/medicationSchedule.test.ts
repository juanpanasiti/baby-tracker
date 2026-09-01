import {
  calculateNextMedicationDose,
  parseFixedTimes,
  parseSelectedDays,
} from '../utils/medicationSchedule';
import { type Medication } from '../db/schema';

describe('Medication Schedule Calculations', () => {
  describe('parseFixedTimes', () => {
    it('parses valid JSON array of time strings', () => {
      expect(parseFixedTimes('["08:00","14:00","20:00"]')).toEqual(['08:00', '14:00', '20:00']);
    });

    it('returns empty array on null, empty string, or invalid JSON', () => {
      expect(parseFixedTimes(null)).toEqual([]);
      expect(parseFixedTimes('')).toEqual([]);
      expect(parseFixedTimes('invalid')).toEqual([]);
      expect(parseFixedTimes('{"not":"array"}')).toEqual([]);
    });
  });

  describe('parseSelectedDays', () => {
    it('parses valid JSON array of day indices', () => {
      expect(parseSelectedDays('[1,3,5]')).toEqual([1, 3, 5]);
    });

    it('returns all 7 days by default on null, empty string, or invalid JSON', () => {
      expect(parseSelectedDays(null)).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(parseSelectedDays('')).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(parseSelectedDays('invalid')).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('calculateNextMedicationDose', () => {
    const baseMedication: Medication = {
      id: 'med-1',
      babyId: 'baby-1',
      name: 'Vitamin D',
      dosage: '4 drops',
      scheduleType: 'fixed_times',
      fixedTimesJson: '["10:00"]',
      intervalHours: null,
      intervalStartTime: null,
      selectedDaysJson: '[0,1,2,3,4,5,6]',
      endDate: null,
      alertMode: 'alarm',
      soundName: 'default',
      notes: 'Daily vitamin',
      status: 'active',
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    };

    it('returns null if medication is paused or finished', () => {
      expect(calculateNextMedicationDose({ ...baseMedication, status: 'paused' })).toBeNull();
      expect(calculateNextMedicationDose({ ...baseMedication, status: 'finished' })).toBeNull();
    });

    it('returns null if treatment has expired past endDate', () => {
      const pastEndDate = new Date(2026, 0, 1).getTime();
      const referenceNow = new Date(2026, 0, 5, 12, 0).getTime();
      expect(
        calculateNextMedicationDose(
          { ...baseMedication, endDate: pastEndDate },
          referenceNow
        )
      ).toBeNull();
    });

    it('schedules next dose today if time is still upcoming', () => {
      // 8:00 AM on 2026-08-31
      const fromTime = new Date(2026, 7, 31, 8, 0, 0).getTime();
      const med: Medication = {
        ...baseMedication,
        fixedTimesJson: '["10:00", "18:00"]',
      };

      const nextDose = calculateNextMedicationDose(med, fromTime);
      expect(nextDose).not.toBeNull();
      const nextDate = new Date(nextDose!);
      expect(nextDate.getDate()).toBe(31);
      expect(nextDate.getHours()).toBe(10);
      expect(nextDate.getMinutes()).toBe(0);
    });

    it('schedules next dose tomorrow if all times today have passed', () => {
      // 19:00 PM on 2026-08-31
      const fromTime = new Date(2026, 7, 31, 19, 0, 0).getTime();
      const med: Medication = {
        ...baseMedication,
        fixedTimesJson: '["10:00", "18:00"]',
      };

      const nextDose = calculateNextMedicationDose(med, fromTime);
      expect(nextDose).not.toBeNull();
      const nextDate = new Date(nextDose!);
      expect(nextDate.getDate()).toBe(1); // Sept 1st
      expect(nextDate.getHours()).toBe(10);
      expect(nextDate.getMinutes()).toBe(0);
    });

    it('respects day-of-week filtering for fixed times', () => {
      // 2026-08-31 is a Monday (day index 1)
      // If medication is only scheduled for Wednesday (day index 3) and Friday (day index 5)
      const fromTime = new Date(2026, 7, 31, 8, 0, 0).getTime(); // Monday morning
      const med: Medication = {
        ...baseMedication,
        fixedTimesJson: '["10:00"]',
        selectedDaysJson: '[3, 5]', // Wed & Fri only
      };

      const nextDose = calculateNextMedicationDose(med, fromTime);
      expect(nextDose).not.toBeNull();
      const nextDate = new Date(nextDose!);
      expect(nextDate.getDay()).toBe(3); // Wednesday
      expect(nextDate.getHours()).toBe(10);
    });

    it('calculates interval doses correctly starting in the future', () => {
      const fromTime = new Date(2026, 7, 31, 8, 0, 0).getTime();
      const startTime = new Date(2026, 7, 31, 12, 0, 0).getTime();
      const med: Medication = {
        ...baseMedication,
        scheduleType: 'interval',
        intervalHours: 8,
        intervalStartTime: startTime,
      };

      const nextDose = calculateNextMedicationDose(med, fromTime);
      expect(nextDose).toBe(startTime);
    });

    it('calculates next interval step when interval start time was in the past', () => {
      // Start was at 00:00, every 8 hours (00:00, 08:00, 16:00, 24:00...)
      // Current time is 09:30 -> next should be 16:00
      const startTime = new Date(2026, 7, 31, 0, 0, 0).getTime();
      const fromTime = new Date(2026, 7, 31, 9, 30, 0).getTime();
      const med: Medication = {
        ...baseMedication,
        scheduleType: 'interval',
        intervalHours: 8,
        intervalStartTime: startTime,
      };

      const nextDose = calculateNextMedicationDose(med, fromTime);
      expect(nextDose).not.toBeNull();
      const nextDate = new Date(nextDose!);
      expect(nextDate.getHours()).toBe(16);
      expect(nextDate.getMinutes()).toBe(0);
    });
  });
});
