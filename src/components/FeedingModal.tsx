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
import { useFeedingStore } from '../store/useFeedingStore';
import { useBabyStore } from '../store/useBabyStore';
import { X, Check, Play, Pause, RotateCcw, Milk, Heart } from 'lucide-react-native';
import { DateTimePickerInput } from './DateTimePickerInput';

export function FeedingModal() {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);
  const {
    isFeedingModalOpen,
    editingFeeding,
    closeFeedingModal,
    createFeeding,
    updateFeeding,
    timerSide,
    timerSeconds,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    tickTimer,
  } = useFeedingStore();

  const [feedingType, setFeedingType] = useState<'breast' | 'bottle'>('breast');
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | 'both'>('left');
  const [manualDurationMins, setManualDurationMins] = useState('15');
  const [amountMl, setAmountMl] = useState('120');
  const [timestamp, setTimestamp] = useState(Date.now());
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Setup timer ticker effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, tickTimer]);

  useEffect(() => {
    if (timerSide) {
      setSelectedSide(timerSide);
    }
  }, [timerSide]);

  // Synchronize modal state when opened or when editing item changes
  useEffect(() => {
    if (isFeedingModalOpen) {
      if (editingFeeding) {
        setFeedingType(editingFeeding.type);
        if (editingFeeding.type === 'breast') {
          setSelectedSide(editingFeeding.breastSide || 'left');
          setManualDurationMins(
            editingFeeding.durationSeconds
              ? Math.max(1, Math.round(editingFeeding.durationSeconds / 60)).toString()
              : '15'
          );
        } else {
          setAmountMl(editingFeeding.amountMl ? editingFeeding.amountMl.toString() : '120');
        }
        setTimestamp(editingFeeding.timestamp);
        setNotes(editingFeeding.notes || '');
        setErrorMsg('');
        resetTimer();
      } else {
        setFeedingType('breast');
        setSelectedSide('left');
        setManualDurationMins('15');
        setAmountMl('120');
        setTimestamp(Date.now());
        setNotes('');
        setErrorMsg('');
      }
    }
  }, [isFeedingModalOpen, editingFeeding, resetTimer]);

  const formatTimerDisplay = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!baby) return;

    if (feedingType === 'bottle') {
      const ml = parseInt(amountMl, 10);
      if (isNaN(ml) || ml <= 0) {
        setErrorMsg('Please enter a valid amount in ml');
        return;
      }

      if (editingFeeding) {
        await updateFeeding(baby.id, editingFeeding.id, {
          type: 'bottle',
          amountMl: ml,
          breastSide: null,
          durationSeconds: null,
          notes: notes.trim() || null,
          timestamp,
        });
      } else {
        await createFeeding(baby.id, {
          type: 'bottle',
          amountMl: ml,
          notes: notes.trim() || null,
          timestamp,
        });
      }
    } else {
      // Breastfeeding
      let durationSec = timerSeconds;
      if (durationSec <= 0) {
        const parsedMins = parseInt(manualDurationMins, 10);
        durationSec = (!isNaN(parsedMins) && parsedMins > 0 ? parsedMins : 15) * 60;
      }

      if (editingFeeding) {
        await updateFeeding(baby.id, editingFeeding.id, {
          type: 'breast',
          breastSide: selectedSide,
          durationSeconds: durationSec,
          amountMl: null,
          notes: notes.trim() || null,
          timestamp,
        });
      } else {
        await createFeeding(baby.id, {
          type: 'breast',
          breastSide: selectedSide,
          durationSeconds: durationSec,
          notes: notes.trim() || null,
          timestamp,
        });
      }
    }
  };

  const bottlePresets = [60, 90, 120, 150, 180, 210, 240];

  return (
    <Modal visible={isFeedingModalOpen} transparent animationType="slide" onRequestClose={closeFeedingModal}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {editingFeeding ? t('feeding.editTitle') : t('feeding.title')}
            </Text>
            <TouchableOpacity onPress={closeFeedingModal} style={styles.closeBtn}>
              <X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Feeding Type Selector */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  feedingType === 'breast'
                    ? { backgroundColor: colors.breastfeeding }
                    : { backgroundColor: colors.surfaceSubtle },
                ]}
                onPress={() => setFeedingType('breast')}
              >
                <Heart size={20} color={feedingType === 'breast' ? '#FFF' : colors.textSecondary} />
                <Text
                  style={[
                    styles.typeText,
                    { color: feedingType === 'breast' ? '#FFF' : colors.textSecondary },
                  ]}
                >
                  {t('feeding.breast')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  feedingType === 'bottle'
                    ? { backgroundColor: colors.bottle }
                    : { backgroundColor: colors.surfaceSubtle },
                ]}
                onPress={() => setFeedingType('bottle')}
              >
                <Milk size={20} color={feedingType === 'bottle' ? '#FFF' : colors.textSecondary} />
                <Text
                  style={[
                    styles.typeText,
                    { color: feedingType === 'bottle' ? '#FFF' : colors.textSecondary },
                  ]}
                >
                  {t('feeding.bottle')}
                </Text>
              </TouchableOpacity>
            </View>

            {errorMsg ? (
              <View style={[styles.errorBox, { backgroundColor: colors.danger + '20' }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Breastfeeding Content */}
            {feedingType === 'breast' ? (
              <View style={styles.section}>
                {/* Breast Side Buttons */}
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('feeding.breastSide')}</Text>
                <View style={styles.sideRow}>
                  {(['left', 'right', 'both'] as const).map((side) => (
                    <TouchableOpacity
                      key={side}
                      style={[
                        styles.sideButton,
                        selectedSide === side
                          ? { backgroundColor: colors.breastfeeding }
                          : { backgroundColor: colors.surfaceSubtle },
                      ]}
                      onPress={() => {
                        setSelectedSide(side);
                        if (isTimerRunning) {
                          startTimer(side);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.sideText,
                          { color: selectedSide === side ? '#FFF' : colors.textSecondary },
                        ]}
                      >
                        {t(`feeding.${side}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Live Nursing Timer */}
                <View style={[styles.timerCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.timerLabel, { color: colors.textMuted }]}>{t('feeding.timer')}</Text>
                  <Text style={[styles.timerValue, { color: colors.text }]}>
                    {formatTimerDisplay(timerSeconds)}
                  </Text>

                  <View style={styles.timerControls}>
                    {!isTimerRunning && timerSeconds === 0 ? (
                      <TouchableOpacity
                        style={[styles.timerActionBtn, { backgroundColor: colors.timerActive }]}
                        onPress={() => startTimer(selectedSide)}
                      >
                        <Play size={18} color="#FFF" />
                        <Text style={styles.timerActionText}>{t('feeding.start')}</Text>
                      </TouchableOpacity>
                    ) : isTimerRunning ? (
                      <TouchableOpacity
                        style={[styles.timerActionBtn, { backgroundColor: colors.warning }]}
                        onPress={pauseTimer}
                      >
                        <Pause size={18} color="#FFF" />
                        <Text style={styles.timerActionText}>{t('feeding.pause')}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.timerActionBtn, { backgroundColor: colors.timerActive }]}
                        onPress={resumeTimer}
                      >
                        <Play size={18} color="#FFF" />
                        <Text style={styles.timerActionText}>{t('feeding.resume')}</Text>
                      </TouchableOpacity>
                    )}

                    {timerSeconds > 0 && (
                      <TouchableOpacity
                        style={[styles.timerResetBtn, { backgroundColor: colors.danger + '20' }]}
                        onPress={resetTimer}
                      >
                        <RotateCcw size={18} color={colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Manual duration fallback if timer is not used */}
                {timerSeconds === 0 && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      {t('feeding.duration')}
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: colors.surfaceSubtle,
                          color: colors.text,
                          borderColor: colors.cardBorder,
                        },
                      ]}
                      keyboardType="number-pad"
                      value={manualDurationMins}
                      onChangeText={setManualDurationMins}
                      placeholder="15"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                )}
              </View>
            ) : (
              /* Bottle Feeding Content */
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('feeding.amount')}</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      color: colors.text,
                      borderColor: colors.cardBorder,
                      marginBottom: 12,
                    },
                  ]}
                  keyboardType="number-pad"
                  value={amountMl}
                  onChangeText={setAmountMl}
                  placeholder={t('feeding.amountPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                />

                {/* Presets */}
                <View style={styles.presetsRow}>
                  {bottlePresets.map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={[
                        styles.presetPill,
                        amountMl === preset.toString()
                          ? { backgroundColor: colors.bottle }
                          : { backgroundColor: colors.surfaceSubtle },
                      ]}
                      onPress={() => setAmountMl(preset.toString())}
                    >
                      <Text
                        style={[
                          styles.presetText,
                          { color: amountMl === preset.toString() ? '#FFF' : colors.textSecondary },
                        ]}
                      >
                        {preset}ml
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Date & Time */}
            <DateTimePickerInput
              value={timestamp}
              onChange={setTimestamp}
            />

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('common.notes')} ({t('common.optional')})
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder="e.g., Latched well, fell asleep afterwards"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: feedingType === 'breast' ? colors.breastfeeding : colors.bottle },
              ]}
              onPress={handleSave}
            >
              <Check size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingBottom: 24,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sideRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  sideButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  timerLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerValue: {
    fontSize: 40,
    fontWeight: '800',
    marginVertical: 8,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  timerActionText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  timerResetBtn: {
    padding: 10,
    borderRadius: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
