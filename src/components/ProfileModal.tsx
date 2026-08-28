import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useBabyStore } from '../store/useBabyStore';
import { Camera, X, Check, User } from 'lucide-react-native';
import { DatePickerInput } from './DatePickerInput';

export function ProfileModal() {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const { baby, isProfileModalOpen, closeProfileModal, createBaby, updateBaby } = useBabyStore();

  const [name, setName] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<number>(Date.now());
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (baby) {
      setName(baby.name);
      setSex(baby.sex as 'male' | 'female');
      setPhotoUri(baby.photoUri ?? null);
      setBirthDate(baby.birthDate);
    } else {
      setName('');
      setSex('male');
      setPhotoUri(null);
      setBirthDate(Date.now());
    }
    setErrorMessage('');
  }, [baby, isProfileModalOpen]);

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('profile.title'), 'Permission to access gallery is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      // Ignored
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMessage(t('common.required') + ': ' + t('profile.name'));
      return;
    }

    if (birthDate > Date.now()) {
      setErrorMessage('Birth date cannot be in the future');
      return;
    }

    try {
      if (baby) {
        await updateBaby({
          name: name.trim(),
          sex,
          photoUri,
          birthDate,
        });
      } else {
        await createBaby({
          name: name.trim(),
          sex,
          photoUri,
          birthDate,
        });
      }
    } catch (e: unknown) {
      setErrorMessage(e instanceof Error ? e.message : 'Error saving profile');
    }
  };

  return (
    <Modal
      visible={isProfileModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        if (baby) closeProfileModal();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {baby ? t('profile.editTitle') : t('profile.createTitle')}
            </Text>
            {baby && (
              <TouchableOpacity onPress={closeProfileModal} style={styles.closeButton}>
                <X size={24} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Photo Picker */}
            <View style={styles.photoContainer}>
              <TouchableOpacity
                onPress={handlePickPhoto}
                style={[
                  styles.photoButton,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.primary },
                ]}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <User size={40} color={colors.textMuted} />
                    <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
                      <Camera size={14} color="#FFF" />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={[styles.photoPrompt, { color: colors.textMuted }]}>
                {t('profile.photoPrompt')}
              </Text>
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={[styles.errorBox, { backgroundColor: colors.danger + '20' }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('profile.name')} *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder={t('profile.namePlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Sex Selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('profile.sex')} *</Text>
              <View style={styles.segmentedContainer}>
                <TouchableOpacity
                  style={[
                    styles.segmentOption,
                    sex === 'male'
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.surfaceSubtle },
                  ]}
                  onPress={() => setSex('male')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: sex === 'male' ? '#FFF' : colors.textSecondary },
                    ]}
                  >
                    👶 {t('profile.boy')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentOption,
                    sex === 'female'
                      ? { backgroundColor: colors.accent }
                      : { backgroundColor: colors.surfaceSubtle },
                  ]}
                  onPress={() => setSex('female')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: sex === 'female' ? '#FFF' : colors.textSecondary },
                    ]}
                  >
                    👧 {t('profile.girl')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Birth Date Input */}
            <DatePickerInput
              value={birthDate}
              onChange={setBirthDate}
              label={`${t('profile.birthDate')} *`}
              maximumDate={new Date()}
            />

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Check size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
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
  closeButton: {
    padding: 4,
  },
  content: {
    paddingBottom: 24,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: 96,
    height: 96,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPrompt: {
    fontSize: 13,
    marginTop: 8,
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
    marginBottom: 18,
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
  segmentedContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionRow: {
    marginTop: 16,
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
