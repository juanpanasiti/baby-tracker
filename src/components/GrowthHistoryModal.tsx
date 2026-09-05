import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useGrowthStore } from '../store/useGrowthStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { useBabyStore } from '../store/useBabyStore';
import {
  calculateGrowthDeltas,
  formatWeight,
  formatHeight,
  formatWeightDelta,
  formatHeightDelta,
  type GrowthRecordWithDelta,
} from '../utils/growth';
import { formatDateOnly, formatRelativeTime } from '../utils/date';
import { X, Plus, Pencil, Trash2, Scale, TrendingUp, TrendingDown } from 'lucide-react-native';

export function GrowthHistoryModal() {
  const { t, i18n } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);
  const showGrowthGain = usePreferencesStore((state) => state.showGrowthGain);
  const {
    records,
    isHistoryModalOpen,
    closeHistoryModal,
    openGrowthModal,
    deleteGrowthRecord,
  } = useGrowthStore();

  const isSpanish = i18n.language.startsWith('es');
  const recordsWithDeltas = calculateGrowthDeltas(records);

  const handleDelete = (item: GrowthRecordWithDelta) => {
    if (!baby) return;
    Alert.alert(
      t('common.delete'),
      t('growth.confirmDelete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteGrowthRecord(baby.id, item.id),
        },
      ]
    );
  };

  const handleEdit = (item: GrowthRecordWithDelta) => {
    openGrowthModal(item);
  };

  const handleAddNew = () => {
    openGrowthModal(null);
  };

  return (
    <Modal
      visible={isHistoryModalOpen}
      transparent
      animationType="slide"
      onRequestClose={closeHistoryModal}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconCircle, { backgroundColor: colors.primary + '20' }]}>
                <Scale size={20} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('growth.historyTitle')}
              </Text>
            </View>
            <TouchableOpacity onPress={closeHistoryModal} style={styles.closeBtn}>
              <X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <Text style={[styles.countText, { color: colors.textSecondary }]}>
              {t('growth.recordsCount', { count: records.length })}
            </Text>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddNew}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFF" />
              <Text style={styles.addBtnText}>{t('growth.addMeasurement')}</Text>
            </TouchableOpacity>
          </View>

          {/* Measurements List */}
          <FlatList
            data={recordsWithDeltas}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface }]}>
                  <Scale size={36} color={colors.textMuted} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t('growth.emptyTitle')}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  {t('growth.emptySubtitle')}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const weightGain = item.delta ? item.delta.weightDiffGrams : null;
              const isGainPositive = weightGain !== null && weightGain > 0;
              const isGainNegative = weightGain !== null && weightGain < 0;

              return (
                <View
                  style={[
                    styles.card,
                    { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                  ]}
                >
                  {/* Card Header: Date, relative time, Actions */}
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={[styles.cardDate, { color: colors.text }]}>
                        {formatDateOnly(item.timestamp, i18n.language)}
                      </Text>
                      <Text style={[styles.cardRelativeTime, { color: colors.textSecondary }]}>
                        {formatRelativeTime(item.timestamp, isSpanish)}
                      </Text>
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        onPress={() => handleEdit(item)}
                        style={styles.actionBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Pencil size={16} color={colors.textMuted} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(item)}
                        style={styles.actionBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Trash2 size={16} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Metrics Row */}
                  <View style={styles.metricsRow}>
                    {/* Weight Metric */}
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                        {t('growth.weight')}
                      </Text>
                      <View style={styles.metricValueRow}>
                        <Text style={[styles.metricValue, { color: colors.text }]}>
                          {formatWeight(item.weightKg)}
                        </Text>
                        {showGrowthGain && item.delta && weightGain !== null && (
                          <View
                            style={[
                              styles.deltaBadge,
                              {
                                backgroundColor: isGainPositive
                                  ? '#10B98120'
                                  : isGainNegative
                                  ? (colors.error || '#EF4444') + '20'
                                  : colors.surfaceSubtle,
                              },
                            ]}
                          >
                            {isGainPositive ? (
                              <TrendingUp size={12} color="#10B981" />
                            ) : isGainNegative ? (
                              <TrendingDown size={12} color={colors.error || '#EF4444'} />
                            ) : null}
                            <Text
                              style={[
                                styles.deltaText,
                                {
                                  color: isGainPositive
                                    ? '#10B981'
                                    : isGainNegative
                                    ? colors.error || '#EF4444'
                                    : colors.textMuted,
                                },
                              ]}
                            >
                              {formatWeightDelta(weightGain)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Height Metric (if recorded) */}
                    {item.heightCm !== null && item.heightCm !== undefined ? (
                      <View style={styles.metricItem}>
                        <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                          {t('growth.height')}
                        </Text>
                        <View style={styles.metricValueRow}>
                          <Text style={[styles.metricValue, { color: colors.text }]}>
                            {formatHeight(item.heightCm)}
                          </Text>
                          {showGrowthGain &&
                            item.delta &&
                            item.delta.heightDiffCm !== null && (
                              <View
                                style={[
                                  styles.deltaBadge,
                                  {
                                    backgroundColor:
                                      item.delta.heightDiffCm > 0
                                        ? '#3B82F620'
                                        : colors.surfaceSubtle,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.deltaText,
                                    {
                                      color:
                                        item.delta.heightDiffCm > 0
                                          ? '#3B82F6'
                                          : colors.textMuted,
                                    },
                                  ]}
                                >
                                  {formatHeightDelta(item.delta.heightDiffCm)}
                                </Text>
                              </View>
                            )}
                        </View>
                      </View>
                    ) : null}
                  </View>

                  {/* Notes (if any) */}
                  {item.notes ? (
                    <Text style={[styles.cardNotes, { color: colors.textSecondary }]}>
                      {item.notes}
                    </Text>
                  ) : null}
                </View>
              );
            }}
          />
        </View>
      </View>
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
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
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 20,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 240,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardDate: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardRelativeTime: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  metricItem: {
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardNotes: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
