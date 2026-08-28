import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useBabyStore } from '../store/useBabyStore';
import { useFeedingStore } from '../store/useFeedingStore';
import { useDiaperStore } from '../store/useDiaperStore';
import { useAppointmentStore } from '../store/useAppointmentStore';
import { ProfileHeader } from '../components/ProfileHeader';
import { QuickActionButton } from '../components/QuickActionButton';
import { TimelineItem, type ActivityItem } from '../components/TimelineItem';
import { formatRelativeTime, formatTimeOnly, formatShortDate } from '../utils/date';
import {
  Milk,
  Heart,
  Calendar,
  Bell,
  Sparkles,
  X,
  Clock,
  ChevronRight,
  Edit3,
} from 'lucide-react-native';

interface DashboardScreenProps {
  onNavigateToTimeline: () => void;
  onNavigateToAppointments: () => void;
}

export function DashboardScreen({ onNavigateToTimeline, onNavigateToAppointments }: DashboardScreenProps) {
  const { t, i18n } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);

  const {
    latestFeeding,
    feedings,
    activeReminder,
    cancelActiveReminder,
    postponeActiveReminder,
    openEditReminderModal,
    openFeedingModal,
    openEditFeedingModal,
    isTimerRunning,
    timerSeconds,
    deleteFeeding,
    loadFeedings,
  } = useFeedingStore();

  const { latestDiaper, diapers, openDiaperModal, openEditDiaperModal, deleteDiaper, loadDiapers } = useDiaperStore();
  const { nextAppointment, openAppointmentModal, loadAppointments } = useAppointmentStore();

  const [refreshing, setRefreshing] = React.useState(false);
  const isSpanish = i18n.language === 'es';

  const onRefresh = async () => {
    if (!baby) return;
    setRefreshing(true);
    await Promise.all([loadFeedings(baby.id), loadDiapers(baby.id), loadAppointments(baby.id)]);
    setRefreshing(false);
  };

  // Combine top 3 recent activities
  const combinedActivities: ActivityItem[] = [
    ...feedings.slice(0, 5).map((f) => ({ ...f, itemType: 'feeding' as const })),
    ...diapers.slice(0, 5).map((d) => ({ ...d, itemType: 'diaper' as const })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);

  const formatTimerMinSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isAlarmMode = activeReminder?.alertMode === 'alarm';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Baby Profile Card */}
      <ProfileHeader />

      {/* Active Feeding Reminder Banner */}
      {activeReminder && activeReminder.isActive && activeReminder.targetTime > Date.now() && (
        <View
          style={[
            styles.alarmCard,
            {
              backgroundColor: isAlarmMode ? colors.warning + '12' : colors.primary + '12',
              borderColor: isAlarmMode ? colors.warning + '80' : colors.primary + '80',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.alarmTopRow}
            onPress={openEditReminderModal}
            activeOpacity={0.7}
          >
            <View style={styles.alarmLeft}>
              <View
                style={[
                  styles.alarmIconBg,
                  { backgroundColor: isAlarmMode ? colors.warning : colors.primary },
                ]}
              >
                {isAlarmMode ? <Sparkles size={18} color="#FFF" /> : <Bell size={18} color="#FFF" />}
              </View>
              <View style={styles.alarmTextContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    style={[
                      styles.alarmTitle,
                      { color: isAlarmMode ? colors.warning : colors.primaryLight },
                    ]}
                  >
                    {isAlarmMode
                      ? t('alarms.activeAlarm', { time: formatTimeOnly(activeReminder.targetTime) })
                      : t('alarms.activeNotification', { time: formatTimeOnly(activeReminder.targetTime) })}
                  </Text>
                </View>
                <Text style={[styles.alarmSubtitle, { color: colors.textSecondary }]}>
                  {t('feeding.lastFeeding')}: {latestFeeding ? formatRelativeTime(latestFeeding.timestamp, isSpanish) : '—'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.cancelAlarmBtn}
              onPress={() => baby && cancelActiveReminder(baby.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Quick Postpone & Edit Actions Footer */}
          <View style={[styles.alarmActionsRow, { borderTopColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[styles.quickPostponeBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => baby && postponeActiveReminder(baby.id, baby.name, 15)}
            >
              <Clock size={13} color={colors.primaryLight} />
              <Text style={[styles.quickPostponeText, { color: colors.text }]}>{t('alarms.postpone15')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickPostponeBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => baby && postponeActiveReminder(baby.id, baby.name, 30)}
            >
              <Clock size={13} color={colors.primaryLight} />
              <Text style={[styles.quickPostponeText, { color: colors.text }]}>{t('alarms.postpone30')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickPostponeBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder, flex: 1.2 }]}
              onPress={openEditReminderModal}
            >
              <Edit3 size={13} color={colors.primaryLight} />
              <Text style={[styles.quickPostponeText, { color: colors.primaryLight }]}>{t('common.edit')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Next Medical Appointment Banner */}
      {nextAppointment && nextAppointment.appointmentDate >= Date.now() && (
        <TouchableOpacity
          style={[styles.appointmentBanner, { backgroundColor: colors.appointment + '15', borderColor: colors.appointment }]}
          onPress={onNavigateToAppointments}
          activeOpacity={0.8}
        >
          <View style={[styles.appointmentIconBg, { backgroundColor: colors.appointment }]}>
            <Calendar size={18} color="#FFF" />
          </View>
          <View style={styles.appointmentInfo}>
            <Text style={[styles.appointmentTitle, { color: colors.text }]} numberOfLines={1}>
              {nextAppointment.title}
            </Text>
            <Text style={[styles.appointmentSub, { color: colors.textSecondary }]}>
              📅 {formatShortDate(nextAppointment.appointmentDate, i18n.language)} • {formatTimeOnly(nextAppointment.appointmentDate)}
              {nextAppointment.doctorName ? ` (${nextAppointment.doctorName})` : ''}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}

      {/* Quick Action Grid */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ 1-Tap Quick Log</Text>
      <View style={styles.quickGrid}>
        <View style={styles.gridRow}>
          <QuickActionButton
            label={t('feeding.bottle')}
            subLabel={latestFeeding?.type === 'bottle' ? `${latestFeeding.amountMl}ml • ${formatRelativeTime(latestFeeding.timestamp, isSpanish)}` : undefined}
            icon={<Milk size={26} color={colors.bottle} />}
            color={colors.bottle}
            onPress={() => openFeedingModal('bottle')}
          />
          <QuickActionButton
            label={isTimerRunning ? `🤱 ${formatTimerMinSec(timerSeconds)}` : t('feeding.breast')}
            subLabel={isTimerRunning ? 'Timer active' : latestFeeding?.type === 'breast' ? formatRelativeTime(latestFeeding.timestamp, isSpanish) : undefined}
            icon={<Heart size={26} color={colors.breastfeeding} />}
            color={colors.breastfeeding}
            onPress={() => openFeedingModal('breast')}
          />
        </View>

        <View style={styles.gridRow}>
          <QuickActionButton
            label={t('diaper.title')}
            subLabel={latestDiaper ? `${t(`diaper.${latestDiaper.type}`)} • ${formatRelativeTime(latestDiaper.timestamp, isSpanish)}` : undefined}
            icon={<Text style={{ fontSize: 24 }}>🧷</Text>}
            color={colors.pee}
            onPress={openDiaperModal}
          />
          <QuickActionButton
            label={t('appointments.addTitle')}
            subLabel={nextAppointment ? formatShortDate(nextAppointment.appointmentDate, i18n.language) : undefined}
            icon={<Calendar size={26} color={colors.appointment} />}
            color={colors.appointment}
            onPress={() => openAppointmentModal()}
          />
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.recentHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
          {t('nav.timeline')}
        </Text>
        <TouchableOpacity onPress={onNavigateToTimeline} style={styles.seeAllBtn}>
          <Text style={[styles.seeAllText, { color: colors.primaryLight }]}>See all</Text>
          <ChevronRight size={16} color={colors.primaryLight} />
        </TouchableOpacity>
      </View>

      {combinedActivities.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Clock size={36} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('common.emptyState')}</Text>
        </View>
      ) : (
        combinedActivities.map((act) => (
          <TimelineItem
            key={`${act.itemType}-${act.id}`}
            item={act}
            onEdit={() => {
              if (act.itemType === 'feeding') {
                openEditFeedingModal(act);
              } else {
                openEditDiaperModal(act);
              }
            }}
            onDelete={() => {
              if (!baby) return;
              if (act.itemType === 'feeding') {
                deleteFeeding(baby.id, act.id);
              } else {
                deleteDiaper(baby.id, act.id);
              }
            }}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  alarmCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 14,
    overflow: 'hidden',
  },
  alarmTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  alarmLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  alarmIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmTextContainer: {
    flex: 1,
  },
  alarmTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  alarmSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelAlarmBtn: {
    padding: 6,
  },
  alarmActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  quickPostponeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  quickPostponeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
    gap: 12,
  },
  appointmentIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  appointmentSub: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickGrid: {
    gap: 12,
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
