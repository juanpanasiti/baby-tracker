import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { formatDateOnly } from '../utils/date';

interface DatePickerInputProps {
  value: number;
  onChange: (timestamp: number) => void;
  label?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export function DatePickerInput({
  value,
  onChange,
  label,
  maximumDate,
  minimumDate,
}: DatePickerInputProps) {
  const { t, i18n } = useTranslation();
  const colors = useThemeStore((state) => state.colors);

  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date(value));

  const currentDate = new Date(value);
  const locale = i18n.language.startsWith('es') ? 'es' : 'en';

  const handlePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setIsPickerVisible(false);
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate.getTime());
      }
    } else {
      // iOS
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const openPicker = () => {
    setTempDate(new Date(value));
    setIsPickerVisible(true);
  };

  const handleIosConfirm = () => {
    onChange(tempDate.getTime());
    setIsPickerVisible(false);
  };

  const handleIosCancel = () => {
    setIsPickerVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}

      {/* Date Button */}
      <TouchableOpacity
        style={[styles.pickerButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        <CalendarIcon size={20} color={colors.primary} style={styles.buttonIcon} />
        <View style={styles.buttonTextContainer}>
          <Text style={[styles.buttonValue, { color: colors.text }]}>{formatDateOnly(value, locale)}</Text>
        </View>
      </TouchableOpacity>

      {/* Android Native Picker */}
      {Platform.OS === 'android' && isPickerVisible && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          onChange={handlePickerChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}

      {/* iOS Modal Picker */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={isPickerVisible}
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
                  {label || t('appointments.date') || 'Date'}
                </Text>
                <TouchableOpacity onPress={handleIosConfirm}>
                  <Text style={[styles.iosHeaderBtn, { color: colors.primary, fontWeight: '700' }]}>{t('common.done') || 'Done'}</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handlePickerChange}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                textColor={colors.text}
                style={styles.iosPicker}
              />
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonValue: {
    fontSize: 15,
    fontWeight: '600',
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
