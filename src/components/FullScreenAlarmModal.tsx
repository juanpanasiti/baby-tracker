import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell, Clock, Milk, Moon, Volume2, X } from 'lucide-react-native';
import { useAlarmRingingStore } from '../store/useAlarmRingingStore';
import { useBabyStore } from '../store/useBabyStore';
import { useFeedingStore } from '../store/useFeedingStore';
import { usePreferencesStore, ALARM_SOUNDS } from '../store/usePreferencesStore';

export function FullScreenAlarmModal() {
  const { t } = useTranslation();
  const { isAlarmRinging, ringingBabyName, ringingSound, silenceAlarm, snoozeAlarm } =
    useAlarmRingingStore();
  const { baby } = useBabyStore();
  const { openFeedingModal } = useFeedingStore();

  // Pulsing animation for the ringing visual cue
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAlarmRinging) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );

      const rippleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

      pulseLoop.start();
      rippleLoop.start();

      return () => {
        pulseLoop.stop();
        rippleLoop.stop();
      };
    }
  }, [isAlarmRinging, pulseAnim, rippleAnim]);

  if (!isAlarmRinging) {
    return null;
  }

  const handleSilenceAndFeed = async () => {
    await silenceAlarm();
    openFeedingModal('breast');
  };

  const handleSilenceOnly = async () => {
    await silenceAlarm();
  };

  const handleSnooze = async () => {
    await snoozeAlarm(15);
  };

  const soundLabel =
    ALARM_SOUNDS.find((s) => s.id === ringingSound)?.labelKey || 'settings.soundDefault';

  const currentTimeStr = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const babyDisplayName = ringingBabyName || baby?.name || t('profile.title');

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  return (
    <Modal
      visible={isAlarmRinging}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={handleSilenceOnly}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.container}>
        {/* Background ambient glow */}
        <View style={styles.glowCircle} />

        {/* Top Bar with Time and Dismiss */}
        <View style={styles.topBar}>
          <View style={styles.badge}>
            <Bell size={16} color="#EF4444" />
            <Text style={styles.badgeText}>{t('alarms.ringingTitle')}</Text>
          </View>
          <TouchableOpacity
            style={styles.closeIconButton}
            onPress={handleSilenceOnly}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={24} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Center Baby & Ringing Animation */}
        <View style={styles.centerContent}>
          <View style={styles.avatarWrapper}>
            <Animated.View
              style={[
                styles.rippleRing,
                {
                  transform: [{ scale: rippleScale }],
                  opacity: rippleOpacity,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.avatarContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              {baby?.photoUri ? (
                <Image source={{ uri: baby.photoUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Milk size={54} color="#6366F1" />
                </View>
              )}
            </Animated.View>
          </View>

          <Text style={styles.babyName}>{babyDisplayName}</Text>
          <Text style={styles.timeText}>{currentTimeStr}</Text>
          <Text style={styles.subtitle}>
            {t('alarms.ringingSubtitle', { babyName: babyDisplayName })}
          </Text>

          <View style={styles.soundBadge}>
            <Volume2 size={14} color="#94A3B8" />
            <Text style={styles.soundBadgeText}>{t(soundLabel)}</Text>
          </View>
        </View>

        {/* Bottom Actions Area */}
        <View style={styles.actionsContainer}>
          {/* Primary Action: Silence & Log Feeding */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSilenceAndFeed}
            activeOpacity={0.85}
          >
            <Milk size={22} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>{t('alarms.feedBaby')}</Text>
          </TouchableOpacity>

          {/* Secondary Actions: Snooze +15m and Silence Only */}
          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={styles.snoozeButton}
              onPress={handleSnooze}
              activeOpacity={0.8}
            >
              <Clock size={18} color="#CBD5E1" />
              <Text style={styles.snoozeButtonText}>{t('alarms.snooze')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.silenceOnlyButton}
              onPress={handleSilenceOnly}
              activeOpacity={0.8}
            >
              <Text style={styles.silenceOnlyText}>{t('alarms.silence')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate-900 high contrast dark
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 40,
  },
  glowCircle: {
    position: 'absolute',
    top: '25%',
    left: '50%',
    width: 320,
    height: 320,
    marginLeft: -160,
    borderRadius: 160,
    backgroundColor: '#6366F115',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EF444420',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EF444440',
  },
  badgeText: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeIconButton: {
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: 20,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  avatarWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  rippleRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#6366F1',
  },
  avatarContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#1E293B',
    borderWidth: 4,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  babyName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  soundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  soundBadgeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  snoozeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  snoozeButtonText: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
  },
  silenceOnlyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  silenceOnlyText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
});
