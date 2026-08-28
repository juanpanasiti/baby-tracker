import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  AppState,
} from 'react-native';
import './src/i18n'; // Initialize i18n
import { initDatabase } from './src/db/client';
import { useThemeStore } from './src/store/useThemeStore';
import { useLocaleStore } from './src/store/useLocaleStore';
import { useBabyStore } from './src/store/useBabyStore';
import { useFeedingStore } from './src/store/useFeedingStore';
import { useDiaperStore } from './src/store/useDiaperStore';
import { useAppointmentStore } from './src/store/useAppointmentStore';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { TimelineScreen } from './src/screens/TimelineScreen';
import { AppointmentsScreen } from './src/screens/AppointmentsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { BottomNavBar, type TabScreen } from './src/components/BottomNavBar';

import { ProfileModal } from './src/components/ProfileModal';
import { FeedingModal } from './src/components/FeedingModal';
import { FeedingReminderPrompt } from './src/components/FeedingReminderPrompt';
import { DiaperModal } from './src/components/DiaperModal';
import { AppointmentModal } from './src/components/AppointmentModal';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<TabScreen>('dashboard');

  const { themeMode, colors, loadSavedTheme } = useThemeStore();
  const { loadSavedLanguage } = useLocaleStore();
  const { baby, loadBaby, openProfileModal } = useBabyStore();
  const { loadFeedings, cleanupStaleReminders } = useFeedingStore();
  const { loadDiaperStore } = useDiaperStore.getState() ? { loadDiaperStore: useDiaperStore.getState().loadDiapers } : { loadDiaperStore: () => Promise.resolve() };
  const { loadAppointments } = useAppointmentStore();

  useEffect(() => {
    async function prepare() {
      try {
        // 1. Initialize SQLite tables
        await initDatabase();

        // 2. Load saved theme and language preferences
        await Promise.all([loadSavedTheme(), loadSavedLanguage()]);

        // 3. Load Baby Profile
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Baby Tracker...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Screen Content */}
      <View style={styles.screenContainer}>
        {activeTab === 'dashboard' && (
          <DashboardScreen
            onNavigateToTimeline={() => setActiveTab('timeline')}
            onNavigateToAppointments={() => setActiveTab('appointments')}
          />
        )}
        {activeTab === 'timeline' && <TimelineScreen />}
        {activeTab === 'appointments' && <AppointmentsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Global Modals */}
      <ProfileModal />
      <FeedingModal />
      <FeedingReminderPrompt />
      <DiaperModal />
      <AppointmentModal />
    </SafeAreaView>
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
