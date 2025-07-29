import { useTheme } from '../contexts/theme-context';
import { THEME_COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from './colors';

/**
 * Hook for getting themed colors
 * Usage: const colors = useThemedColors();
 */
export const useThemedColors = () => {
  const { isDark } = useTheme();
  return isDark ? THEME_COLORS.dark : THEME_COLORS.light;
};

/**
 * Hook for getting themed shadows
 * Usage: const shadows = useThemedShadows();
 */
export const useThemedShadows = () => {
  const { isDark } = useTheme();
  return isDark ? SHADOWS.dark : SHADOWS.light;
};

/**
 * Hook for creating themed styles
 * Usage: const styles = useThemedStyles();
 */
export const useThemedStyles = () => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  const shadows = isDark ? SHADOWS.dark : SHADOWS.light;

  return {
    // Quick access to all theme values
    colors,
    shadows,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    
    // Pre-built common styles
    screen: {
      flex: 1,
      backgroundColor: colors.primary,
    },
    
    card: {
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      ...shadows.sm,
    },
    
    cardClickable: {
      backgroundColor: colors.clickable,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? 'transparent' : colors.border,
      ...shadows.sm,
    },
    
    cardLarge: {
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.xl,
      marginBottom: SPACING.lg,
      ...shadows.md,
    },
    
    button: {
      backgroundColor: colors.interactive.background,
      borderRadius: BORDER_RADIUS.lg,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    
    buttonAccent: {
      backgroundColor: colors.interactive.accent,
      borderRadius: BORDER_RADIUS.lg,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    
    text: {
      primary: {
        color: colors.text.primary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.normal,
      },
      secondary: {
        color: colors.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.normal,
      },
      heading: {
        color: colors.text.primary,
        fontSize: TYPOGRAPHY.sizes['3xl'],
        fontWeight: TYPOGRAPHY.weights.bold,
      },
      subheading: {
        color: colors.text.secondary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.medium,
      },
    },
    
    separator: {
      height: 1,
      backgroundColor: colors.separator,
      marginVertical: SPACING.sm,
    },
    
    // Utility functions
    isDark,
    isLight: !isDark,
  };
};

/**
 * Hook for creating themed card styles
 * Usage: const cardStyle = useThemedCard();
 */
export const useThemedCard = (variant: 'default' | 'elevated' | 'surface' | 'clickable' = 'default') => {
  const { colors, shadows, isDark } = useThemedStyles();
  
  const baseStyle = {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  };
  
  switch (variant) {
    case 'elevated':
      return {
        ...baseStyle,
        backgroundColor: colors.elevated,
        ...shadows.md,
      };
    case 'surface':
      return {
        ...baseStyle,
        backgroundColor: colors.surface,
        ...shadows.sm,
      };
    case 'clickable':
      return {
        ...baseStyle,
        backgroundColor: colors.clickable,
        borderWidth: isDark ? 0 : 1,
        borderColor: isDark ? 'transparent' : colors.border,
        ...shadows.sm,
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: colors.surface,
        ...shadows.sm,
      };
  }
};

/**
 * Hook for creating themed text styles
 * Usage: const textStyle = useThemedText('heading');
 */
export const useThemedText = (variant: 'primary' | 'secondary' | 'muted' | 'heading' | 'subheading' | 'accent' = 'primary') => {
  const { colors } = useThemedStyles();
  
  const baseStyle = {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.normal,
  };
  
  switch (variant) {
    case 'heading':
      return {
        ...baseStyle,
        color: colors.text.primary,
        fontSize: TYPOGRAPHY.sizes['3xl'],
        fontWeight: TYPOGRAPHY.weights.bold,
      };
    case 'subheading':
      return {
        ...baseStyle,
        color: colors.text.secondary,
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.semibold,
      };
    case 'secondary':
      return {
        ...baseStyle,
        color: colors.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
      };
    case 'muted':
      return {
        ...baseStyle,
        color: colors.text.muted,
        fontSize: TYPOGRAPHY.sizes.sm,
      };
    case 'accent':
      return {
        ...baseStyle,
        color: colors.text.accent,
        fontWeight: TYPOGRAPHY.weights.semibold,
      };
    default:
      return {
        ...baseStyle,
        color: colors.text.primary,
      };
  }
};