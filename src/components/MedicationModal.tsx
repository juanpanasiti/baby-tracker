import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useMedicationStore } from '../store/useMedicationStore';
import { useBabyStore } from '../store/useBabyStore';
import { parseFixedTimes, parseSelectedDays } from '../utils/medicationSchedule';
import {
  X,
  Plus,
  Trash2,
  Clock,
  Calendar as CalendarIcon,
  Bell,
  Sparkles,
  Pill,
} from 'lucide-react-native';
import { DatePickerInput } from './DatePickerInput';

const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6];
const COMMON_INTERVALS = [4, 6, 8, 12, 24];

export function MedicationModal() {
  const { t, i18n } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);
  const {
    isMedicationModalOpen,
    editingMedication,
    closeMedicationModal,
    createMedication,
    updateMedication,
  } = useMedicationStore();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduleType, setScheduleType] = useState<'fixed_times' | 'interval'>('fixed_times');
  const [fixedTimes, setFixedTimes] = useState<string[]>(['10:00']);
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [intervalHours, setIntervalHours] = useState<number>(8);
  const [intervalStartTime, setIntervalStartTime] = useState<number>(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    return d.getTime();
  });
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState<number>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  });
  const [alertMode, setAlertMode] = useState<'notification' | 'alarm'>('alarm');
  const [status, setStatus] = useState<'active' | 'paused' | 'finished'>('active');

  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingMedication) {
      setName(editingMedication.name);
      setDosage(editingMedication.dosage || '');
      setNotes(editingMedication.notes || '');
      setScheduleType(editingMedication.scheduleType as 'fixed_times' | 'interval');
      setFixedTimes(parseFixedTimes(editingMedication.fixedTimesJson).length > 0 ? parseFixedTimes(editingMedication.fixedTimesJson) : ['10:00']);
      setSelectedDays(parseSelectedDays(editingMedication.selectedDaysJson));
      setIntervalHours(editingMedication.intervalHours || 8);
      setIntervalStartTime(editingMedication.intervalStartTime || Date.now());
      setHasEndDate(!!editingMedication.endDate);
      setEndDate(editingMedication.endDate || Date.now() + 7 * 24 * 3600 * 1000);
      setAlertMode((editingMedication.alertMode as 'notification' | 'alarm') || 'alarm');
      setStatus(editingMedication.status as 'active' | 'paused' | 'finished');
    } else {
      setName('');
      setDosage('');
      setNotes('');
      setScheduleType('fixed_times');
      setFixedTimes(['10:00']);
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      setIntervalHours(8);
      const d = new Date();
      d.setMinutes(0, 0, 0);
      setIntervalStartTime(d.getTime());
      setHasEndDate(false);
      setEndDate(Date.now() + 7 * 24 * 3600 * 1000);
      setAlertMode('alarm');
      setStatus('active');
    }
    setErrorMsg('');
  }, [editingMedication, isMedicationModalOpen]);

  const handleAddTime = (timeStr: string) => {
    if (!fixedTimes.includes(timeStr)) {
      setFixedTimes([...fixedTimes, timeStr].sort());
    }
  };

  const handleRemoveTime = (timeStr: string) => {
    if (fixedTimes.length > 1) {
      setFixedTimes(fixedTimes.filter((t) => t !== timeStr));
    }
  };

  const toggleDay = (dayIdx: number) => {
    if (selectedDays.includes(dayIdx)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayIdx));
      }
    } else {
      setSelectedDays([...selectedDays, dayIdx].sort());
    }
  };

  const handleTimePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    setIsTimePickerVisible(false);
    if (event.type === 'set' && date) {
      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      handleAddTime(`${h}:${m}`);
    }
  };

  const handleSave = async () => {
    if (!baby) return;
    if (!name.trim()) {
      setErrorMsg(t('common.required') + ': ' + t('medications.name'));
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        dosage: dosage.trim() || null,
        notes: notes.trim() || null,
        scheduleType,
        fixedTimesJson: scheduleType === 'fixed_times' ? JSON.stringify(fixedTimes) : null,
        intervalHours: scheduleType === 'interval' ? intervalHours : null,
        intervalStartTime: scheduleType === 'interval' ? intervalStartTime : null,
        selectedDaysJson: scheduleType === 'fixed_times' ? JSON.stringify(selectedDays) : null,
        endDate: hasEndDate ? endDate : null,
        alertMode,
        soundName: 'default',
        status,
      };

      if (editingMedication) {
        await updateMedication(baby.id, baby.name, editingMedication.id, payload);
      } else {
        await createMedication(baby.id, baby.name, payload);
      }
      closeMedicationModal();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Error saving medication');
    }
  };

  const isEditing = !!editingMedication;

  return (
    <Modal visible={isMedicationModalOpen} transparent animationType="slide" onRequestClose={closeMedicationModal}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pill size={22} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>
                {isEditing ? t('medications.editTitle') : t('medications.addTitle')}
              </Text>
            </View>
            <TouchableOpacity onPress={closeMedicationModal} style={styles.closeBtn}>
              <X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {errorMsg ? (
              <View style={[styles.errorBox, { backgroundColor: colors.danger + '20' }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('medications.name')} <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.cardBorder }]}
                placeholder={t('medications.namePlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Dosage Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('medications.dosage')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.cardBorder }]}
                placeholder={t('medications.dosagePlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={dosage}
                onChangeText={setDosage}
              />
            </View>

            {/* Schedule Type Segmented Buttons */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('medications.scheduleType')}</Text>
              <View style={[styles.segmentedContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    scheduleType === 'fixed_times' ? { backgroundColor: colors.primary } : null,
                  ]}
                  onPress={() => setScheduleType('fixed_times')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: scheduleType === 'fixed_times' ? '#FFFFFF' : colors.textMuted },
                    ]}
                  >
                    {t('medications.fixedTimes')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    scheduleType === 'interval' ? { backgroundColor: colors.primary } : null,
                  ]}
                  onPress={() => setScheduleType('interval')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: scheduleType === 'interval' ? '#FFFFFF' : colors.textMuted },
                    ]}
                  >
                    {t('medications.interval')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* If Fixed Times */}
            {scheduleType === 'fixed_times' ? (
              <View style={styles.scheduleBox}>
                <Text style={[styles.subSectionTitle, { color: colors.text }]}>
                  {t('medications.fixedTimes')}
                </Text>
                <View style={styles.timesRow}>
                  {fixedTimes.map((timeStr) => (
                    <View
                      key={timeStr}
                      style={[styles.timeChip, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                    >
                      <Clock size={14} color={colors.primary} />
                      <Text style={[styles.timeChipText, { color: colors.text }]}>{timeStr}</Text>
                      {fixedTimes.length > 1 && (
                        <TouchableOpacity onPress={() => handleRemoveTime(timeStr)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                          <Trash2 size={13} color={colors.textMuted} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  <TouchableOpacity
                    style={[styles.addTimeChip, { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
                    onPress={() => setIsTimePickerVisible(true)}
                  >
                    <Plus size={14} color={colors.primary} />
                    <Text style={[styles.addTimeChipText, { color: colors.primary }]}>{t('medications.addTime')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Days of Week */}
                <Text style={[styles.subSectionTitle, { color: colors.text, marginTop: 16 }]}>
                  {t('medications.daysOfWeek')}
                </Text>
                <View style={styles.daysRow}>
                  {DAY_INDICES.map((dayIdx) => {
                    const isSelected = selectedDays.includes(dayIdx);
                    return (
                      <TouchableOpacity
                        key={dayIdx}
                        style={[
                          styles.dayButton,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surface,
                            borderColor: isSelected ? colors.primary : colors.cardBorder,
                          },
                        ]}
                        onPress={() => toggleDay(dayIdx)}
                      >
                        <Text style={[styles.dayButtonText, { color: isSelected ? '#FFF' : colors.textMuted }]}>
                          {t(`medications.days.${dayIdx}`)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              /* If Interval */
              <View style={styles.scheduleBox}>
                <Text style={[styles.subSectionTitle, { color: colors.text }]}>
                  {t('medications.intervalHours')}
                </Text>
                <View style={styles.intervalOptionsRow}>
                  {COMMON_INTERVALS.map((hours) => (
                    <TouchableOpacity
                      key={hours}
                      style={[
                        styles.intervalChip,
                        {
                          backgroundColor: intervalHours === hours ? colors.primary : colors.surface,
                          borderColor: intervalHours === hours ? colors.primary : colors.cardBorder,
                        },
                      ]}
                      onPress={() => setIntervalHours(hours)}
                    >
                      <Text
                        style={[
                          styles.intervalChipText,
                          { color: intervalHours === hours ? '#FFF' : colors.textMuted },
                        ]}
                      >
                        {hours}h
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* End Date Toggle */}
            <View style={[styles.toggleRow, { borderColor: colors.cardBorder }]}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{t('medications.hasEndDate')}</Text>
              </View>
              <Switch
                value={hasEndDate}
                onValueChange={setHasEndDate}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {hasEndDate && (
              <View style={styles.inputGroup}>
                <DatePickerInput
                  value={endDate}
                  onChange={setEndDate}
                  label={t('medications.endDate')}
                />
              </View>
            )}

            {/* Alert Mode Switch */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('alarms.alertMode')}</Text>
              <View style={[styles.segmentedContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    alertMode === 'notification' ? { backgroundColor: colors.primary } : null,
                  ]}
                  onPress={() => setAlertMode('notification')}
                >
                  <Bell size={14} color={alertMode === 'notification' ? '#FFF' : colors.textMuted} />
                  <Text
                    style={[
                      styles.segmentText,
                      { color: alertMode === 'notification' ? '#FFFFFF' : colors.textMuted },
                    ]}
                  >
                    {t('alarms.notificationMode')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    alertMode === 'alarm' ? { backgroundColor: colors.warning } : null,
                  ]}
                  onPress={() => setAlertMode('alarm')}
                >
                  <Sparkles size={14} color={alertMode === 'alarm' ? '#FFF' : colors.textMuted} />
                  <Text
                    style={[
                      styles.segmentText,
                      { color: alertMode === 'alarm' ? '#FFFFFF' : colors.textMuted },
                    ]}
                  >
                    {t('alarms.alarmMode')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Selector (when editing) */}
            {isEditing && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('medications.status')}</Text>
                <View style={[styles.segmentedContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                  {(['active', 'paused', 'finished'] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.segmentButton,
                        status === s ? { backgroundColor: colors.primary } : null,
                      ]}
                      onPress={() => setStatus(s)}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          { color: status === s ? '#FFFFFF' : colors.textMuted },
                        ]}
                      >
                        {t(`medications.${s}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('medications.notes')}</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.cardBorder }]}
                placeholder={t('medications.notesPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* Time Picker Modal for adding fixed times */}
          {isTimePickerVisible && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimePickerChange}
            />
          )}

          {/* Footer Save / Cancel */}
          <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.cardBorder }]} onPress={closeMedicationModal}>
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 16,
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scheduleBox: {
    paddingVertical: 6,
    gap: 8,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  addTimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addTimeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  intervalOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  intervalChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
