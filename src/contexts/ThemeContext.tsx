import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  // Surfaces
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;

  // Backward-compatible surface aliases
  background: string;
  backgroundElevated: string;
  card: string;
  cardBorder: string;

  // Text
  text: string;
  textMuted: string;
  textFaint: string;

  // Backward-compatible text aliases
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Accent
  accent: string;
  accentPressed: string;
  accentLight: string;
  onAccent: string;
  accentText: string;

  // Backward-compatible accent alias
  accentDark: string;

  // UI elements
  navBackground: string;
  navBorder: string;
  inputBackground: string;
  divider: string;
  skeleton: string;

  // Semantic
  success: string;
  warning: string;
  error: string;
  info: string;

  // Heart rate zones
  zones: string[];
}

// Heart rate zones (same hue order in both modes)
export const zonesDark = ['#8E9AAF', '#4DA3FF', '#3DDC84', '#FFD23F', '#FF4D6A'];
export const zonesLight = ['#6B778C', '#1E6FD9', '#1B8A4B', '#E0A800', '#D1264A'];

export const DarkColors: ThemeColors = {
  // Surfaces
  bg: '#0E0E10',
  surface: '#17171A',
  surfaceAlt: '#202024',
  border: '#2E2E33',

  // Backward-compatible surface aliases
  background: '#0E0E10',
  backgroundElevated: '#17171A',
  card: '#17171A',
  cardBorder: '#2E2E33',

  // Text
  text: '#F5F5F7',
  textMuted: '#A6A6AE',
  textFaint: '#8A8A93',

  // Backward-compatible text aliases
  textPrimary: '#F5F5F7',
  textSecondary: '#A6A6AE',
  textTertiary: '#8A8A93',
  textInverse: '#1B1612',

  // Accent
  accent: '#ff5e00',
  accentPressed: '#cc4a00',
  accentLight: '#2A1500',
  onAccent: '#1A0A00',
  accentText: '#ff5e00',

  // Backward-compatible accent alias
  accentDark: '#cc4a00',

  // UI elements
  navBackground: '#17171A',
  navBorder: '#2E2E33',
  inputBackground: '#202024',
  divider: '#2E2E33',
  skeleton: '#202024',

  // Semantic
  success: '#3DDC84',
  warning: '#FFD23F',
  error: '#FF4D6A',
  info: '#4DA3FF',

  // Heart rate zones
  zones: zonesDark,
};

export const LightColors: ThemeColors = {
  // Surfaces
  bg: '#FFFFFF',
  surface: '#FAF7F4',
  surfaceAlt: '#F4EFEA',
  border: '#E6DED6',

  // Backward-compatible surface aliases
  background: '#FFFFFF',
  backgroundElevated: '#FFFFFF',
  card: '#FAF7F4',
  cardBorder: '#E6DED6',

  // Text
  text: '#1B1612',
  textMuted: '#5C534B',
  textFaint: '#7A7067',

  // Backward-compatible text aliases
  textPrimary: '#1B1612',
  textSecondary: '#5C534B',
  textTertiary: '#7A7067',
  textInverse: '#F5F5F7',

  // Accent
  accent: '#ff5e00',
  accentText: '#b03d00',
  accentPressed: '#cc4a00',
  accentLight: '#FFF0E6',
  onAccent: '#1A0A00',

  // Backward-compatible accent alias
  accentDark: '#cc4a00',

  // UI elements
  navBackground: '#FFFFFF',
  navBorder: '#E6DED6',
  inputBackground: '#F4EFEA',
  divider: '#E6DED6',
  skeleton: '#F4EFEA',

  // Semantic
  success: '#1B8A4B',
  warning: '#A86500',
  error: '#D1264A',
  info: '#1E6FD9',

  // Heart rate zones
  zones: zonesLight,
};

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  colors: DarkColors,
  isDark: true,
  setMode: () => {},
  toggleMode: () => {},
});

const THEME_STORAGE_KEY = '@freakyfit_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    // Load saved preference on mount
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setModeState(saved);
      }
      // Default is already 'dark', no change needed if null
    });
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  const toggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const colors = mode === 'dark' ? DarkColors : LightColors;
  const isDark = mode === 'dark';

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}
