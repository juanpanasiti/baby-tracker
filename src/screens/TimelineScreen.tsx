import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useBabyStore } from '../store/useBabyStore';
import { useFeedingStore } from '../store/useFeedingStore';
import { useDiaperStore } from '../store/useDiaperStore';
import { useMedicationStore } from '../store/useMedicationStore';
import { useGrowthStore } from '../store/useGrowthStore';
import { TimelineItem, type ActivityItem } from '../components/TimelineItem';
import { Clock } from 'lucide-react-native';

type FilterType = 'all' | 'feedings' | 'diapers' | 'medications' | 'growth';

export function TimelineScreen() {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);

  const { feedings, deleteFeeding, openEditFeedingModal } = useFeedingStore();
  const { diapers, deleteDiaper, openEditDiaperModal } = useDiaperStore();
  const { medicationLogs, deleteMedicationLog } = useMedicationStore();
  const { records: growthRecords, deleteGrowthRecord, openGrowthModal } = useGrowthStore();

  const [filter, setFilter] = useState<FilterType>('all');

  const allActivities: ActivityItem[] = [
    ...feedings.map((f) => ({ ...f, itemType: 'feeding' as const })),
    ...diapers.map((d) => ({ ...d, itemType: 'diaper' as const })),
    ...medicationLogs.map((m) => ({ ...m, itemType: 'medication' as const })),
    ...growthRecords.map((g) => ({ ...g, itemType: 'growth' as const })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const filteredActivities = allActivities.filter((item) => {
    if (filter === 'feedings') return item.itemType === 'feeding';
    if (filter === 'diapers') return item.itemType === 'diaper';
    if (filter === 'medications') return item.itemType === 'medication';
    if (filter === 'growth') return item.itemType === 'growth';
    return true;
  });

  const filterTabs: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: t('timeline.filters.all', { defaultValue: 'All' }), count: allActivities.length },
    { key: 'feedings', label: t('timeline.filters.feedings', { defaultValue: 'Feedings' }), count: feedings.length },
    { key: 'diapers', label: t('timeline.filters.diapers', { defaultValue: 'Diapers' }), count: diapers.length },
    { key: 'medications', label: t('timeline.filters.medications', { defaultValue: 'Medications' }), count: medicationLogs.length },
    { key: 'growth', label: t('timeline.filters.growth', { defaultValue: 'Growth' }), count: growthRecords.length },
  ];


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersScrollView}
      >
        {filterTabs.map((tab) => {
          const isActive = filter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : colors.cardBorder,
                },
              ]}
              onPress={() => setFilter(tab.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: isActive ? '#FFF' : colors.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Activities List */}
      <FlatList
        data={filteredActivities}
        keyExtractor={(item) => `${item.itemType}-${item.id}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Clock size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('common.emptyState')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TimelineItem
            item={item}
            onEdit={() => {
              if (item.itemType === 'feeding') {
                openEditFeedingModal(item);
              } else if (item.itemType === 'diaper') {
                openEditDiaperModal(item);
              } else if (item.itemType === 'growth') {
                openGrowthModal(item);
              }
            }}
            onDelete={() => {
              if (!baby) return;
              if (item.itemType === 'feeding') {
                deleteFeeding(baby.id, item.id);
              } else if (item.itemType === 'diaper') {
                deleteDiaper(baby.id, item.id);
              } else if (item.itemType === 'medication') {
                deleteMedicationLog(baby.id, item.id);
              } else if (item.itemType === 'growth') {
                deleteGrowthRecord(baby.id, item.id);
              }
            }}
          />

        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersScrollView: {
    flexGrow: 0,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 32,
  },
  emptyContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
