import React, { useEffect, useState } from 'react';
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
import { useGrowthStore } from '../store/useGrowthStore';
import { useBabyStore } from '../store/useBabyStore';
import { X, Scale, AlertCircle } from 'lucide-react-native';
import { DateTimePickerInput } from './DateTimePickerInput';

export function GrowthModal() {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);
  const {
    isGrowthModalOpen,
    editingRecord,
    closeGrowthModal,
    createGrowthRecord,
    updateGrowthRecord,
  } = useGrowthStore();

  const [weightText, setWeightText] = useState('');
  const [heightText, setHeightText] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isGrowthModalOpen) {
      setErrorMessage('');
      if (editingRecord) {
        setWeightText(editingRecord.weightKg.toString());
        setHeightText(editingRecord.heightCm ? editingRecord.heightCm.toString() : '');
        setTimestamp(editingRecord.timestamp);
        setNotes(editingRecord.notes || '');
      } else {
        setWeightText('');
        setHeightText('');
        setTimestamp(Date.now());
        setNotes('');
      }
    }
  }, [isGrowthModalOpen, editingRecord]);

  const handleSave = async () => {
    if (!baby) return;

    const normalizedWeightStr = weightText.replace(',', '.').trim();
    const weightNum = parseFloat(normalizedWeightStr);

    if (isNaN(weightNum) || weightNum <= 0) {
      setErrorMessage(t('growth.errors.invalidWeight'));
      return;
    }

    let heightNum: number | null = null;
    if (heightText.trim()) {
      const normalizedHeightStr = heightText.replace(',', '.').trim();
      const parsedHeight = parseFloat(normalizedHeightStr);
      if (isNaN(parsedHeight) || parsedHeight <= 0) {
        setErrorMessage(t('growth.errors.invalidHeight'));
        return;
      }
      heightNum = Number(parsedHeight.toFixed(1));
    }

    if (timestamp > Date.now()) {
      setErrorMessage(t('growth.errors.futureDate'));
      return;
    }

    if (editingRecord) {
      await updateGrowthRecord(baby.id, editingRecord.id, {
        weightKg: Number(weightNum.toFixed(3)),
        heightCm: heightNum,
        notes: notes.trim() || null,
        timestamp,
      });
    } else {
      await createGrowthRecord(baby.id, {
        weightKg: Number(weightNum.toFixed(3)),
        heightCm: heightNum,
        notes: notes.trim() || null,
        timestamp,
      });
    }
  };

  return (
    <Modal
      visible={isGrowthModalOpen}
      transparent
      animationType="slide"
      onRequestClose={closeGrowthModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.headerIconCircle, { backgroundColor: colors.primary + '20' }]}>
                <Scale size={20} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {editingRecord ? t('growth.editTitle') : t('growth.logTitle')}
              </Text>
            </View>
            <TouchableOpacity onPress={closeGrowthModal} style={styles.closeBtn}>
              <X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Error Banner */}
            {errorMessage ? (
              <View style={[styles.errorBanner, { backgroundColor: colors.error + '15' }]}>
                <AlertCircle size={18} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Date and Time Picker */}
            <DateTimePickerInput
              value={timestamp}
              onChange={(newTimestamp) => {
                setTimestamp(newTimestamp);
                setErrorMessage('');
              }}
              label={t('common.dateTime')}
              maximumDate={new Date()}
            />

            {/* Weight Input */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('growth.weight')} (kg) *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.surface, borderColor: colors.cardBorder },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.text }]}
                keyboardType="decimal-pad"
                placeholder="5.250"
                placeholderTextColor={colors.textMuted}
                value={weightText}
                onChangeText={(text) => {
                  setWeightText(text);
                  setErrorMessage('');
                }}
              />
              <Text style={[styles.unitText, { color: colors.textMuted }]}>kg</Text>
            </View>

            {/* Height Input */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('growth.height')} (cm) ({t('common.optional')})
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.surface, borderColor: colors.cardBorder },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.text }]}
                keyboardType="decimal-pad"
                placeholder="58.5"
                placeholderTextColor={colors.textMuted}
                value={heightText}
                onChangeText={(text) => {
                  setHeightText(text);
                  setErrorMessage('');
                }}
              />
              <Text style={[styles.unitText, { color: colors.textMuted }]}>cm</Text>
            </View>

            {/* Notes Input */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('common.notes')} ({t('common.optional')})
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                  color: colors.text,
                },
              ]}
              multiline
              numberOfLines={3}
              placeholder={t('growth.notesPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.cardBorder }]}
                onPress={closeGrowthModal}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingBottom: 16,
    gap: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  unitText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1.5,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
