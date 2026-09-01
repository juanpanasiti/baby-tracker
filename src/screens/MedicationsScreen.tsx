import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useBabyStore } from '../store/useBabyStore';
import { useMedicationStore } from '../store/useMedicationStore';
import { type Medication } from '../db/schema';
import {
  calculateNextMedicationDose,
  parseFixedTimes,
  parseSelectedDays,
} from '../utils/medicationSchedule';
import { formatTimeOnly, formatShortDate } from '../utils/date';
import {
  Pill,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Calendar as CalendarIcon,
  Bell,
  Sparkles,
  PauseCircle,
  PlayCircle,
  CheckCircle,
  Check,
} from 'lucide-react-native';

export function MedicationsScreen() {
  const { t, i18n } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);
  const {
    medications,
    openMedicationModal,
    openLogDoseModal,
    deleteMedication,
    toggleMedicationStatus,
  } = useMedicationStore();

  const [tab, setTab] = useState<'active' | 'archived'>('active');

  const activeMedications = medications.filter((m) => m.status === 'active');
  const archivedMedications = medications.filter((m) => m.status !== 'active');

  const displayedList = tab === 'active' ? activeMedications : archivedMedications;

  const confirmDelete = (item: Medication) => {
    Alert.alert(
      t('common.delete'),
      t('medications.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => baby && deleteMedication(baby.id, item.id),
        },
      ]
    );
  };

  const renderScheduleSummary = (item: Medication) => {
    if (item.scheduleType === 'fixed_times') {
      const times = parseFixedTimes(item.fixedTimesJson);
      const days = parseSelectedDays(item.selectedDaysJson);
      const isAllDays = days.length === 7;
      const daysText = isAllDays
        ? t('medications.allDays')
        : days.map((d) => t(`medications.days.${d}`)).join(', ');
      return `${times.join(', ')} (${daysText})`;
    } else {
      const hours = item.intervalHours || 8;
      return `${t('medications.interval')}: ${hours}h`;
    }
  };

  const renderItem = ({ item }: { item: Medication }) => {
    const nextDoseTime = calculateNextMedicationDose(item);
    const isAlarm = item.alertMode === 'alarm';

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.iconBg,
                { backgroundColor: item.status === 'active' ? colors.primary + '20' : colors.textMuted + '20' },
              ]}
            >
              <Pill size={20} color={item.status === 'active' ? colors.primary : colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={[styles.medName, { color: colors.text }]}>{item.name}</Text>
                {item.dosage ? (
                  <View style={[styles.dosageBadge, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.dosageBadgeText, { color: colors.textSecondary }]}>{item.dosage}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.scheduleSummary, { color: colors.textMuted }]}>
                {renderScheduleSummary(item)}
              </Text>
            </View>
          </View>

          {/* Action Icons */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => openMedicationModal(item)}
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
            >
              <Edit3 size={15} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => confirmDelete(item)}
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
            >
              <Trash2 size={15} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Dose Banner (If Active) */}
        {item.status === 'active' && (
          <View
            style={[
              styles.nextDoseBox,
              {
                backgroundColor: isAlarm ? colors.warning + '12' : colors.primary + '12',
                borderColor: isAlarm ? colors.warning + '40' : colors.primary + '40',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isAlarm ? (
                <Sparkles size={15} color={colors.warning} />
              ) : (
                <Bell size={15} color={colors.primary} />
              )}
              <Text style={[styles.nextDoseLabel, { color: isAlarm ? colors.warning : colors.primary }]}>
                {nextDoseTime
                  ? t('medications.nextDose', {
                      time: `${formatShortDate(nextDoseTime, i18n.language)} ${formatTimeOnly(nextDoseTime)}`,
                    })
                  : t('medications.noUpcomingDoses')}
              </Text>
            </View>
          </View>
        )}

        {/* Notes (If present) */}
        {item.notes ? (
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>
            {item.notes}
          </Text>
        ) : null}

        {/* Card Footer Actions */}
        <View style={[styles.cardFooter, { borderTopColor: colors.cardBorder }]}>
          {item.status === 'active' ? (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => openLogDoseModal(item)}
                activeOpacity={0.8}
              >
                <Check size={14} color="#FFF" />
                <Text style={styles.actionBtnTextPrimary}>{t('medications.takeDose')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryActionBtn, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}
                onPress={() => baby && toggleMedicationStatus(baby.id, baby.name, item.id, 'paused')}
              >
                <PauseCircle size={14} color={colors.textSecondary} />
                <Text style={[styles.actionBtnTextSecondary, { color: colors.textSecondary }]}>
                  {t('medications.paused')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => baby && toggleMedicationStatus(baby.id, baby.name, item.id, 'active')}
                activeOpacity={0.8}
              >
                <PlayCircle size={14} color="#FFF" />
                <Text style={styles.actionBtnTextPrimary}>{t('medications.resumeTreatment')}</Text>
              </TouchableOpacity>

              {item.status !== 'finished' && (
                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}
                  onPress={() => baby && toggleMedicationStatus(baby.id, baby.name, item.id, 'finished')}
                >
                  <CheckCircle size={14} color={colors.textMuted} />
                  <Text style={[styles.actionBtnTextSecondary, { color: colors.textMuted }]}>
                    {t('medications.finished')}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar with Add Button and Segmented Tabs */}
      <View style={styles.topBar}>
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabPill,
              tab === 'active'
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.surface },
            ]}
            onPress={() => setTab('active')}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === 'active' ? '#FFF' : colors.textSecondary },
              ]}
            >
              {t('medications.activeTreatments')} ({activeMedications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabPill,
              tab === 'archived'
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.surface },
            ]}
            onPress={() => setTab('archived')}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === 'archived' ? '#FFF' : colors.textSecondary },
              ]}
            >
              {t('medications.pausedTreatments')} ({archivedMedications.length})
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => openMedicationModal()}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={displayedList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.surface }]}>
              <Pill size={40} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('medications.emptyState')}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {t('medications.emptyStateDesc')}
            </Text>
            <TouchableOpacity
              style={[styles.emptyAddBtn, { backgroundColor: colors.primary }]}
              onPress={() => openMedicationModal()}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.emptyAddBtnText}>{t('medications.addTitle')}</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: {
    fontSize: 17,
    fontWeight: '700',
  },
  dosageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  dosageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleSummary: {
    fontSize: 12,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextDoseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  nextDoseLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  notesText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnTextPrimary: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnTextSecondary: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
