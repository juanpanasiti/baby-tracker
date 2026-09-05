import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { type BabyWidgetData } from './types';

export function BabySchedule2x2Widget({ data }: { data?: BabyWidgetData }) {
  const babyTitle = data?.babyName ? `👶 ${data.babyName}` : '👶 Baby Care';

  const feedingTime = data?.nextFeedingTime;
  const lastFeeding = data?.lastFeedingTime;
  const feedingDisplay = feedingTime ?? (lastFeeding ? lastFeeding : 'Sin programar');
  const feedingSub = feedingTime
    ? lastFeeding
      ? `Última toma: ${lastFeeding}`
      : 'Horario programado'
    : lastFeeding
    ? 'Última comida registrada'
    : 'Toca abajo para registrar';

  const medTime = data?.nextMedicationTime;
  const medName = data?.nextMedicationName ?? 'Remedio';
  const medDosage = data?.nextMedicationDosage;
  const medDisplay = medTime ? `${medName} • ${medTime}` : 'Al día ✨';
  const medSub = medTime
    ? medDosage
      ? `Dosis: ${medDosage}`
      : 'Próxima toma'
    : 'Sin dosis pendientes';

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#18181B',
        borderRadius: 18,
        padding: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'babycare://dashboard' }}
      >
        <TextWidget
          text={babyTitle}
          style={{
            fontSize: 13,
            color: '#F4F4F5',
            fontWeight: 'bold',
          }}
        />
        <TextWidget
          text="Horarios"
          style={{
            fontSize: 10,
            color: '#71717A',
          }}
        />
      </FlexWidget>

      {/* Feeding Card */}
      <FlexWidget
        style={{
          width: 'match_parent',
          backgroundColor: '#27272A',
          borderRadius: 12,
          padding: 8,
          marginBottom: 6,
          flexDirection: 'column',
        }}
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'babycare://feeding/new' }}
      >
        <TextWidget
          text="🍼 Próxima Comida"
          style={{
            fontSize: 10,
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
          text={feedingSub}
          style={{
            fontSize: 9,
            color: '#71717A',
            marginTop: 2,
          }}
        />
      </FlexWidget>

      {/* Medication Card */}
      <FlexWidget
        style={{
          width: 'match_parent',
          backgroundColor: '#27272A',
          borderRadius: 12,
          padding: 8,
          marginBottom: 6,
          flexDirection: 'column',
        }}
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'babycare://medications/dose' }}
      >
        <TextWidget
          text="💊 Próxima Medicación"
          style={{
            fontSize: 10,
            color: '#A1A1AA',
            fontWeight: 'bold',
          }}
        />
        <TextWidget
          text={medDisplay}
          style={{
            fontSize: 14,
            color: '#34D399',
            fontWeight: 'bold',
            marginTop: 2,
          }}
        />
        <TextWidget
          text={medSub}
          style={{
            fontSize: 9,
            color: '#71717A',
            marginTop: 2,
          }}
        />
      </FlexWidget>

      {/* Action Buttons Row */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: '#4F46E5',
            borderRadius: 8,
            paddingVertical: 6,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 4,
          }}
          clickAction="OPEN_URI"
          clickActionData={{ uri: 'babycare://feeding/new' }}
        >
          <TextWidget
            text="+ Comida"
            style={{
              fontSize: 11,
              color: '#FFFFFF',
              fontWeight: 'bold',
            }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: '#059669',
            borderRadius: 8,
            paddingVertical: 6,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 4,
          }}
          clickAction="OPEN_URI"
          clickActionData={{ uri: 'babycare://medications/dose' }}
        >
          <TextWidget
            text="✓ Dosis"
            style={{
              fontSize: 11,
              color: '#FFFFFF',
              fontWeight: 'bold',
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
