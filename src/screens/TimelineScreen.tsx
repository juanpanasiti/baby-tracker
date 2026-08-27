import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useBabyStore } from '../store/useBabyStore';
import { useFeedingStore } from '../store/useFeedingStore';
import { useDiaperStore } from '../store/useDiaperStore';
import { TimelineItem, type ActivityItem } from '../components/TimelineItem';
import { Clock } from 'lucide-react-native';

type FilterType = 'all' | 'feedings' | 'diapers';

export function TimelineScreen() {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);

  const { feedings, deleteFeeding, openEditFeedingModal } = useFeedingStore();
  const { diapers, deleteDiaper, openEditDiaperModal } = useDiaperStore();

  const [filter, setFilter] = useState<FilterType>('all');

  const allActivities: ActivityItem[] = [
    ...feedings.map((f) => ({ ...f, itemType: 'feeding' as const })),
    ...diapers.map((d) => ({ ...d, itemType: 'diaper' as const })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const filteredActivities = allActivities.filter((item) => {
    if (filter === 'feedings') return item.itemType === 'feeding';
    if (filter === 'diapers') return item.itemType === 'diaper';
    return true;
  });

  const filterTabs: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: allActivities.length },
    { key: 'feedings', label: t('feeding.title'), count: feedings.length },
    { key: 'diapers', label: t('diaper.title'), count: diapers.length },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filters */}
      <View style={styles.filtersRow}>
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
      </View>

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
              } else {
                openEditDiaperModal(item);
              }
            }}
            onDelete={() => {
              if (!baby) return;
              if (item.itemType === 'feeding') {
                deleteFeeding(baby.id, item.id);
              } else {
                deleteDiaper(baby.id, item.id);
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
