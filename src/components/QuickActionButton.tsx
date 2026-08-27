import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

interface QuickActionButtonProps {
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

export function QuickActionButton({ label, subLabel, icon, color, onPress }: QuickActionButtonProps) {
  const colors = useThemeStore((state) => state.colors);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {subLabel ? (
        <Text style={[styles.subLabel, { color: colors.textMuted }]} numberOfLines={1}>
          {subLabel}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 115,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  subLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
