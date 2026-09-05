import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBabyStore } from '../store/useBabyStore';
import { useFeedingStore } from '../store/useFeedingStore';
import { useMedicationStore } from '../store/useMedicationStore';
import { calculateNextMedicationDose } from '../utils/medicationSchedule';
import { formatTimeOnly } from '../utils/date';
import { WIDGET_DATA_STORAGE_KEY } from '../widgets/widgetTaskHandler';
import { BabySchedule1x1Widget } from '../widgets/BabySchedule1x1Widget';
import { BabySchedule1x2Widget } from '../widgets/BabySchedule1x2Widget';
import { BabySchedule2x2Widget } from '../widgets/BabySchedule2x2Widget';
import { type BabyWidgetData } from '../widgets/types';

export async function syncBabyWidgetsData(): Promise<void> {
  try {
    const baby = useBabyStore.getState().baby;
    const { activeReminder, latestFeeding } = useFeedingStore.getState();
    const { medications } = useMedicationStore.getState();

    // 1. Feeding calculation
    let nextFeedingTime: string | null = null;
    if (activeReminder && activeReminder.isActive && activeReminder.targetTime > Date.now()) {
      nextFeedingTime = formatTimeOnly(activeReminder.targetTime);
    }

    let lastFeedingTime: string | null = null;
    if (latestFeeding && latestFeeding.timestamp) {
      lastFeedingTime = formatTimeOnly(latestFeeding.timestamp);
    }

    // 2. Medication calculation
    let nextMedicationName: string | null = null;
    let nextMedicationDosage: string | null = null;
    let nextMedicationTime: string | null = null;

    const activeMedsWithDoses = medications
      .filter((m) => m.status === 'active')
      .map((m) => ({
        medication: m,
        nextDoseTimestamp: calculateNextMedicationDose(m),
      }))
      .filter((item): item is { medication: typeof item.medication; nextDoseTimestamp: number } => item.nextDoseTimestamp !== null)
      .sort((a, b) => a.nextDoseTimestamp - b.nextDoseTimestamp);

    if (activeMedsWithDoses.length > 0) {
      const nearest = activeMedsWithDoses[0];
      nextMedicationName = nearest.medication.name;
      nextMedicationDosage = nearest.medication.dosage || null;
      nextMedicationTime = formatTimeOnly(nearest.nextDoseTimestamp);
    }

    const widgetData: BabyWidgetData = {
      babyName: baby?.name,
      nextFeedingTime,
      lastFeedingTime,
      nextMedicationName,
      nextMedicationDosage,
      nextMedicationTime,
    };

    // 3. Persist to AsyncStorage for cold boot rendering
    await AsyncStorage.setItem(WIDGET_DATA_STORAGE_KEY, JSON.stringify(widgetData));

    // 4. Request updates for each widget size using React.createElement
    await Promise.allSettled([
      requestWidgetUpdate({
        widgetName: 'BabySchedule1x1',
        renderWidget: () => React.createElement(BabySchedule1x1Widget, { data: widgetData }),
        widgetNotFound: () => {},
      }),
      requestWidgetUpdate({
        widgetName: 'BabySchedule1x2',
        renderWidget: () => React.createElement(BabySchedule1x2Widget, { data: widgetData }),
        widgetNotFound: () => {},
      }),
      requestWidgetUpdate({
        widgetName: 'BabySchedule2x2',
        renderWidget: () => React.createElement(BabySchedule2x2Widget, { data: widgetData }),
        widgetNotFound: () => {},
      }),
    ]);
  } catch (error) {
    console.error('[WidgetSync] Failed to sync baby widgets data:', error);
  }
}
