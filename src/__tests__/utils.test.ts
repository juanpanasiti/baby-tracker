import { calculateBabyAge, formatRelativeTime, formatTimeOnly, formatDateOnly, formatDateTimeDisplay } from '../utils/date';
import { generateId } from '../utils/id';

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('generates non-empty unique string IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(5);
      expect(id1).not.toBe(id2);
    });
  });

  describe('calculateBabyAge', () => {
    it('calculates age in days correctly for newborn', () => {
      const now = Date.now();
      const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;
      const age = calculateBabyAge(fiveDaysAgo);
      expect(age.totalDays).toBe(5);
    });

    it('calculates age in months and days', () => {
      const birth = new Date(2026, 0, 15).getTime(); // Jan 15, 2026
      const age = calculateBabyAge(birth);
      expect(age.totalDays).toBeGreaterThan(0);
    });
  });

  describe('formatRelativeTime', () => {
    it('formats just now for recent events in EN and ES', () => {
      const now = Date.now();
      expect(formatRelativeTime(now, false)).toBe('Just now');
      expect(formatRelativeTime(now, true)).toBe('Recién');
    });

    it('formats minutes ago correctly', () => {
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      expect(formatRelativeTime(tenMinutesAgo, false)).toBe('10m ago');
      expect(formatRelativeTime(tenMinutesAgo, true)).toBe('hace 10 min');
    });

    it('formats hours ago correctly', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      expect(formatRelativeTime(twoHoursAgo, false)).toBe('2h ago');
      expect(formatRelativeTime(twoHoursAgo, true)).toBe('hace 2 h');
    });
  });

  describe('formatTimeOnly', () => {
    it('returns HH:MM formatted string', () => {
      const date = new Date(2026, 7, 26, 14, 30);
      const timeStr = formatTimeOnly(date.getTime());
      expect(timeStr).toBe('14:30');
    });
  });

  describe('formatDateOnly', () => {
    it('returns localized date formatted string', () => {
      const date = new Date(2026, 7, 26, 14, 30);
      const enDate = formatDateOnly(date.getTime(), 'en');
      const esDate = formatDateOnly(date.getTime(), 'es');
      expect(enDate).toContain('2026');
      expect(esDate).toContain('2026');
    });
  });

  describe('formatDateTimeDisplay', () => {
    it('returns localized date and time formatted string', () => {
      const date = new Date(2026, 7, 26, 14, 30);
      const enDateTime = formatDateTimeDisplay(date.getTime(), 'en');
      expect(enDateTime).toContain('14:30');
      expect(enDateTime).toContain('2026');
    });
  });
});
