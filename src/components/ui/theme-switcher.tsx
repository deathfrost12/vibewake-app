import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTheme, type ThemeMode } from '../../contexts/theme-context';
import { useThemedStyles } from '../../theme/useThemedStyles';

interface ThemeSwitcherProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeSwitcher({ className, showLabel = true }: ThemeSwitcherProps) {
  const { themeMode, setThemeMode } = useTheme();

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const showThemeOptions = () => {
    const options = [
      { label: 'Light Mode', value: 'light' as const },
      { label: 'Dark Mode', value: 'dark' as const },
      { label: 'System Default', value: 'system' as const },
    ];

    const buttons = options.map((option) => ({
      text: option.label,
      onPress: () => handleThemeChange(option.value),
      style: (themeMode === option.value ? 'destructive' : 'default') as 'default' | 'cancel' | 'destructive',
    }));

    buttons.push({ text: 'Cancel', onPress: () => {}, style: 'cancel' as 'cancel' });

    Alert.alert('Choose Theme', 'Select your preferred theme mode', buttons);
  };

  const getCurrentThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return '☀️ Light';
      case 'dark':
        return '🌙 Dark';
      case 'system':
        return '📱 System';
      default:
        return '🎨 Theme';
    }
  };

  return (
    <View className={className}>
      <TouchableOpacity
        onPress={showThemeOptions}
        className="flex-row items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 items-center justify-center mr-3">
            <Text className="text-lg">🎨</Text>
          </View>
          <View>
            {showLabel && (
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Theme
              </Text>
            )}
            <Text className="text-base text-gray-900 dark:text-gray-100">
              {getCurrentThemeLabel()}
            </Text>
          </View>
        </View>
        <Text className="text-gray-400 dark:text-gray-500 text-lg">›</Text>
      </TouchableOpacity>
    </View>
  );
}

// Simple inline theme toggle for dev/test purposes
export function SimpleThemeToggle({ className }: { className?: string }) {
  const { themeMode, setThemeMode, isDark } = useTheme();
  const { colors, borderRadius, spacing } = useThemedStyles();

  const toggleTheme = () => {
    console.log('🎨 Toggle theme clicked, current:', { themeMode, isDark });
    const nextMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{
        backgroundColor: colors.interactive.background,
        borderRadius: borderRadius.full,
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 44,
        minHeight: 44,
      }}
      className={className}
    >
      <Text style={{ fontSize: 18 }}>
        {isDark ? '☀️' : '🌙'}
      </Text>
    </TouchableOpacity>
  );
}

// Theme indicator for development
export function ThemeIndicator() {
  const { themeMode, isDark } = useTheme();

  return null; // Disabled - no more theme indicator overlay
}