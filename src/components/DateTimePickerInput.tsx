import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { Clock, Calendar as CalendarIcon } from 'lucide-react-native';

interface DateTimePickerInputProps {
  value: number;
  onChange: (timestamp: number) => void;
  label?: string;
}

export function DateTimePickerInput({ value, onChange, label }: DateTimePickerInputProps) {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);

  const dateObj = new Date(value);
  const [day, setDay] = useState(dateObj.getDate().toString().padStart(2, '0'));
  const [month, setMonth] = useState((dateObj.getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(dateObj.getFullYear().toString());
  const [hours, setHours] = useState(dateObj.getHours().toString().padStart(2, '0'));
  const [minutes, setMinutes] = useState(dateObj.getMinutes().toString().padStart(2, '0'));

  // Sync internal input fields whenever value prop updates
  useEffect(() => {
    const d = new Date(value);
    setDay(d.getDate().toString().padStart(2, '0'));
    setMonth((d.getMonth() + 1).toString().padStart(2, '0'));
    setYear(d.getFullYear().toString());
    setHours(d.getHours().toString().padStart(2, '0'));
    setMinutes(d.getMinutes().toString().padStart(2, '0'));
  }, [value]);

  const updateTimestamp = (dStr: string, mStr: string, yStr: string, hStr: string, minStr: string) => {
    const d = parseInt(dStr, 10);
    const m = parseInt(mStr, 10) - 1;
    const y = parseInt(yStr, 10);
    const hr = parseInt(hStr, 10);
    const min = parseInt(minStr, 10);

    if (!isNaN(d) && !isNaN(m) && !isNaN(y) && !isNaN(hr) && !isNaN(min)) {
      if (d >= 1 && d <= 31 && m >= 0 && m <= 11 && y >= 2000 && y <= 2100 && hr >= 0 && hr <= 23 && min >= 0 && min <= 59) {
        const newDate = new Date(y, m, d, hr, min);
        onChange(newDate.getTime());
      }
    }
  };

  const handleQuickPreset = (offsetMinutes: number) => {
    const targetTimestamp = Date.now() - offsetMinutes * 60 * 1000;
    onChange(targetTimestamp);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label || t('appointments.dateTime')}
      </Text>

      {/* Quick Presets */}
      <View style={styles.presetsRow}>
        <TouchableOpacity
          style={[styles.presetButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}
          onPress={() => handleQuickPreset(0)}
        >
          <Text style={[styles.presetText, { color: colors.primary }]}>{t('common.now') || 'Now'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.presetButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}
          onPress={() => handleQuickPreset(15)}
        >
          <Text style={[styles.presetText, { color: colors.textSecondary }]}>-15 min</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.presetButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}
          onPress={() => handleQuickPreset(30)}
        >
          <Text style={[styles.presetText, { color: colors.textSecondary }]}>-30 min</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.presetButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}
          onPress={() => handleQuickPreset(60)}
        >
          <Text style={[styles.presetText, { color: colors.textSecondary }]}>-1 hr</Text>
        </TouchableOpacity>
      </View>

      {/* Date & Time Inputs */}
      <View style={styles.inputsGrid}>
        {/* Date Inputs */}
        <View style={styles.dateColContainer}>
          <View style={styles.subRow}>
            <View style={styles.inputCol}>
              <Text style={[styles.subLabel, { color: colors.textMuted }]}>DD</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSubtle, color: colors.text, borderColor: colors.cardBorder }]}
                keyboardType="number-pad"
                maxLength={2}
                value={day}
                onChangeText={(val) => {
                  setDay(val);
                  updateTimestamp(val, month, year, hours, minutes);
                }}
              />
            </View>

            <View style={styles.inputCol}>
              <Text style={[styles.subLabel, { color: colors.textMuted }]}>MM</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSubtle, color: colors.text, borderColor: colors.cardBorder }]}
                keyboardType="number-pad"
                maxLength={2}
                value={month}
                onChangeText={(val) => {
                  setMonth(val);
                  updateTimestamp(day, val, year, hours, minutes);
                }}
              />
            </View>

            <View style={[styles.inputCol, { flex: 1.3 }]}>
              <Text style={[styles.subLabel, { color: colors.textMuted }]}>YYYY</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSubtle, color: colors.text, borderColor: colors.cardBorder }]}
                keyboardType="number-pad"
                maxLength={4}
                value={year}
                onChangeText={(val) => {
                  setYear(val);
                  updateTimestamp(day, month, val, hours, minutes);
                }}
              />
            </View>
          </View>
        </View>

        {/* Time Inputs */}
        <View style={styles.timeColContainer}>
          <View style={styles.subRow}>
            <View style={styles.inputCol}>
              <Text style={[styles.subLabel, { color: colors.textMuted }]}>HH</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSubtle, color: colors.text, borderColor: colors.cardBorder }]}
                keyboardType="number-pad"
                maxLength={2}
                value={hours}
                onChangeText={(val) => {
                  setHours(val);
                  updateTimestamp(day, month, year, val, minutes);
                }}
              />
            </View>

            <Text style={[styles.colon, { color: colors.text }]}>:</Text>

            <View style={styles.inputCol}>
              <Text style={[styles.subLabel, { color: colors.textMuted }]}>MM</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSubtle, color: colors.text, borderColor: colors.cardBorder }]}
                keyboardType="number-pad"
                maxLength={2}
                value={minutes}
                onChangeText={(val) => {
                  setMinutes(val);
                  updateTimestamp(day, month, year, hours, val);
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputsGrid: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  dateColContainer: {
    flex: 1.4,
  },
  timeColContainer: {
    flex: 1,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputCol: {
    flex: 1,
    alignItems: 'center',
  },
  subLabel: {
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 42,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
  colon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 14,
  },
});
