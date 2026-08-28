import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useFeedingStore } from '../store/useFeedingStore';
import { useBabyStore } from '../store/useBabyStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { Bell, Clock, X, Volume2, Calendar, Sparkles } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { formatTimeOnly } from '../utils/date';

export function FeedingReminderPrompt() {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);
  const {
    isReminderPromptOpen,
    closeReminderPrompt,
    scheduleNextFeedingReminder,
    savedFeedingTimestamp,
  } = useFeedingStore();
  const { smartNightMode, isNightTime } = usePreferencesStore();

  const [alertMode, setAlertMode] = useState<'notification' | 'alarm'>('alarm');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customTime, setCustomTime] = useState<Date>(new Date(Date.now() + 180 * 60 * 1000));
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

  const baseTime = savedFeedingTimestamp || Date.now();

  useEffect(() => {
    if (isReminderPromptOpen) {
      // Default to in 3 hours
      const targetIn3Hours = baseTime + 180 * 60 * 1000;
      setCustomTime(new Date(targetIn3Hours));
      setShowCustomPicker(false);

      if (smartNightMode) {
        // If smart mode is enabled, preselect alarm if target is at night
        const night = isNightTime(targetIn3Hours);
        setAlertMode(night ? 'alarm' : 'notification');
      } else {
        setAlertMode('alarm');
      }
    }
  }, [isReminderPromptOpen, smartNightMode, baseTime]);

  if (!isReminderPromptOpen) return null;

  const intervals = [
    { label: t('feeding.in2Hours'), minutes: 120, time: baseTime + 120 * 60 * 1000 },
    { label: t('feeding.in2HalfHours'), minutes: 150, time: baseTime + 150 * 60 * 1000 },
    { label: t('feeding.in3Hours'), minutes: 180, time: baseTime + 180 * 60 * 1000 },
    { label: t('feeding.in3HalfHours'), minutes: 210, time: baseTime + 210 * 60 * 1000 },
    { label: t('feeding.in4Hours'), minutes: 240, time: baseTime + 240 * 60 * 1000 },
  ];

  const handleSelectInterval = async (minutes: number) => {
    if (baby) {
      await scheduleNextFeedingReminder(baby.id, baby.name, minutes, { alertMode });
    } else {
      closeReminderPrompt();
    }
  };

  const handleConfirmCustom = async () => {
    if (baby) {
      await scheduleNextFeedingReminder(baby.id, baby.name, customTime.getTime(), {
        alertMode,
        isExactTimestamp: true,
      });
    } else {
      closeReminderPrompt();
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setIsTimePickerVisible(false);
    }
    if (selectedDate) {
      setCustomTime(selectedDate);
    }
  };

  return (
    <Modal visible={isReminderPromptOpen} transparent animationType="fade" onRequestClose={closeReminderPrompt}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
              {alertMode === 'alarm' ? (
                <Bell size={24} color={colors.primary} />
              ) : (
                <Volume2 size={24} color={colors.primary} />
              )}
            </View>
            <TouchableOpacity onPress={closeReminderPrompt} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{t('feeding.promptTitle')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('feeding.promptSubtitle')}</Text>

          {/* Alert Mode Selector (Notification vs Loud Alarm) */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('alarms.alertMode')}</Text>
          <View style={[styles.modeSelector, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[
                styles.modeTab,
                alertMode === 'notification' && [styles.activeTab, { backgroundColor: colors.card }],
              ]}
              onPress={() => setAlertMode('notification')}
              activeOpacity={0.7}
            >
              <Bell size={16} color={alertMode === 'notification' ? colors.primaryLight : colors.textMuted} />
              <View style={{ marginLeft: 6 }}>
                <Text
                  style={[
                    styles.modeTabText,
                    {
                      color: alertMode === 'notification' ? colors.primaryLight : colors.textMuted,
                      fontWeight: alertMode === 'notification' ? '700' : '500',
                    },
                  ]}
                >
                  {t('alarms.notificationMode')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeTab,
                alertMode === 'alarm' && [styles.activeTab, { backgroundColor: colors.card }],
              ]}
              onPress={() => setAlertMode('alarm')}
              activeOpacity={0.7}
            >
              <Sparkles size={16} color={alertMode === 'alarm' ? colors.warning : colors.textMuted} />
              <View style={{ marginLeft: 6 }}>
                <Text
                  style={[
                    styles.modeTabText,
                    {
                      color: alertMode === 'alarm' ? colors.warning : colors.textMuted,
                      fontWeight: alertMode === 'alarm' ? '700' : '500',
                    },
                  ]}
                >
                  {t('alarms.alarmMode')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Preset Options */}
          {!showCustomPicker ? (
            <View style={styles.optionsList}>
              {intervals.map((item) => (
                <TouchableOpacity
                  key={item.minutes}
                  style={[
                    styles.optionButton,
                    { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder },
                  ]}
                  onPress={() => handleSelectInterval(item.minutes)}
                >
                  <Clock size={18} color={colors.primaryLight} />
                  <Text style={[styles.optionText, { color: colors.text, flex: 1 }]}>{item.label}</Text>
                  <Text style={[styles.timeBadge, { color: colors.textSecondary }]}>
                    {formatTimeOnly(item.time)}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Custom exact time button */}
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder, borderStyle: 'dashed' },
                ]}
                onPress={() => setShowCustomPicker(true)}
              >
                <Calendar size={18} color={colors.primaryLight} />
                <Text style={[styles.optionText, { color: colors.primaryLight }]}>
                  {t('alarms.selectExactTime')}...
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.customSection}>
              <TouchableOpacity
                style={[styles.customTimeButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.primary }]}
                onPress={() => setIsTimePickerVisible(true)}
              >
                <Clock size={22} color={colors.primary} />
                <Text style={[styles.customTimeText, { color: colors.text }]}>
                  {formatTimeOnly(customTime.getTime())}
                </Text>
              </TouchableOpacity>

              {isTimePickerVisible && (
                <DateTimePicker
                  value={customTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onTimeChange}
                />
              )}

              <View style={styles.customActionRow}>
                <TouchableOpacity
                  style={[styles.backBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => setShowCustomPicker(false)}
                >
                  <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                  onPress={handleConfirmCustom}
                >
                  <Text style={styles.confirmBtnText}>{t('common.confirm')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={closeReminderPrompt}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>{t('common.skip')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modeSelector: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 13,
  },
  optionsList: {
    gap: 8,
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  timeBadge: {
    fontSize: 13,
    fontWeight: '500',
  },
  customSection: {
    marginVertical: 8,
    gap: 12,
  },
  customTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  customTimeText: {
    fontSize: 22,
    fontWeight: '700',
  },
  customActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
