import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import './src/i18n'; // Initialize i18n
import { initDatabase } from './src/db/client';
import { useThemeStore } from './src/store/useThemeStore';
import { useLocaleStore } from './src/store/useLocaleStore';
import { useBabyStore } from './src/store/useBabyStore';
import { useFeedingStore } from './src/store/useFeedingStore';
import { useDiaperStore } from './src/store/useDiaperStore';
import { useAppointmentStore } from './src/store/useAppointmentStore';

import { usePreferencesStore } from './src/store/usePreferencesStore';
import { useMedicationStore } from './src/store/useMedicationStore';
import { notificationService } from './src/services/notificationService';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TimelineScreen } from './src/screens/TimelineScreen';
import { MedicationsScreen } from './src/screens/MedicationsScreen';
import { AppointmentsScreen } from './src/screens/AppointmentsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { BottomNavBar, type TabScreen } from './src/components/BottomNavBar';

import { ProfileModal } from './src/components/ProfileModal';
import { FeedingModal } from './src/components/FeedingModal';
import { FeedingReminderPrompt } from './src/components/FeedingReminderPrompt';
import { EditReminderModal } from './src/components/EditReminderModal';
import { DiaperModal } from './src/components/DiaperModal';
import { AppointmentModal } from './src/components/AppointmentModal';
import { MedicationModal } from './src/components/MedicationModal';
import { LogDoseModal } from './src/components/LogDoseModal';
import { FullScreenAlarmModal } from './src/components/FullScreenAlarmModal';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<TabScreen>('dashboard');

  const { themeMode, colors, loadSavedTheme } = useThemeStore();
  const { loadSavedLanguage } = useLocaleStore();
  const { baby, loadBaby, openProfileModal } = useBabyStore();
  const { loadFeedings, cleanupStaleReminders } = useFeedingStore();
  const { loadDiaperStore } = useDiaperStore.getState() ? { loadDiaperStore: useDiaperStore.getState().loadDiapers } : { loadDiaperStore: () => Promise.resolve() };
  const { loadAppointments } = useAppointmentStore();
  const { loadMedications, loadMedicationLogs } = useMedicationStore();

  useEffect(() => {
    async function prepare() {
      try {
        // 1. Initialize SQLite tables
        await initDatabase();

        // 2. Load saved theme, language, and alert preferences
        await Promise.all([loadSavedTheme(), loadSavedLanguage(), usePreferencesStore.getState().loadPreferences()]);

        // 3. Initialize notification channels and listeners
        const alarmSound = usePreferencesStore.getState().alarmSound;
        await notificationService.setupChannels(alarmSound);
        notificationService.initListeners();

        // 4. Load Baby Profile
        await loadBaby();
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  // When baby profile is available, load related domain records
  useEffect(() => {
    if (baby) {
      loadFeedings(baby.id);
      loadDiaperStore(baby.id);
      loadAppointments(baby.id);
      loadMedications(baby.id);
      loadMedicationLogs(baby.id);
    }
  }, [baby]);

  // Sync and clean up stale reminders whenever app returns to active/foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && baby) {
        cleanupStaleReminders(baby.id);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [baby]);

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Baby Care...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <StatusBar
          barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />

        {/* Screen Content */}
        <View style={styles.screenContainer}>
          {activeTab === 'dashboard' && (
            <DashboardScreen
              onNavigateToTimeline={() => setActiveTab('timeline')}
              onNavigateToMedications={() => setActiveTab('medications')}
              onNavigateToAppointments={() => setActiveTab('appointments')}
            />
          )}
          {activeTab === 'timeline' && <TimelineScreen />}
          {activeTab === 'medications' && <MedicationsScreen />}
          {activeTab === 'appointments' && <AppointmentsScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
        </View>

        {/* Bottom Navigation */}
        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Global Modals */}
        <ProfileModal />
        <FeedingModal />
        <FeedingReminderPrompt />
        <EditReminderModal />
        <DiaperModal />
        <AppointmentModal />
        <MedicationModal />
        <LogDoseModal />
        <FullScreenAlarmModal />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  screenContainer: {
    flex: 1,
  },
});
