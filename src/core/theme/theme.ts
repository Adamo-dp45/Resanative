import { useColorScheme } from 'react-native';

/** Jeu de couleurs sémantiques (déclinées en clair/sombre). */
export interface AppColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
}

const lightColors: AppColors = {
  background: '#F6F8F7',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F0',
  primary: '#1B6B4C',
  onPrimary: '#FFFFFF',
  primaryContainer: '#CDEBDC',
  onPrimaryContainer: '#0A3323',
  text: '#12211B',
  textMuted: '#5B6B63',
  border: '#DBE3DF',
  success: '#1B873F',
  warning: '#B26A00',
  danger: '#B3261E',
  overlay: 'rgba(0,0,0,0.45)',
};

const darkColors: AppColors = {
  background: '#0F1512',
  surface: '#17201C',
  surfaceAlt: '#1F2A25',
  primary: '#6FD3A2',
  onPrimary: '#053024',
  primaryContainer: '#1E4636',
  onPrimaryContainer: '#CDEBDC',
  text: '#E6EDE9',
  textMuted: '#9DA9A3',
  border: '#2C3A33',
  success: '#5FD07C',
  warning: '#E0A24B',
  danger: '#F2B8B5',
  overlay: 'rgba(0,0,0,0.6)',
};

/** Échelle d'espacement (multiples de 4). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export interface Theme {
  colors: AppColors;
  spacing: typeof spacing;
  radius: typeof radius;
  dark: boolean;
}

/** Thème courant selon le mode clair/sombre du système. */
export function useTheme(): Theme {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return {
    colors: dark ? darkColors : lightColors,
    spacing,
    radius,
    dark,
  };
}
