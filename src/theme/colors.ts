/**
 * Universal Theme Colors
 * 
 * Centralized color system for easy theme customization
 * Change colors here and they'll update throughout the entire app
 */

export const THEME_COLORS = {
  // ===== LIGHT MODE =====
  light: {
    // Backgrounds
    primary: '#FFFFFF',        // Main background
    secondary: '#F8F9FA',      // Secondary background 
    surface: '#F8F9FA',        // Cards, modals - light gray for visibility
    elevated: '#F3F4F6',       // Elevated elements - slightly darker gray
    clickable: '#FFFFFF',      // Clickable cards with border
    
    // Text
    text: {
      primary: '#1A1A1A',     // Main text
      secondary: '#6B7280',   // Secondary text
      muted: '#9CA3AF',       // Muted text
      accent: '#4F46E5',      // Accent text (can be changed to any color)
    },
    
    // Borders & Separators
    border: '#E5E7EB',        // Light borders
    separator: '#F3F4F6',     // Subtle separators
    
    // Interactive Elements
    interactive: {
      background: '#F3F4F6',  // Button backgrounds
      hover: '#E5E7EB',       // Hover states
      active: '#D1D5DB',      // Active states
      accent: '#4F46E5',      // Accent color (customizable)
      accentHover: '#4338CA', // Accent hover
    },
    
    // Status Colors
    status: {
      success: '#10B981',
      warning: '#F59E0B', 
      error: '#EF4444',
      info: '#3B82F6',
    }
  },

  // ===== DARK MODE =====
  dark: {
    // Backgrounds - True black modern look
    primary: '#000000',        // True black main background
    secondary: '#0A0A0A',      // Slightly lighter black
    surface: '#1A1A1A',        // Cards, modals - dark gray
    elevated: '#1A1A1A',       // Same as surface - dark gray
    clickable: '#1A1A1A',      // Clickable cards - dark gray with border
    
    // Text
    text: {
      primary: '#FFFFFF',     // Main text - pure white
      secondary: '#A3A3A3',   // Secondary text - light gray
      muted: '#737373',       // Muted text - medium gray
      accent: '#8B5CF6',      // Accent text (can be changed to any color)
    },
    
    // Borders & Separators
    border: '#333333',        // Dark borders
    separator: '#1A1A1A',     // Subtle separators
    
    // Interactive Elements
    interactive: {
      background: '#262626',  // Button backgrounds
      hover: '#333333',       // Hover states
      active: '#404040',      // Active states
      accent: '#8B5CF6',      // Accent color (customizable)
      accentHover: '#7C3AED', // Accent hover
    },
    
    // Status Colors - Slightly muted for dark mode
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444', 
      info: '#3B82F6',
    }
  }
};

// ===== TYPOGRAPHY =====
export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
};

// ===== SPACING =====
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// ===== BORDER RADIUS =====
export const BORDER_RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// ===== SHADOWS =====
export const SHADOWS = {
  light: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
  }
};

// ===== QUICK CUSTOMIZATION =====
// 🎨 Want to change the accent color? Just change these values:
export const ACCENT_COLOR = {
  light: '#4F46E5',    // Purple for light mode
  dark: '#8B5CF6',     // Lighter purple for dark mode
};

// 🎨 Want completely different colors? Change THEME_COLORS above
// 🎨 Want different typography? Change TYPOGRAPHY above
// 🎨 Want different spacing? Change SPACING above