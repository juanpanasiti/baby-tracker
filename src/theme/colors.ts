export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceSubtle: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  // Domain colors
  breastfeeding: string;
  bottle: string;
  pee: string;
  poop: string;
  bothDiaper: string;
  appointment: string;
  timerActive: string;
}

export const darkTheme: ThemeColors = {
  isDark: true,
  background: '#0F172A', // Slate 900
  surface: '#1E293B',    // Slate 800
  surfaceSubtle: '#334155', // Slate 700
  card: '#1E293B',
  cardBorder: '#334155',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  primary: '#6366F1', // Indigo 500
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  accent: '#EC4899', // Pink 500
  success: '#10B981', // Emerald 500
  warning: '#F59E0B', // Amber 500
  danger: '#EF4444',  // Red 500
  info: '#38BDF8',    // Sky 400
  breastfeeding: '#F472B6', // Pink
  bottle: '#60A5FA',        // Blue
  pee: '#FBBF24',           // Amber/Yellow
  poop: '#B45309',          // Warm Amber/Brown
  bothDiaper: '#FB923C',    // Orange
  appointment: '#A78BFA',   // Purple
  timerActive: '#22C55E',   // Green
};

export const lightTheme: ThemeColors = {
  isDark: false,
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  primary: '#4F46E5', // Indigo 600
  primaryLight: '#6366F1',
  primaryDark: '#4338CA',
  accent: '#DB2777', // Pink 600
  success: '#059669', // Emerald 600
  warning: '#D97706', // Amber 600
  danger: '#DC2626',  // Red 600
  info: '#0284C7',    // Sky 600
  breastfeeding: '#EC4899',
  bottle: '#3B82F6',
  pee: '#D97706',
  poop: '#92400E',
  bothDiaper: '#EA580C',
  appointment: '#7C3AED',
  timerActive: '#16A34A',
};
