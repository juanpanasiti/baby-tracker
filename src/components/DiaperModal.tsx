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
import { useDiaperStore } from '../store/useDiaperStore';
import { useBabyStore } from '../store/useBabyStore';
import { X, Check, AlertCircle } from 'lucide-react-native';

export function DiaperModal() {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const baby = useBabyStore((state) => state.baby);
  const { isDiaperModalOpen, closeDiaperModal, createDiaper } = useDiaperStore();

  const [type, setType] = useState<'pee' | 'poop' | 'both'>('pee');
  const [hasRash, setHasRash] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!baby) return;
    await createDiaper(baby.id, {
      type,
      hasRash,
      notes: notes.trim() || null,
      timestamp: Date.now(),
    });
    // Reset form
    setType('pee');
    setHasRash(false);
    setNotes('');
  };

  const getActiveColor = (currentType: 'pee' | 'poop' | 'both') => {
    if (currentType === 'pee') return colors.pee;
    if (currentType === 'poop') return colors.poop;
    return colors.bothDiaper;
  };

  return (
    <Modal visible={isDiaperModalOpen} transparent animationType="slide" onRequestClose={closeDiaperModal}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{t('diaper.title')}</Text>
            <TouchableOpacity onPress={closeDiaperModal} style={styles.closeBtn}>
              <X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Diaper Type Selection */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('diaper.type')}</Text>
            <View style={styles.typesRow}>
              {(['pee', 'poop', 'both'] as const).map((item) => {
                const isSelected = type === item;
                const activeColor = getActiveColor(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.typeCard,
                      {
                        backgroundColor: isSelected ? activeColor : colors.surfaceSubtle,
                        borderColor: isSelected ? activeColor : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setType(item)}
                  >
                    <Text style={styles.typeEmoji}>
                      {item === 'pee' ? '💧' : item === 'poop' ? '💩' : '💧💩'}
                    </Text>
                    <Text
                      style={[
                        styles.typeText,
                        { color: isSelected ? '#FFF' : colors.textSecondary },
                      ]}
                    >
                      {t(`diaper.${item}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Rash Toggle */}
            <View
              style={[
                styles.rashCard,
                {
                  backgroundColor: hasRash ? colors.danger + '15' : colors.surfaceSubtle,
                  borderColor: hasRash ? colors.danger : colors.cardBorder,
                },
              ]}
            >
              <View style={styles.rashLeft}>
                <AlertCircle size={20} color={hasRash ? colors.danger : colors.textMuted} />
                <Text
                  style={[
                    styles.rashLabel,
                    { color: hasRash ? colors.danger : colors.textSecondary },
                  ]}
                >
                  {t('diaper.hasRash')}
                </Text>
              </View>
              <Switch
                value={hasRash}
                onValueChange={setHasRash}
                trackColor={{ false: colors.surfaceSubtle, true: colors.danger }}
                thumbColor="#FFF"
              />
            </View>

            {/* Notes Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('common.notes')} ({t('common.optional')})
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
                placeholder="e.g., Slightly reddish, used diaper cream"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: getActiveColor(type) }]}
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  typesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  typeCard: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  typeEmoji: {
    fontSize: 26,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  rashCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  rashLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rashLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
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
