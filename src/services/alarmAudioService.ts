import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Vibration, Platform } from 'react-native';

const SOUND_ASSETS: Record<string, any> = {
  digital: require('../../assets/sounds/alarm_digital.wav'),
  chime: require('../../assets/sounds/alarm_chime.wav'),
  bells: require('../../assets/sounds/alarm_bells.wav'),
  gentle: require('../../assets/sounds/alarm_gentle.wav'),
};

const VIBRATION_PATTERN = [0, 600, 300, 600, 300, 1000];

class AlarmAudioService {
  private soundObject: Audio.Sound | null = null;
  private isPlaying = false;

  async initAudioMode(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: false,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });
    } catch (e) {
      console.warn('[AlarmAudioService] Error setting audio mode:', e);
    }
  }

  async startAlarm(soundId = 'default'): Promise<void> {
    if (this.isPlaying) {
      return;
    }

    try {
      await this.initAudioMode();
      this.isPlaying = true;

      // Start continuous vibration loop
      Vibration.vibrate(VIBRATION_PATTERN, true);

      // Select audio source
      const soundSource = SOUND_ASSETS[soundId] || SOUND_ASSETS.digital;

      if (soundSource) {
        if (this.soundObject) {
          try {
            await this.soundObject.stopAsync();
            await this.soundObject.unloadAsync();
          } catch {
            // Ignored
          }
          this.soundObject = null;
        }

        const { sound } = await Audio.Sound.createAsync(
          soundSource,
          {
            isLooping: true,
            volume: 1.0,
            shouldPlay: true,
          }
        );

        this.soundObject = sound;
      }
    } catch (error) {
      console.error('[AlarmAudioService] Failed to start alarm audio:', error);
    }
  }

  async stopAlarm(): Promise<void> {
    try {
      Vibration.cancel();
      this.isPlaying = false;

      if (this.soundObject) {
        await this.soundObject.stopAsync();
        await this.soundObject.unloadAsync();
        this.soundObject = null;
      }
    } catch (error) {
      console.warn('[AlarmAudioService] Error stopping alarm audio:', error);
      this.soundObject = null;
    }
  }

  isRinging(): boolean {
    return this.isPlaying;
  }
}

export const alarmAudioService = new AlarmAudioService();
