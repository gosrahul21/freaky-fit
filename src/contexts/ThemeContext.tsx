import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundElevated: string;
  card: string;
  cardBorder: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Brand
  accent: string;
  accentLight: string;
  accentDark: string;

  // UI elements
  navBackground: string;
  navBorder: string;
  inputBackground: string;
  divider: string;
  skeleton: string;

  // Status
  success: string;
  warning: string;
  error: string;
}

export const DarkColors: ThemeColors = {
  background: '#0E0E0F',
  backgroundElevated: '#141415',
  card: '#1A1A1B',
  cardBorder: '#2A2A2B',

  textPrimary: '#F5F5F5',
  textSecondary: '#A0A0A8',
  textTertiary: '#606068',
  textInverse: '#0E0E0F',

  accent: '#ff5e00',
  accentLight: '#2A1500',
  accentDark: '#cc4a00',

  navBackground: '#141415',
  navBorder: '#242425',
  inputBackground: '#1E1E1F',
  divider: '#222224',
  skeleton: '#232324',

  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

export const LightColors: ThemeColors = {
  background: '#F8F9FA',
  backgroundElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',

  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  accent: '#ff5e00',
  accentLight: '#FFF0E6',
  accentDark: '#cc4a00',

  navBackground: '#FFFFFF',
  navBorder: '#F3F4F6',
  inputBackground: '#F9FAFB',
  divider: '#E5E7EB',
  skeleton: '#F3F4F6',

  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
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
