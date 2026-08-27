import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useAppointmentStore } from '../store/useAppointmentStore';
import { useBabyStore } from '../store/useBabyStore';
import { X, Check, Calendar as CalendarIcon, Clock, Bell, MapPin } from 'lucide-react-native';

export function AppointmentModal() {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);
  const { isAppointmentModalOpen, closeAppointmentModal, createAppointment } = useAppointmentStore();

  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Date and Time inputs
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [day, setDay] = useState(tomorrow.getDate().toString().padStart(2, '0'));
  const [month, setMonth] = useState((tomorrow.getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(tomorrow.getFullYear().toString());
  const [hours, setHours] = useState('10');
  const [minutes, setMinutes] = useState('00');

  // Sync and Reminder toggles
  const [syncToCalendar, setSyncToCalendar] = useState(true);
  const [remind24h, setRemind24h] = useState(true);
  const [remind2h, setRemind2h] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    if (!baby) return;
    if (!title.trim()) {
      setErrorMsg(t('common.required') + ': ' + t('appointments.appointmentTitle'));
      return;
    }

    const d = parseInt(day, 10);
    const m = parseInt(month, 10) - 1;
    const y = parseInt(year, 10);
    const hr = parseInt(hours, 10);
    const min = parseInt(minutes, 10);

    if (isNaN(d) || isNaN(m) || isNaN(y) || isNaN(hr) || isNaN(min)) {
      setErrorMsg('Invalid date or time');
      return;
    }

    const appointmentDate = new Date(y, m, d, hr, min).getTime();

    try {
      await createAppointment(baby.id, {
        title: title.trim(),
        doctorName: doctorName.trim() || null,
        specialty: specialty.trim() || null,
        appointmentDate,
        location: location.trim() || null,
        notes: notes.trim() || null,
        syncToCalendar,
        remind24h,
        remind2h,
      });

      // Reset
      setTitle('');
      setDoctorName('');
      setSpecialty('');
      setLocation('');
      setNotes('');
      setErrorMsg('');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Error saving appointment');
    }
  };

  return (
    <Modal visible={isAppointmentModalOpen} transparent animationType="slide" onRequestClose={closeAppointmentModal}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{t('appointments.addTitle')}</Text>
            <TouchableOpacity onPress={closeAppointmentModal} style={styles.closeBtn}>
              <X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {errorMsg ? (
              <View style={[styles.errorBox, { backgroundColor: colors.danger + '20' }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Title / Reason */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('appointments.appointmentTitle')} *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder={t('appointments.titlePlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Doctor & Specialty Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {t('appointments.doctorName')}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      color: colors.text,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  placeholder={t('appointments.doctorPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  value={doctorName}
                  onChangeText={setDoctorName}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {t('appointments.specialty')}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      color: colors.text,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  placeholder={t('appointments.specialtyPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  value={specialty}
                  onChangeText={setSpecialty}
                />
              </View>
            </View>

            {/* Date & Time Inputs */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('appointments.dateTime')}</Text>
            <View style={styles.dateTimeGrid}>
              {/* Date */}
              <View style={styles.dateSection}>
                <View style={styles.dateSubRow}>
                  <View style={styles.dateCol}>
                    <Text style={[styles.subLabel, { color: colors.textMuted }]}>DD</Text>
                    <TextInput
                      style={[styles.smallInput, { backgroundColor: colors.surfaceSubtle, color: colors.text, borderColor: colors.cardBorder }]}
                      keyboardType="number-pad"
                      maxLength={2}
                      value={day}
                      onChangeText={setDay}
                    />
                  </View>
                  <View style={styles.dateCol}>
                    <Text style={[styles.subLabel, { color: colors.textMuted }]}>MM</Text>
                    <TextInput
                      style={[styles.smallInput, { backgroundColor: colors.surfaceSubtle, color: colors.text, borderColor: colors.cardBorder }]}
                      keyboardType="number-pad"
                      maxLength={2}
                      value={month}
                      onChangeText={setMonth}
                    />
                  </View>
                  <View style={[styles.dateCol, { flex: 1.4 }]}>
                    <Text style={[styles.subLabel, { color: colors.textMuted }]}>YYYY</Text>
                    <TextInput
                      style={[styles.smallInput, { backgroundColor: colors.surfaceSubtle, color: colors.text, borderColor: colors.cardBorder }]}
                      keyboardType="number-pad"
                      maxLength={4}
                      value={year}
                      onChangeText={setYear}
                    />
                  </View>
                </View>
              </View>

              {/* Time */}
              <View style={styles.timeSection}>
                <View style={styles.dateSubRow}>
                  <View style={styles.dateCol}>
                    <Text style={[styles.subLabel, { color: colors.textMuted }]}>HH</Text>
                    <TextInput
                      style={[styles.smallInput, { backgroundColor: colors.surfaceSubtle, color: colors.text, borderColor: colors.cardBorder }]}
                      keyboardType="number-pad"
                      maxLength={2}
                      value={hours}
                      onChangeText={setHours}
                    />
                  </View>
                  <Text style={[styles.colon, { color: colors.text }]}>:</Text>
                  <View style={styles.dateCol}>
                    <Text style={[styles.subLabel, { color: colors.textMuted }]}>MM</Text>
                    <TextInput
                      style={[styles.smallInput, { backgroundColor: colors.surfaceSubtle, color: colors.text, borderColor: colors.cardBorder }]}
                      keyboardType="number-pad"
                      maxLength={2}
                      value={minutes}
                      onChangeText={setMinutes}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('appointments.location')}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder={t('appointments.locationPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Preparation Notes / Questions */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('appointments.preparationNotes')}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder="e.g., Ask about sleep schedule and fever remedies"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Integrations & Reminders Toggles */}
            <View style={[styles.togglesCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}>
              {/* Calendar Sync */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleLabelRow}>
                  <CalendarIcon size={18} color={colors.primary} />
                  <Text style={[styles.toggleText, { color: colors.text }]}>
                    {t('appointments.syncCalendar')}
                  </Text>
                </View>
                <Switch
                  value={syncToCalendar}
                  onValueChange={setSyncToCalendar}
                  trackColor={{ false: colors.surfaceSubtle, true: colors.primary }}
                  thumbColor="#FFF"
                />
              </View>

              {/* 24h Reminder */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleLabelRow}>
                  <Bell size={18} color={colors.appointment} />
                  <Text style={[styles.toggleText, { color: colors.text }]}>
                    {t('appointments.remind24h')}
                  </Text>
                </View>
                <Switch
                  value={remind24h}
                  onValueChange={setRemind24h}
                  trackColor={{ false: colors.surfaceSubtle, true: colors.appointment }}
                  thumbColor="#FFF"
                />
              </View>

              {/* 2h Reminder */}
              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <View style={styles.toggleLabelRow}>
                  <Clock size={18} color={colors.appointment} />
                  <Text style={[styles.toggleText, { color: colors.text }]}>
                    {t('appointments.remind2h')}
                  </Text>
                </View>
                <Switch
                  value={remind2h}
                  onValueChange={setRemind2h}
                  trackColor={{ false: colors.surfaceSubtle, true: colors.appointment }}
                  thumbColor="#FFF"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.appointment }]}
              onPress={handleSave}
            >
              <Check size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingBottom: 24,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  dateTimeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  dateSection: {
    flex: 1.8,
  },
  timeSection: {
    flex: 1.2,
  },
  dateSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateCol: {
    flex: 1,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  smallInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  colon: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 14,
  },
  togglesCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  toggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
