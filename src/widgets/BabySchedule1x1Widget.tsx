import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { type BabyWidgetData } from './types';

export function BabySchedule1x1Widget({ data }: { data?: BabyWidgetData }) {
  const feedingDisplay = data?.nextFeedingTime
    ? data.nextFeedingTime
    : data?.lastFeedingTime
    ? `${data.lastFeedingTime}`
    : '—';

  const medicationDisplay = data?.nextMedicationTime
    ? data.nextMedicationTime
    : 'Al día ✨';

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#18181B',
        borderRadius: 16,
        padding: 5,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'babycare://dashboard' }}
    >
      {/* Top Half: Feeding */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flex: 1,
          backgroundColor: '#27272A',
          borderRadius: 10,
          padding: 4,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 3,
        }}
      >
        <TextWidget
          text="🍼 Comida"
          style={{
            fontSize: 10,
            color: '#A1A1AA',
            fontWeight: 'bold',
          }}
        />
        <TextWidget
          text={feedingDisplay}
          style={{
            fontSize: 14,
            color: '#818CF8',
            fontWeight: 'bold',
            marginTop: 2,
          }}
        />
      </FlexWidget>

      {/* Bottom Half: Medication */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flex: 1,
          backgroundColor: '#27272A',
          borderRadius: 10,
          padding: 4,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="💊 Remedio"
          style={{
            fontSize: 10,
            color: '#A1A1AA',
            fontWeight: 'bold',
          }}
        />
        <TextWidget
          text={medicationDisplay}
          style={{
            fontSize: 12,
            color: '#34D399',
            fontWeight: 'bold',
            marginTop: 2,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
