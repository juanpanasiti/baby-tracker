import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export const calendarService = {
  async requestPermissions(): Promise<boolean> {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  },

  async getDefaultCalendarId(): Promise<string | null> {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    if (Platform.OS === 'ios') {
      const defaultCal = await Calendar.getDefaultCalendarAsync();
      return defaultCal.id;
    }

    // Android: Look for primary calendar or writable calendar
    const primaryCal = calendars.find((c) => c.isPrimary && c.allowsModifications) || calendars.find((c) => c.allowsModifications);
    return primaryCal?.id ?? calendars[0]?.id ?? null;
  },

  async addEventToCalendar(
    title: string,
    startTimeMs: number,
    endTimeMs = startTimeMs + 60 * 60 * 1000,
    location?: string,
    notes?: string
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const calendarId = await this.getDefaultCalendarId();
      if (!calendarId) return null;

      const eventId = await Calendar.createEventAsync(calendarId, {
        title,
        startDate: new Date(startTimeMs),
        endDate: new Date(endTimeMs),
        location: location || undefined,
        notes: notes || undefined,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      return eventId;
    } catch {
      return null;
    }
  },

  async removeEventFromCalendar(eventId: string): Promise<void> {
    try {
      await Calendar.deleteEventAsync(eventId);
    } catch {
      // Ignored
    }
  },
};
