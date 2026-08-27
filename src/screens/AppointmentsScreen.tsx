import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useBabyStore } from '../store/useBabyStore';
import { useAppointmentStore } from '../store/useAppointmentStore';
import { type Appointment } from '../db/schema';
import { formatShortDate, formatTimeOnly } from '../utils/date';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  MapPin,
  FileText,
  User,
  CheckCircle,
} from 'lucide-react-native';

export function AppointmentsScreen() {
  const { t, i18n } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);
  const { appointments, openAppointmentModal, deleteAppointment } = useAppointmentStore();

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const now = Date.now();

  const upcomingAppointments = appointments.filter((a) => a.appointmentDate >= now);
  const pastAppointments = appointments.filter((a) => a.appointmentDate < now);

  const displayedList = tab === 'upcoming' ? upcomingAppointments : pastAppointments;

  const confirmDelete = (item: Appointment) => {
    Alert.alert(
      t('common.delete'),
      t('common.confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => baby && deleteAppointment(baby.id, item.id),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Add Button */}
      <View style={styles.topBar}>
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabPill,
              tab === 'upcoming'
                ? { backgroundColor: colors.appointment }
                : { backgroundColor: colors.surface },
            ]}
            onPress={() => setTab('upcoming')}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === 'upcoming' ? '#FFF' : colors.textSecondary },
              ]}
            >
              {t('appointments.upcoming')} ({upcomingAppointments.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabPill,
              tab === 'past'
                ? { backgroundColor: colors.appointment }
                : { backgroundColor: colors.surface },
            ]}
            onPress={() => setTab('past')}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === 'past' ? '#FFF' : colors.textSecondary },
              ]}
            >
              {t('appointments.past')} ({pastAppointments.length})
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.appointment }]}
          onPress={() => openAppointmentModal()}
        >
          <Plus size={18} color="#FFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <FlatList
        data={displayedList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <CalendarIcon size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('common.emptyState')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View style={[styles.dateBadge, { backgroundColor: colors.appointment + '20' }]}>
                  <Text style={[styles.dateBadgeDay, { color: colors.appointment }]}>
                    {new Date(item.appointmentDate).getDate()}
                  </Text>
                  <Text style={[styles.dateBadgeMonth, { color: colors.appointment }]}>
                    {formatShortDate(item.appointmentDate, i18n.language).split(' ')[0]}
                  </Text>
                </View>

                <View style={styles.titleInfo}>
                  <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.timeText, { color: colors.primaryLight }]}>
                    ⏰ {formatTimeOnly(item.appointmentDate)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteBtn}>
                <Trash2 size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Doctor and Specialty */}
            {item.doctorName || item.specialty ? (
              <View style={styles.detailRow}>
                <User size={15} color={colors.textMuted} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {item.doctorName} {item.specialty ? `• ${item.specialty}` : ''}
                </Text>
              </View>
            ) : null}

            {/* Location */}
            {item.location ? (
              <View style={styles.detailRow}>
                <MapPin size={15} color={colors.textMuted} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {item.location}
                </Text>
              </View>
            ) : null}

            {/* Notes */}
            {item.notes ? (
              <View style={styles.detailRow}>
                <FileText size={15} color={colors.textMuted} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  "{item.notes}"
                </Text>
              </View>
            ) : null}

            {/* Badges (Calendar sync & Reminders) */}
            <View style={styles.badgesRow}>
              {item.calendarEventId ? (
                <View style={[styles.badge, { backgroundColor: colors.success + '15' }]}>
                  <CheckCircle size={12} color={colors.success} />
                  <Text style={[styles.badgeText, { color: colors.success }]}>
                    {t('appointments.calendarAdded')}
                  </Text>
                </View>
              ) : null}

              {item.reminderNotificationId ? (
                <View style={[styles.badge, { backgroundColor: colors.appointment + '15' }]}>
                  <Text style={[styles.badgeText, { color: colors.appointment }]}>
                    🔔 Reminder active
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
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
    paddingVertical: 12,
  },
  tabsRow: {
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
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dateBadge: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadgeDay: {
    fontSize: 16,
    fontWeight: '800',
  },
  dateBadgeMonth: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  titleInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
