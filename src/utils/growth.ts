import { type GrowthRecord } from '../db/schema';

export interface GrowthDelta {
  weightDiffKg: number;
  weightDiffGrams: number;
  heightDiffCm: number | null;
  daysElapsed: number;
}

export interface GrowthRecordWithDelta extends GrowthRecord {
  delta: GrowthDelta | null;
}

/**
 * Calculates comparative growth deltas (weight gain/loss and height difference)
 * relative to the immediately preceding chronological measurement.
 * Returns records sorted by timestamp descending (newest first).
 */
export function calculateGrowthDeltas(records: GrowthRecord[]): GrowthRecordWithDelta[] {
  if (!records || records.length === 0) {
    return [];
  }

  // Sort ascending by timestamp to calculate chronological progression
  const sortedAsc = [...records].sort((a, b) => a.timestamp - b.timestamp);

  const withDeltas: GrowthRecordWithDelta[] = sortedAsc.map((record, index) => {
    if (index === 0) {
      return {
        ...record,
        delta: null,
      };
    }

    const prevRecord = sortedAsc[index - 1];
    const weightDiffKg = Number((record.weightKg - prevRecord.weightKg).toFixed(3));
    const weightDiffGrams = Math.round(weightDiffKg * 1000);

    const hasBothHeights =
      record.heightCm !== null &&
      record.heightCm !== undefined &&
      prevRecord.heightCm !== null &&
      prevRecord.heightCm !== undefined;

    const heightDiffCm = hasBothHeights
      ? Number((record.heightCm! - prevRecord.heightCm!).toFixed(1))
      : null;

    const daysElapsed = Math.max(
      0,
      Math.round((record.timestamp - prevRecord.timestamp) / (1000 * 60 * 60 * 24))
    );

    return {
      ...record,
      delta: {
        weightDiffKg,
        weightDiffGrams,
        heightDiffCm,
        daysElapsed,
      },
    };
  });

  // Return in descending order (newest first) for UI display
  return withDeltas.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Formats weight value in kg with up to 3 decimal places (e.g. "5.250 kg" or "5.25 kg")
 */
export function formatWeight(weightKg: number): string {
  const rounded = Number(weightKg.toFixed(3));
  return `${rounded} kg`;
}

/**
 * Formats height value in cm (e.g. "58.5 cm")
 */
export function formatHeight(heightCm: number): string {
  const rounded = Number(heightCm.toFixed(1));
  return `${rounded} cm`;
}

/**
 * Formats weight difference in grams (e.g. "+350 g", "-120 g", "0 g")
 */
export function formatWeightDelta(weightDiffGrams: number): string {
  if (weightDiffGrams > 0) {
    return `+${weightDiffGrams} g`;
  }
  return `${weightDiffGrams} g`;
}

/**
 * Formats height difference in cm (e.g. "+2.5 cm", "-0.5 cm", "0 cm")
 */
export function formatHeightDelta(heightDiffCm: number): string {
  if (heightDiffCm > 0) {
    return `+${heightDiffCm} cm`;
  }
  return `${heightDiffCm} cm`;
}
