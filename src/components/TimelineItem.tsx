import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { type Feeding, type Diaper, type MedicationLog, type GrowthRecord } from '../db/schema';
import { formatRelativeTime, formatTimeOnly } from '../utils/date';
import { formatWeight, formatHeight } from '../utils/growth';
import { Trash2, Milk, Heart, AlertTriangle, Pencil, Pill, Scale } from 'lucide-react-native';

export type ActivityItem =
  | ({ itemType: 'feeding' } & Feeding)
  | ({ itemType: 'diaper' } & Diaper)
  | ({ itemType: 'medication' } & MedicationLog)
  | ({ itemType: 'growth' } & GrowthRecord);


interface TimelineItemProps {
  item: ActivityItem;
  onEdit?: () => void;
  onDelete: () => void;
}

export function TimelineItem({ item, onEdit, onDelete }: TimelineItemProps) {
  const { t, i18n } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const isSpanish = i18n.language === 'es';

  const confirmDelete = () => {
    Alert.alert(
      t('common.delete'),
      t('common.confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: onDelete },
      ]
    );
  };

  if (item.itemType === 'growth') {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.headerRow}>
          <View style={styles.leftTitleRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
              <Scale size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('growth.title')}
              </Text>
              <Text style={[styles.timeText, { color: colors.textMuted }]}>
                {formatTimeOnly(item.timestamp)} • {formatRelativeTime(item.timestamp, isSpanish)}
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
                <Pencil size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
              <Trash2 size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.badgeText, { color: colors.primaryLight }]}>
              ⚖️ {formatWeight(item.weightKg)}
            </Text>
          </View>

          {item.heightCm !== null && item.heightCm !== undefined ? (
            <View style={[styles.badge, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.badgeText, { color: colors.primaryLight }]}>
                📏 {formatHeight(item.heightCm)}
              </Text>
            </View>
          ) : null}
        </View>

        {item.notes ? (
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>"{item.notes}"</Text>
        ) : null}
      </View>
    );
  }

  if (item.itemType === 'medication') {

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.headerRow}>
          <View style={styles.leftTitleRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#10B98120' }]}>
              <Pill size={20} color="#10B981" />
            </View>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                {item.medicationName}
              </Text>
              <Text style={[styles.timeText, { color: colors.textMuted }]}>
                {formatTimeOnly(item.timestamp)} • {formatRelativeTime(item.timestamp, isSpanish)}
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
              <Trash2 size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Badges */}
        {item.dosage ? (
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.badgeText, { color: '#10B981' }]}>
                💊 {item.dosage}
              </Text>
            </View>
          </View>
        ) : null}

        {item.notes ? (
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>"{item.notes}"</Text>
        ) : null}
      </View>
    );
  }

  if (item.itemType === 'feeding') {
    const isBreast = item.type === 'breast';
    const accentColor = isBreast ? colors.breastfeeding : colors.bottle;
    const durationMins = item.durationSeconds ? Math.round(item.durationSeconds / 60) : 0;

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.headerRow}>
          <View style={styles.leftTitleRow}>
            <View style={[styles.iconCircle, { backgroundColor: accentColor + '20' }]}>
              {isBreast ? <Heart size={20} color={accentColor} /> : <Milk size={20} color={accentColor} />}
            </View>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                {isBreast ? t('feeding.breast') : t('feeding.bottle')}
              </Text>
              <Text style={[styles.timeText, { color: colors.textMuted }]}>
                {formatTimeOnly(item.timestamp)} • {formatRelativeTime(item.timestamp, isSpanish)}
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
              <Pencil size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
              <Trash2 size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Badges / Metrics */}
        <View style={styles.badgesRow}>
          {isBreast ? (
            <>
              {item.breastSide && (
                <View style={[styles.badge, { backgroundColor: colors.surfaceSubtle }]}>
                  <Text style={[styles.badgeText, { color: accentColor }]}>
                    {t(`feeding.${item.breastSide}`)}
                  </Text>
                </View>
              )}
              {durationMins > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.surfaceSubtle }]}>
                  <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                    ⏱️ {t('common.minutes', { count: durationMins })}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={[styles.badge, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.badgeText, { color: accentColor }]}>
                🍼 {item.amountMl ?? 0} ml
              </Text>
            </View>
          )}
        </View>

        {item.notes ? (
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>"{item.notes}"</Text>
        ) : null}
      </View>
    );
  }

  // Diaper Item
  const isPee = item.type === 'pee';
  const isPoop = item.type === 'poop';
  const accentColor = isPee ? colors.pee : isPoop ? colors.poop : colors.bothDiaper;
  const emoji = isPee ? '💧' : isPoop ? '💩' : '💧💩';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.headerRow}>
        <View style={styles.leftTitleRow}>
          <View style={[styles.iconCircle, { backgroundColor: accentColor + '20' }]}>
            <Text style={styles.emojiIcon}>{emoji}</Text>
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              {t(`diaper.${item.type}`)}
            </Text>
            <Text style={[styles.timeText, { color: colors.textMuted }]}>
              {formatTimeOnly(item.timestamp)} • {formatRelativeTime(item.timestamp, isSpanish)}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
            <Pencil size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
            <Trash2 size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Badges / Metrics */}
      <View style={styles.badgesRow}>
        <View style={[styles.badge, { backgroundColor: colors.surfaceSubtle }]}>
          <Text style={[styles.badgeText, { color: accentColor }]}>
            {t(`diaper.${item.type}`)}
          </Text>
        </View>

        {item.hasRash ? (
          <View style={[styles.badge, { backgroundColor: colors.danger + '20' }]}>
            <AlertTriangle size={14} color={colors.danger} />
            <Text style={[styles.badgeText, { color: colors.danger }]}>
              {t('diaper.hasRash')}
            </Text>
          </View>
        ) : null}
      </View>

      {item.notes ? (
        <Text style={[styles.notesText, { color: colors.textSecondary }]}>"{item.notes}"</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 13,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 20,
  },
});
