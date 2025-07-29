import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme-mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light'); // Start with light mode
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render trigger
  
  // Calculate if we should use dark mode
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  // Load theme from storage on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Update theme when mode changes
  useEffect(() => {
    updateThemeClass();
    // Force re-render to apply new theme
    setForceUpdate(prev => prev + 1);
  }, [isDark, themeMode]);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setThemeModeState(stored as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const updateThemeClass = () => {
    // Debug logging
    console.log('🎨 Theme updated:', { themeMode, isDark, systemColorScheme, forceUpdate });
    
    // For web, update the document class
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    // For React Native, we'll use the context state directly
    // The force update will trigger re-render of all components
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook to get theme-aware styles
export function useThemeStyles() {
  const { isDark } = useTheme();
  
  return {
    // Background colors
    background: isDark ? '#111827' : '#FFFFFF',
    surface: isDark ? '#1F2937' : '#F9FAFB',
    card: isDark ? '#374151' : '#FFFFFF',
    
    // Text colors
    text: isDark ? '#F9FAFB' : '#111827',
    textSecondary: isDark ? '#D1D5DB' : '#4B5563',
    textMuted: isDark ? '#9CA3AF' : '#6B7280',
    
    // Border colors
    border: isDark ? '#374151' : '#E5E7EB',
    
    // Status colors (same for both themes)
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Helper utilities
    isDark,
    isLight: !isDark,
  };
}