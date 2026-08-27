import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { Home, Clock, Calendar, Settings } from 'lucide-react-native';

export type TabScreen = 'dashboard' | 'timeline' | 'appointments' | 'settings';

interface BottomNavBarProps {
  activeTab: TabScreen;
  onTabChange: (tab: TabScreen) => void;
}

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);

  const tabs: { key: TabScreen; label: string; icon: React.ReactNode }[] = [
    {
      key: 'dashboard',
      label: t('nav.dashboard'),
      icon: (
        <Home
          size={22}
          color={activeTab === 'dashboard' ? colors.primary : colors.textMuted}
        />
      ),
    },
    {
      key: 'timeline',
      label: t('nav.timeline'),
      icon: (
        <Clock
          size={22}
          color={activeTab === 'timeline' ? colors.primary : colors.textMuted}
        />
      ),
    },
    {
      key: 'appointments',
      label: t('nav.appointments'),
      icon: (
        <Calendar
          size={22}
          color={activeTab === 'appointments' ? colors.primary : colors.textMuted}
        />
      ),
    },
    {
      key: 'settings',
      label: t('nav.settings'),
      icon: (
        <Settings
          size={22}
          color={activeTab === 'settings' ? colors.primary : colors.textMuted}
        />
      ),
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.cardBorder,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconWrapper,
                isActive ? { backgroundColor: colors.primary + '15' } : null,
              ]}
            >
              {tab.icon}
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? colors.primary : colors.textMuted,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 84 : 68,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
  },
});
