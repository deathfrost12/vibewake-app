import React from 'react';
import { View, Text, ViewProps, TextProps } from 'react-native';
import { useTheme } from '../../contexts/theme-context';

// Theme-aware View component
export function ThemedView({ style, ...props }: ViewProps) {
  const { isDark } = useTheme();

  const themeStyle = {
    backgroundColor: isDark ? '#000000' : '#FFFFFF',
  };

  return (
    <View 
      style={[themeStyle, style]} 
      {...props}
    />
  );
}

// Theme-aware Text component
export function ThemedText({ style, ...props }: TextProps) {
  const { isDark } = useTheme();

  const themeStyle = {
    color: isDark ? '#FFFFFF' : '#0F172A',
  };

  return (
    <Text 
      style={[themeStyle, style]} 
      {...props}
    />
  );
}

// Theme-aware Card component
export function ThemedCard({ style, children, ...props }: ViewProps) {
  const { isDark } = useTheme();

  const themeStyle = {
    backgroundColor: isDark ? '#1A2626' : '#FFFFFF',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  return (
    <View 
      style={[themeStyle, style]} 
      {...props}
    >
      {children}
    </View>
  );
}