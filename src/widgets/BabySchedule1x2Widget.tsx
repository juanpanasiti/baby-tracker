import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { type BabyWidgetData } from './types';

export function BabySchedule1x2Widget({ data }: { data?: BabyWidgetData }) {
  const feedingTime = data?.nextFeedingTime;
  const lastFeeding = data?.lastFeedingTime;
  const feedingDisplay = feedingTime ?? (lastFeeding ? lastFeeding : '—');
  const feedingSubtitle = feedingTime
    ? lastFeeding
      ? `Última: ${lastFeeding}`
      : 'Programada'
    : lastFeeding
    ? 'Última toma'
    : 'Sin programar';

  const medTime = data?.nextMedicationTime;
  const medName = data?.nextMedicationName ?? 'Remedio';
  const medDosage = data?.nextMedicationDosage;
  const medDisplay = medTime ? `${medName} • ${medTime}` : 'Al día ✨';
  const medSubtitle = medTime
    ? medDosage
      ? `Dosis: ${medDosage}`
      : 'Dosis programada'
    : 'Sin pendientes';

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#18181B',
        borderRadius: 16,
        padding: 6,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* Left Panel: Feeding */}
      <FlexWidget
        style={{
          flex: 1,
          height: 'match_parent',
          backgroundColor: '#27272A',
          borderRadius: 12,
          padding: 8,
          flexDirection: 'column',
          justifyContent: 'center',
          marginRight: 4,
        }}
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'babycare://feeding/new' }}
      >
        <TextWidget
          text="🍼 Comida"
          style={{
            fontSize: 11,
            color: '#A1A1AA',
            fontWeight: 'bold',
          }}
        />
        <TextWidget
          text={feedingDisplay}
          style={{
            fontSize: 16,
            color: '#818CF8',
            fontWeight: 'bold',
            marginTop: 2,
          }}
        />
        <TextWidget
          text={feedingSubtitle}
          style={{
            fontSize: 9,
            color: '#71717A',
            marginTop: 2,
          }}
        />
      </FlexWidget>

      {/* Right Panel: Medication */}
      <FlexWidget
        style={{
          flex: 1,
          height: 'match_parent',
          backgroundColor: '#27272A',
          borderRadius: 12,
          padding: 8,
          flexDirection: 'column',
          justifyContent: 'center',
          marginLeft: 4,
        }}
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'babycare://medications/dose' }}
      >
        <TextWidget
          text="💊 Medicación"
          style={{
            fontSize: 11,
            color: '#A1A1AA',
            fontWeight: 'bold',
          }}
        />
        <TextWidget
          text={medDisplay}
          style={{
            fontSize: 13,
            color: '#34D399',
            fontWeight: 'bold',
            marginTop: 2,
          }}
        />
        <TextWidget
          text={medSubtitle}
          style={{
            fontSize: 9,
            color: '#71717A',
            marginTop: 2,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
