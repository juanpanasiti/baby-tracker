import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BabySchedule1x1Widget } from './BabySchedule1x1Widget';
import { BabySchedule1x2Widget } from './BabySchedule1x2Widget';
import { BabySchedule2x2Widget } from './BabySchedule2x2Widget';
import { type BabyWidgetData } from './types';

export const WIDGET_DATA_STORAGE_KEY = '@babycare_widget_data';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, renderWidget } = props;

  let cachedData: BabyWidgetData | undefined;
  try {
    const raw = await AsyncStorage.getItem(WIDGET_DATA_STORAGE_KEY);
    if (raw) {
      cachedData = JSON.parse(raw);
    }
  } catch {
    // Fallback to undefined on storage error
  }

  switch (widgetInfo.widgetName) {
    case 'BabySchedule1x1':
      renderWidget(<BabySchedule1x1Widget data={cachedData} />);
      break;
    case 'BabySchedule1x2':
      renderWidget(<BabySchedule1x2Widget data={cachedData} />);
      break;
    case 'BabySchedule2x2':
      renderWidget(<BabySchedule2x2Widget data={cachedData} />);
      break;
    default:
      break;
  }
}
