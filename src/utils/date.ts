/**
 * Calculates the age of a baby given a birth timestamp in milliseconds.
 */
export function calculateBabyAge(birthDateMs: number): { months: number; days: number; totalDays: number } {
  const birth = new Date(birthDateMs);
  const now = new Date();

  const diffTime = Math.max(0, now.getTime() - birth.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    // Get days in previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    months = 0;
  }

  return { months, days: Math.max(0, days), totalDays };
}

/**
 * Formats a timestamp into a human readable relative string (e.g. "1h 30m ago", "Just now").
 */
export function formatRelativeTime(timestampMs: number, isSpanish = false): string {
  const now = Date.now();
  const diffMinutes = Math.floor((now - timestampMs) / (1000 * 60));

  if (diffMinutes < 1) {
    return isSpanish ? 'Recién' : 'Just now';
  }

  if (diffMinutes < 60) {
    return isSpanish ? `hace ${diffMinutes} min` : `${diffMinutes}m ago`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;

  if (hours < 24) {
    if (mins === 0) {
      return isSpanish ? `hace ${hours} h` : `${hours}h ago`;
    }
    return isSpanish ? `hace ${hours}h ${mins}m` : `${hours}h ${mins}m ago`;
  }

  const days = Math.floor(hours / 24);
  return isSpanish ? `hace ${days} d` : `${days}d ago`;
}

/**
 * Formats timestamp to HH:MM format (24-hour).
 */
export function formatTimeOnly(timestampMs: number): string {
  const date = new Date(timestampMs);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formats timestamp to short date string (e.g., "Aug 26" or "26 ago").
 */
export function formatShortDate(timestampMs: number, locale = 'en'): string {
  const date = new Date(timestampMs);
  return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats timestamp to a full localized date string (e.g., "Aug 28, 2026" or "28 ago 2026").
 */
export function formatDateOnly(timestampMs: number, locale = 'en'): string {
  const date = new Date(timestampMs);
  return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats timestamp to full date and time string (e.g. "Aug 28, 2026, 15:30").
 */
export function formatFullDateTime(timestampMs: number, locale = 'en'): string {
  const date = new Date(timestampMs);
  return `${formatDateOnly(timestampMs, locale)}, ${formatTimeOnly(timestampMs)}`;
}

/**
 * Alias for formatted date and time display.
 */
export function formatDateTimeDisplay(timestampMs: number, locale = 'en'): string {
  return formatFullDateTime(timestampMs, locale);
}
