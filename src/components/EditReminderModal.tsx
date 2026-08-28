import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useFeedingStore } from '../store/useFeedingStore';
import { useBabyStore } from '../store/useBabyStore';
import { DateTimePickerInput } from './DateTimePickerInput';
import { Bell, Sparkles, X, Trash2, Check } from 'lucide-react-native';

export function EditReminderModal() {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);
  const {
    activeReminder,
    isEditReminderModalOpen,
    closeEditReminderModal,
    updateActiveReminder,
    cancelActiveReminder,
  } = useFeedingStore();

  const [targetTime, setTargetTime] = useState<number>(Date.now() + 60 * 60 * 1000);
  const [alertMode, setAlertMode] = useState<'notification' | 'alarm'>('alarm');

  useEffect(() => {
    if (activeReminder && isEditReminderModalOpen) {
      setTargetTime(activeReminder.targetTime);
      setAlertMode((activeReminder.alertMode as 'notification' | 'alarm') || 'alarm');
    }
  }, [activeReminder, isEditReminderModalOpen]);

  if (!isEditReminderModalOpen || !activeReminder) return null;

  const handleSave = async () => {
    if (baby) {
      await updateActiveReminder(baby.id, baby.name, targetTime, alertMode);
    }
    closeEditReminderModal();
  };

  const handleDelete = async () => {
    if (baby) {
      await cancelActiveReminder(baby.id);
    }
    closeEditReminderModal();
  };

  return (
    <Modal
      visible={isEditReminderModalOpen}
      transparent
      animationType="slide"
      onRequestClose={closeEditReminderModal}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
              {alertMode === 'alarm' ? (
                <Sparkles size={22} color={colors.warning} />
              ) : (
                <Bell size={22} color={colors.primary} />
              )}
            </View>
            <TouchableOpacity onPress={closeEditReminderModal} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{t('alarms.editReminder')}</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Alert Mode Selector */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('alarms.alertMode')}</Text>
            <View
              style={[
                styles.modeSelector,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  alertMode === 'notification' && [styles.activeTab, { backgroundColor: colors.card }],
                ]}
                onPress={() => setAlertMode('notification')}
                activeOpacity={0.7}
              >
                <Bell
                  size={16}
                  color={alertMode === 'notification' ? colors.primaryLight : colors.textMuted}
                />
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

            {/* Target Time Picker with Presets */}
            <DateTimePickerInput
              value={targetTime}
              onChange={setTargetTime}
              label={t('common.dateTime')}
              showPresets={false}
            />

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.deleteButton, { borderColor: colors.danger + '40', backgroundColor: colors.danger + '10' }]}
                onPress={handleDelete}
              >
                <Trash2 size={18} color={colors.danger} />
                <Text style={[styles.deleteButtonText, { color: colors.danger }]}>
                  {t('alarms.cancelAlarm')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Check size={18} color="#FFF" />
                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingBottom: 4,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
