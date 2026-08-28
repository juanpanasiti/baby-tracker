import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, Clock } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { formatDateOnly, formatTimeOnly } from '../utils/date';

interface DateTimePickerInputProps {
  value: number;
  onChange: (timestamp: number) => void;
  label?: string;
  showPresets?: boolean;
  maximumDate?: Date;
  minimumDate?: Date;
}

export function DateTimePickerInput({
  value,
  onChange,
  label,
  showPresets = true,
  maximumDate,
  minimumDate,
}: DateTimePickerInputProps) {
  const { t, i18n } = useTranslation();
  const colors = useThemeStore((state) => state.colors);

  const [activePickerMode, setActivePickerMode] = useState<'date' | 'time' | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date(value));

  const currentDate = new Date(value);
  const locale = i18n.language.startsWith('es') ? 'es' : 'en';

  const handleQuickPreset = (offsetMinutes: number) => {
    const targetTimestamp = Date.now() - offsetMinutes * 60 * 1000;
    onChange(targetTimestamp);
  };

  const handlePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setActivePickerMode(null);
      if (event.type === 'set' && selectedDate) {
        applyDateOrTimeChange(selectedDate, activePickerMode);
      }
    } else {
      // iOS
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const applyDateOrTimeChange = (selected: Date, mode: 'date' | 'time' | null) => {
    const result = new Date(value);
    if (mode === 'date') {
      result.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    } else if (mode === 'time') {
      result.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    }
    onChange(result.getTime());
  };

  const openPicker = (mode: 'date' | 'time') => {
    setTempDate(new Date(value));
    setActivePickerMode(mode);
  };

  const handleIosConfirm = () => {
    applyDateOrTimeChange(tempDate, activePickerMode);
    setActivePickerMode(null);
  };

  const handleIosCancel = () => {
    setActivePickerMode(null);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label || t('appointments.dateTime') || 'Date & Time'}
      </Text>

      {/* Quick Presets */}
      {showPresets && (
        <View style={styles.presetsRow}>
          <TouchableOpacity
            style={[styles.presetButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}
            onPress={() => handleQuickPreset(0)}
            activeOpacity={0.7}
          >
            <Text style={[styles.presetText, { color: colors.primary }]}>{t('common.now') || 'Now'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}
            onPress={() => handleQuickPreset(15)}
            activeOpacity={0.7}
          >
            <Text style={[styles.presetText, { color: colors.textSecondary }]}>-15 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}
            onPress={() => handleQuickPreset(30)}
            activeOpacity={0.7}
          >
            <Text style={[styles.presetText, { color: colors.textSecondary }]}>-30 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}
            onPress={() => handleQuickPreset(60)}
            activeOpacity={0.7}
          >
            <Text style={[styles.presetText, { color: colors.textSecondary }]}>-1 hr</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Date & Time Buttons */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.pickerButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}
          onPress={() => openPicker('date')}
          activeOpacity={0.7}
        >
          <CalendarIcon size={18} color={colors.primary} style={styles.buttonIcon} />
          <View style={styles.buttonTextContainer}>
            <Text style={[styles.buttonLabel, { color: colors.textMuted }]}>{t('appointments.date') || 'Date'}</Text>
            <Text style={[styles.buttonValue, { color: colors.text }]}>{formatDateOnly(value, locale)}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pickerButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}
          onPress={() => openPicker('time')}
          activeOpacity={0.7}
        >
          <Clock size={18} color={colors.primary} style={styles.buttonIcon} />
          <View style={styles.buttonTextContainer}>
            <Text style={[styles.buttonLabel, { color: colors.textMuted }]}>{t('appointments.time') || 'Time'}</Text>
            <Text style={[styles.buttonValue, { color: colors.text }]}>{formatTimeOnly(value)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Android Picker */}
      {Platform.OS === 'android' && activePickerMode !== null && (
        <DateTimePicker
          value={currentDate}
          mode={activePickerMode}
          is24Hour={true}
          display="default"
          onChange={handlePickerChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}

      {/* iOS Modal Picker */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={activePickerMode !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={handleIosCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.iosModalContent, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <View style={[styles.iosHeader, { borderBottomColor: colors.cardBorder }]}>
                <TouchableOpacity onPress={handleIosCancel}>
                  <Text style={[styles.iosHeaderBtn, { color: colors.textMuted }]}>{t('common.cancel') || 'Cancel'}</Text>
                </TouchableOpacity>
                <Text style={[styles.iosHeaderTitle, { color: colors.text }]}>
                  {activePickerMode === 'date' ? (t('appointments.date') || 'Date') : (t('appointments.time') || 'Time')}
                </Text>
                <TouchableOpacity onPress={handleIosConfirm}>
                  <Text style={[styles.iosHeaderBtn, { color: colors.primary, fontWeight: '700' }]}>{t('common.done') || 'Done'}</Text>
                </TouchableOpacity>
              </View>

              {activePickerMode !== null && (
                <DateTimePicker
                  value={tempDate}
                  mode={activePickerMode}
                  display="spinner"
                  onChange={handlePickerChange}
                  maximumDate={maximumDate}
                  minimumDate={minimumDate}
                  textColor={colors.text}
                  style={styles.iosPicker}
                />
              )}
            </View>
          </View>
        </Modal>
      )}
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
    paddingVertical: 7,
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
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  buttonValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  iosModalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    paddingBottom: 24,
  },
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iosHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  iosHeaderBtn: {
    fontSize: 15,
  },
  iosPicker: {
    height: 200,
  },
});
