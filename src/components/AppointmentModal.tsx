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
import { X, Check, Calendar as CalendarIcon, Clock, Bell } from 'lucide-react-native';
import { DateTimePickerInput } from './DateTimePickerInput';

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

  // Date and Time timestamp (default to tomorrow at 10:00 AM)
  const getInitialAppointmentDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.getTime();
  };

  const [appointmentDate, setAppointmentDate] = useState(getInitialAppointmentDate);

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
      setAppointmentDate(getInitialAppointmentDate());
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

            {/* Date & Time Input */}
            <DateTimePickerInput
              value={appointmentDate}
              onChange={setAppointmentDate}
              showPresets={false}
              label={t('appointments.dateTime') || 'Date & Time'}
            />

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
