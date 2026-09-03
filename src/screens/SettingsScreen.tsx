import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useLocaleStore } from '../store/useLocaleStore';
import { useBabyStore } from '../store/useBabyStore';
import {
  Moon,
  Sun,
  Globe,
  User,
  Info,
  ChevronRight,
  ShieldCheck,
  Bell,
  Volume2,
  Sparkles,
  RotateCcw,
} from 'lucide-react-native';
import {
  usePreferencesStore,
  ALARM_SOUNDS,
  ALARM_NAGGING_INTERVALS,
  ALARM_NAGGING_MAX_REPEATS,
  type AlarmSoundId,
} from '../store/usePreferencesStore';
import { notificationService } from '../services/notificationService';
import Constants from 'expo-constants';

export function SettingsScreen() {
  const { t } = useTranslation();
  const { themeMode, colors, setThemeMode } = useThemeStore();
  const { language, setLanguage } = useLocaleStore();
  const { baby, openProfileModal } = useBabyStore();
  const {
    alarmSound,
    setAlarmSound,
    smartNightMode,
    setSmartNightMode,
    alarmNaggingEnabled,
    setAlarmNaggingEnabled,
    alarmNaggingInterval,
    setAlarmNaggingInterval,
    alarmNaggingMaxRepeats,
    setAlarmNaggingMaxRepeats,
  } = usePreferencesStore();

  const [isSoundSelectorOpen, setIsSoundSelectorOpen] = React.useState(false);
  const isDark = themeMode === 'dark';

  const handleTestSound = (soundId: AlarmSoundId) => {
    notificationService.previewAlarmSound(soundId, 'alarm');
  };

  const selectedSoundObj = ALARM_SOUNDS.find((s) => s.id === alarmSound) || ALARM_SOUNDS[0];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Baby Profile Shortcut */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {t('profile.title')}
      </Text>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        onPress={openProfileModal}
      >
        <View style={styles.rowLeft}>
          <View style={[styles.iconBg, { backgroundColor: colors.primary + '20' }]}>
            <User size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {baby ? baby.name : t('profile.createTitle')}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              {t('profile.editTitle')}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Alarms & Reminders Section */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
        {t('settings.alarmsAndReminders')}
      </Text>
      <View style={[styles.cardColumn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {/* Alarm Sound Picker */}
        <TouchableOpacity
          style={[styles.langRow, { borderBottomColor: colors.cardBorder }]}
          onPress={() => setIsSoundSelectorOpen(!isSoundSelectorOpen)}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.warning + '20' }]}>
              <Volume2 size={20} color={colors.warning} />
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.alarmSound')}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                {t(selectedSoundObj.labelKey)}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Expandable Sound Selector Options */}
        {isSoundSelectorOpen && (
          <View style={{ backgroundColor: colors.surfaceSubtle }}>
            {ALARM_SOUNDS.map((soundItem) => (
              <View
                key={soundItem.id}
                style={[
                  styles.soundItemRow,
                  { borderBottomColor: colors.cardBorder },
                ]}
              >
                <TouchableOpacity
                  style={styles.soundSelectBtn}
                  onPress={() => setAlarmSound(soundItem.id)}
                >
                  <Text
                    style={[
                      styles.soundOptionText,
                      {
                        color: alarmSound === soundItem.id ? colors.primaryLight : colors.text,
                        fontWeight: alarmSound === soundItem.id ? '700' : '500',
                      },
                    ]}
                  >
                    {t(soundItem.labelKey)}
                  </Text>
                  {alarmSound === soundItem.id && (
                    <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.testSoundBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  onPress={() => handleTestSound(soundItem.id)}
                >
                  <Text style={[styles.testSoundText, { color: colors.primaryLight }]}>
                    {t('settings.testSound')}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Smart Night Mode Switch */}
        <View style={[styles.langRow, { borderBottomColor: colors.cardBorder }]}>
          <View style={[styles.rowLeft, { flex: 1, paddingRight: 12 }]}>
            <View style={[styles.iconBg, { backgroundColor: colors.primary + '20' }]}>
              <Sparkles size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.smartNightMode')}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]} numberOfLines={2}>
                {t('settings.smartNightModeDesc')}
              </Text>
            </View>
          </View>
          <Switch
            value={smartNightMode}
            onValueChange={(val) => setSmartNightMode(val)}
            trackColor={{ false: colors.surfaceSubtle, true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        {/* Persistent Alarm Re-Alert (Nagging) */}
        <View style={[styles.langRow, { borderBottomWidth: alarmNaggingEnabled ? 1 : 0, borderBottomColor: colors.cardBorder }]}>
          <View style={[styles.rowLeft, { flex: 1, paddingRight: 12 }]}>
            <View style={[styles.iconBg, { backgroundColor: colors.warning + '20' }]}>
              <RotateCcw size={20} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.persistentAlarmReAlert')}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]} numberOfLines={2}>
                {t('settings.persistentAlarmReAlertDesc')}
              </Text>
            </View>
          </View>
          <Switch
            value={alarmNaggingEnabled}
            onValueChange={(val) => setAlarmNaggingEnabled(val)}
            trackColor={{ false: colors.surfaceSubtle, true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        {/* Re-Alert Details: Interval & Max Repeats */}
        {alarmNaggingEnabled && (
          <View style={{ backgroundColor: colors.surfaceSubtle, paddingTop: 12, paddingBottom: 6 }}>
            {/* Interval Selector */}
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <Text style={[styles.subOptionHeader, { color: colors.textSecondary }]}>
                {t('settings.reAlertInterval')}
              </Text>
              <View style={styles.pillRow}>
                {ALARM_NAGGING_INTERVALS.map((intVal) => (
                  <TouchableOpacity
                    key={intVal}
                    style={[
                      styles.pillBtn,
                      {
                        backgroundColor: alarmNaggingInterval === intVal ? colors.primary : colors.card,
                        borderColor: alarmNaggingInterval === intVal ? colors.primary : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setAlarmNaggingInterval(intVal)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color: alarmNaggingInterval === intVal ? '#FFFFFF' : colors.text,
                          fontWeight: alarmNaggingInterval === intVal ? '700' : '500',
                        },
                      ]}
                    >
                      {t('settings.reAlertIntervalMinutes', { minutes: intVal })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Max Repeats Selector */}
            <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
              <Text style={[styles.subOptionHeader, { color: colors.textSecondary }]}>
                {t('settings.maxRepeats')}
              </Text>
              <View style={styles.pillRow}>
                {ALARM_NAGGING_MAX_REPEATS.map((repVal, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.pillBtn,
                      {
                        backgroundColor: alarmNaggingMaxRepeats === repVal ? colors.primary : colors.card,
                        borderColor: alarmNaggingMaxRepeats === repVal ? colors.primary : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setAlarmNaggingMaxRepeats(repVal)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color: alarmNaggingMaxRepeats === repVal ? '#FFFFFF' : colors.text,
                          fontWeight: alarmNaggingMaxRepeats === repVal ? '700' : '500',
                        },
                      ]}
                    >
                      {repVal === null
                        ? t('settings.maxRepeatsIndefinite')
                        : t('settings.maxRepeatsCount', { count: repVal })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Appearance / Theme */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
        {t('settings.appearance')}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.rowLeft}>
          <View style={[styles.iconBg, { backgroundColor: isDark ? colors.primary + '20' : colors.warning + '20' }]}>
            {isDark ? <Moon size={20} color={colors.primary} /> : <Sun size={20} color={colors.warning} />}
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {isDark ? t('settings.darkTheme') : t('settings.lightTheme')}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              {t('settings.theme')}
            </Text>
          </View>
        </View>
        <Switch
          value={isDark}
          onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
          trackColor={{ false: colors.surfaceSubtle, true: colors.primary }}
          thumbColor="#FFF"
        />
      </View>

      {/* Language */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
        {t('settings.language')}
      </Text>
      <View style={[styles.cardColumn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {/* English */}
        <TouchableOpacity
          style={[styles.langRow, { borderBottomColor: colors.cardBorder }]}
          onPress={() => setLanguage('en')}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.info + '20' }]}>
              <Globe size={20} color={colors.info} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.english')}</Text>
          </View>
          {language === 'en' && (
            <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
          )}
        </TouchableOpacity>

        {/* Spanish */}
        <TouchableOpacity style={styles.langRow} onPress={() => setLanguage('es')}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.info + '20' }]}>
              <Globe size={20} color={colors.info} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.spanish')}</Text>
          </View>
          {language === 'es' && (
            <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
          )}
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
        {t('settings.about')}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.rowLeft}>
          <View style={[styles.iconBg, { backgroundColor: colors.success + '20' }]}>
            <ShieldCheck size={20} color={colors.success} />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Baby Care</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              {t('settings.version', {
                version: Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0',
              })}
            </Text>
          </View>
        </View>
        <Info size={20} color={colors.textMuted} />
      </View>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  cardColumn: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  soundItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  soundSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingVertical: 4,
  },
  soundOptionText: {
    fontSize: 15,
  },
  testSoundBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  testSoundText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subOptionHeader: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
  },
});
