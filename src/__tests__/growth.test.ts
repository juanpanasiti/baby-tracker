import {
  calculateGrowthDeltas,
  formatWeight,
  formatHeight,
  formatWeightDelta,
  formatHeightDelta,
} from '../utils/growth';
import { type GrowthRecord } from '../db/schema';

describe('growth utils', () => {
  describe('calculateGrowthDeltas', () => {
    it('returns empty array when given empty records', () => {
      expect(calculateGrowthDeltas([])).toEqual([]);
    });

    it('returns baseline with null delta for a single record', () => {
      const records: GrowthRecord[] = [
        {
          id: '1',
          babyId: 'baby-1',
          weightKg: 4.5,
          heightCm: 52.0,
          notes: 'Birth',
          timestamp: 1000000,
          createdAt: 1000000,
        },
      ];

      const result = calculateGrowthDeltas(records);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].delta).toBeNull();
    });

    it('calculates weight and height differences chronologically regardless of input order', () => {
      const DAY_MS = 24 * 60 * 60 * 1000;
      const baseTime = 1700000000000;

      const records: GrowthRecord[] = [
        {
          id: 'rec-3',
          babyId: 'baby-1',
          weightKg: 5.65, // +400g from rec-2
          heightCm: 59.0, // +2.5cm from rec-2
          notes: 'Month 2 checkup',
          timestamp: baseTime + 30 * DAY_MS,
          createdAt: baseTime + 30 * DAY_MS,
        },
        {
          id: 'rec-1',
          babyId: 'baby-1',
          weightKg: 4.5,
          heightCm: 54.0,
          notes: 'Birth',
          timestamp: baseTime,
          createdAt: baseTime,
        },
        {
          id: 'rec-2',
          babyId: 'baby-1',
          weightKg: 5.25, // +750g from rec-1
          heightCm: 56.5, // +2.5cm from rec-1
          notes: 'Month 1 checkup',
          timestamp: baseTime + 15 * DAY_MS,
          createdAt: baseTime + 15 * DAY_MS,
        },
      ];

      const result = calculateGrowthDeltas(records);

      // Result should be in descending order (rec-3, rec-2, rec-1)
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('rec-3');
      expect(result[1].id).toBe('rec-2');
      expect(result[2].id).toBe('rec-1');

      // rec-3 compared to rec-2
      expect(result[0].delta).toEqual({
        weightDiffKg: 0.4,
        weightDiffGrams: 400,
        heightDiffCm: 2.5,
        daysElapsed: 15,
      });

      // rec-2 compared to rec-1
      expect(result[1].delta).toEqual({
        weightDiffKg: 0.75,
        weightDiffGrams: 750,
        heightDiffCm: 2.5,
        daysElapsed: 15,
      });

      // rec-1 has no preceding record
      expect(result[2].delta).toBeNull();
    });

    it('handles negative weight difference (weight loss) and missing height', () => {
      const records: GrowthRecord[] = [
        {
          id: 'rec-1',
          babyId: 'baby-1',
          weightKg: 3.5,
          heightCm: null,
          notes: null,
          timestamp: 1000,
          createdAt: 1000,
        },
        {
          id: 'rec-2',
          babyId: 'baby-1',
          weightKg: 3.35, // -150g
          heightCm: 51.0,
          notes: null,
          timestamp: 2000,
          createdAt: 2000,
        },
      ];

      const result = calculateGrowthDeltas(records);
      expect(result[0].id).toBe('rec-2');
      expect(result[0].delta?.weightDiffGrams).toBe(-150);
      expect(result[0].delta?.heightDiffCm).toBeNull();
    });
  });

  describe('format helpers', () => {
    it('formats weight in kg', () => {
      expect(formatWeight(5.25)).toBe('5.25 kg');
      expect(formatWeight(5.256)).toBe('5.256 kg');
      expect(formatWeight(4)).toBe('4 kg');
    });

    it('formats height in cm', () => {
      expect(formatHeight(58.5)).toBe('58.5 cm');
      expect(formatHeight(60)).toBe('60 cm');
    });

    it('formats weight delta in grams with signs', () => {
      expect(formatWeightDelta(350)).toBe('+350 g');
      expect(formatWeightDelta(-120)).toBe('-120 g');
      expect(formatWeightDelta(0)).toBe('0 g');
    });

    it('formats height delta in cm with signs', () => {
      expect(formatHeightDelta(2.5)).toBe('+2.5 cm');
      expect(formatHeightDelta(-0.5)).toBe('-0.5 cm');
      expect(formatHeightDelta(0)).toBe('0 cm');
    });
  });
});
