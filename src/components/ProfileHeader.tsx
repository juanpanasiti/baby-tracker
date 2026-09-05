import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useBabyStore } from '../store/useBabyStore';
import { useGrowthStore } from '../store/useGrowthStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { calculateBabyAge, formatRelativeTime } from '../utils/date';
import { formatWeight } from '../utils/growth';
import { Edit2, User, Sparkles, Scale, ChevronRight } from 'lucide-react-native';

export function ProfileHeader() {
  const { t, i18n } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const { baby, openProfileModal } = useBabyStore();
  const { latestRecord, openHistoryModal, openGrowthModal } = useGrowthStore();
  const showGrowthInProfile = usePreferencesStore((state) => state.showGrowthInProfile);
  const isSpanish = i18n.language.startsWith('es');

  if (!baby) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + '20' }]}>
            <Sparkles size={28} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('profile.createTitle')}</Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={openProfileModal}
          >
            <Text style={styles.createButtonText}>+ {t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { months, days, totalDays } = calculateBabyAge(baby.birthDate);
  const formattedAge =
    totalDays < 30
      ? t('profile.ageDaysOnly', { days: totalDays })
      : t('profile.age', { months, days });

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.row}>
        {/* Avatar */}
        <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
          {baby.photoUri ? (
            <Image source={{ uri: baby.photoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceSubtle }]}>
              <User size={32} color={colors.textSecondary} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {baby.name}
            </Text>
            <Text style={styles.genderEmoji}>{baby.sex === 'male' ? '👶' : '👧'}</Text>
          </View>
          <Text style={[styles.age, { color: colors.primaryLight }]}>{formattedAge}</Text>
        </View>

        {/* Edit button */}
        <TouchableOpacity
          onPress={openProfileModal}
          style={[styles.editButton, { backgroundColor: colors.surfaceSubtle }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Edit2 size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Growth Metric Pill */}
      {showGrowthInProfile && (
        <TouchableOpacity
          style={[styles.growthRow, { borderTopColor: colors.cardBorder }]}
          onPress={latestRecord ? openHistoryModal : () => openGrowthModal(null)}
          activeOpacity={0.7}
        >
          <View style={[styles.growthIconCircle, { backgroundColor: colors.primary + '18' }]}>
            <Scale size={14} color={colors.primary} />
          </View>
          {latestRecord ? (
            <View style={styles.growthTextContainer}>
              <Text style={[styles.growthValue, { color: colors.text }]}>
                {formatWeight(latestRecord.weightKg)}
              </Text>
              <Text style={[styles.growthDot, { color: colors.textMuted }]}>•</Text>
              <Text style={[styles.growthRecency, { color: colors.textSecondary }]}>
                {formatRelativeTime(latestRecord.timestamp, isSpanish)}
              </Text>
            </View>
          ) : (
            <Text style={[styles.growthEmptyText, { color: colors.textSecondary }]}>
              + {t('growth.logFirstMeasurement')}
            </Text>
          )}
          <ChevronRight size={14} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  genderEmoji: {
    fontSize: 16,
  },
  age: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 14,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 10,
    gap: 8,
  },
  growthIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  growthTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  growthValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  growthDot: {
    fontSize: 14,
  },
  growthRecency: {
    fontSize: 13,
    fontWeight: '500',
  },
  growthEmptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

