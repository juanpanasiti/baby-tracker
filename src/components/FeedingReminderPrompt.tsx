import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useFeedingStore } from '../store/useFeedingStore';
import { useBabyStore } from '../store/useBabyStore';
import { Bell, Clock, X } from 'lucide-react-native';

export function FeedingReminderPrompt() {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);
  const { isReminderPromptOpen, closeReminderPrompt, scheduleNextFeedingReminder } = useFeedingStore();

  if (!isReminderPromptOpen) return null;

  const intervals = [
    { label: t('feeding.in2Hours'), minutes: 120 },
    { label: t('feeding.in2HalfHours'), minutes: 150 },
    { label: t('feeding.in3Hours'), minutes: 180 },
    { label: t('feeding.in3HalfHours'), minutes: 210 },
    { label: t('feeding.in4Hours'), minutes: 240 },
  ];

  const handleSelect = async (minutes: number) => {
    if (baby) {
      await scheduleNextFeedingReminder(baby.id, baby.name, minutes);
    } else {
      closeReminderPrompt();
    }
  };

  return (
    <Modal visible={isReminderPromptOpen} transparent animationType="fade" onRequestClose={closeReminderPrompt}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
              <Bell size={24} color={colors.primary} />
            </View>
            <TouchableOpacity onPress={closeReminderPrompt} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{t('feeding.promptTitle')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('feeding.promptSubtitle')}</Text>

          {/* Options */}
          <View style={styles.optionsList}>
            {intervals.map((item) => (
              <TouchableOpacity
                key={item.minutes}
                style={[
                  styles.optionButton,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder },
                ]}
                onPress={() => handleSelect(item.minutes)}
              >
                <Clock size={18} color={colors.primaryLight} />
                <Text style={[styles.optionText, { color: colors.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
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
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
