import React from 'react';
import { View, Text, ViewProps, TextProps } from 'react-native';
import { useTheme } from '../../contexts/theme-context';

// Theme-aware View component
export function ThemedView({ style, ...props }: ViewProps) {
  const { isDark } = useTheme();

  const themeStyle = {
    backgroundColor: isDark ? '#000000' : '#F8FAFC', // Light gray background for light mode
  };

  return <View style={[themeStyle, style]} {...props} />;
}

// Theme-aware Text component
export function ThemedText({ style, ...props }: TextProps) {
  const { isDark } = useTheme();

  const themeStyle = {
    color: isDark ? '#FFFFFF' : '#1F2937', // Darker text for better contrast in light mode
  };

  return <Text style={[themeStyle, style]} {...props} />;
}

// Theme-aware Card component
export function ThemedCard({ style, children, ...props }: ViewProps) {
  const { isDark } = useTheme();

  const themeStyle = {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF', // Consistent card colors
    borderColor: isDark ? '#374151' : '#E5E7EB', // Better border contrast
    borderWidth: 1,
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  return (
    <View style={[themeStyle, style]} {...props}>
      {children}
    </View>
  );
}
