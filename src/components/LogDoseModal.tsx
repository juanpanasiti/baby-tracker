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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useMedicationStore } from '../store/useMedicationStore';
import { useBabyStore } from '../store/useBabyStore';
import { X, Pill, Check } from 'lucide-react-native';
import { DateTimePickerInput } from './DateTimePickerInput';

export function LogDoseModal() {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);
  const {
    medications,
    isLogDoseModalOpen,
    selectedMedicationForLog,
    closeLogDoseModal,
    logDose,
  } = useMedicationStore();

  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedMedicationForLog) {
      setSelectedMedId(selectedMedicationForLog.id);
      setDosage(selectedMedicationForLog.dosage || '');
    } else if (medications.length > 0) {
      const firstActive = medications.find((m) => m.status === 'active') || medications[0];
      setSelectedMedId(firstActive.id);
      setDosage(firstActive.dosage || '');
    }
    setNotes('');
    setTimestamp(Date.now());
    setErrorMsg('');
  }, [selectedMedicationForLog, isLogDoseModalOpen, medications]);

  const handleMedicationChange = (id: string) => {
    setSelectedMedId(id);
    const med = medications.find((m) => m.id === id);
    if (med && med.dosage) {
      setDosage(med.dosage);
    }
  };

  const handleSave = async () => {
    if (!selectedMedId) {
      setErrorMsg(t('common.required') + ': ' + t('medications.name'));
      return;
    }

    try {
      await logDose(selectedMedId, {
        dosage: dosage.trim() || undefined,
        notes: notes.trim() || undefined,
        timestamp,
      });
      closeLogDoseModal();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Error logging dose');
    }
  };

  const activeMedications = medications.filter((m) => m.status === 'active');
  const availableMedications = activeMedications.length > 0 ? activeMedications : medications;

  return (
    <Modal visible={isLogDoseModalOpen} transparent animationType="slide" onRequestClose={closeLogDoseModal}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pill size={22} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>{t('medications.logDoseTitle')}</Text>
            </View>
            <TouchableOpacity onPress={closeLogDoseModal} style={styles.closeBtn}>
              <X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {errorMsg ? (
              <View style={[styles.errorBox, { backgroundColor: colors.danger + '20' }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Medication Selector Pills */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('medications.name')} <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.medsRow}>
                {availableMedications.map((med) => {
                  const isSelected = selectedMedId === med.id;
                  return (
                    <TouchableOpacity
                      key={med.id}
                      style={[
                        styles.medChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.cardBorder,
                        },
                      ]}
                      onPress={() => handleMedicationChange(med.id)}
                    >
                      <Text style={[styles.medChipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                        {med.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Dosage */}
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

            {/* Date & Time */}
            <View style={styles.inputGroup}>
              <DateTimePickerInput
                value={timestamp}
                onChange={setTimestamp}
                label={t('common.dateTime')}
                maximumDate={new Date()}
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('common.notes')}</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.cardBorder }]}
                placeholder={t('medications.notesPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.cardBorder }]} onPress={closeLogDoseModal}>
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{t('common.confirm')}</Text>
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
    maxHeight: '85%',
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
  medsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  medChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  medChipText: {
    fontSize: 14,
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
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
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
