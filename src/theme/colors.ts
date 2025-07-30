/**
 * VibeWake Neon Design System
 * 
 * Modern neon/gradient color palette inspired by Echo AI
 * Dark-first approach for sleep-friendly alarm clock app
 */

export const THEME_COLORS = {
  // ===== DARK MODE (Primary) =====
  dark: {
    // Backgrounds - Deep space with subtle teal tint
    primary: '#000000',        // Pure black main background
    secondary: '#001010',      // Very dark teal
    surface: '#0D1A1A',        // Elevated dark surface (90% opacity feel)
    elevated: '#1A2626',       // Cards, modals
    clickable: '#0D1A1A',      // Interactive surfaces
    
    // Text - Crisp whites and cool grays
    text: {
      primary: '#FFFFFF',      // Pure white text
      secondary: '#A8B4B6',    // Cool secondary gray
      muted: '#6B7280',        // Muted text
      accent: '#66F0FF',       // Aqua accent text
    },
    
    // Borders & Separators - Subtle with transparency
    border: 'rgba(255,255,255,0.07)',     // Ultra-subtle borders
    separator: 'rgba(255,255,255,0.05)',   // Hairline separators
    
    // Interactive Elements - Neon gradients and glows
    interactive: {
      background: '#1A2626',   // Button backgrounds
      hover: '#2D3F3F',        // Hover states
      active: '#3F5252',       // Active states
      accent: '#5CFFF0',       // Primary neon mint
      accentHover: '#4DE6D7',  // Darker mint hover
      secondary: '#75FFB0',    // Secondary mint
      tertiary: '#66F0FF',     // Aqua highlight
    },
    
    // Status Colors - Neon-adjusted
    status: {
      success: '#75FFB0',      // Neon mint success
      warning: '#FFD700',      // Bright gold warning
      error: '#FF6B6B',        // Soft red error
      info: '#66F0FF',         // Aqua info
    }
  },

  // ===== LIGHT MODE (Secondary) =====
  light: {
    // Backgrounds - Clean with subtle warmth
    primary: '#FAFAFA',        // Soft white
    secondary: '#F3F4F6',      // Light gray
    surface: '#FFFFFF',        // Pure white
    elevated: '#F9FAFB',       // Elevated white
    clickable: '#FFFFFF',      // Interactive white
    
    // Text - Dark with neon accents
    text: {
      primary: '#1E293B',      // Dark slate
      secondary: '#64748B',    // Medium slate
      muted: '#94A3B8',        // Light slate
      accent: '#0891B2',       // Cyan accent
    },
    
    // Borders & Separators
    border: '#E2E8F0',         // Light borders
    separator: '#F1F5F9',      // Subtle separators
    
    // Interactive Elements - Adapted neons for light mode
    interactive: {
      background: '#F1F5F9',   // Light button bg
      hover: '#E2E8F0',        // Light hover
      active: '#CBD5E1',       // Light active
      accent: '#0891B2',       // Cyan primary
      accentHover: '#0E7490',  // Darker cyan
      secondary: '#059669',    // Green secondary
      tertiary: '#0284C7',     // Blue tertiary
    },
    
    // Status Colors
    status: {
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#0284C7',
    }
  }
};

// ===== GRADIENTS =====
export const GRADIENTS = {
  // Primary gradients
  primary: 'linear-gradient(135deg, #5CFFF0 0%, #9BFF93 100%)',
  primaryReverse: 'linear-gradient(315deg, #5CFFF0 0%, #9BFF93 100%)',
  
  // Surface gradients
  surface: 'linear-gradient(145deg, #000000 0%, #001010 100%)',
  surfaceElevated: 'linear-gradient(145deg, #0D1A1A 0%, #1A2626 100%)',
  
  // Accent gradients
  mint: 'linear-gradient(135deg, #75FFB0 0%, #5CFFF0 100%)',
  aqua: 'linear-gradient(135deg, #66F0FF 0%, #5CFFF0 100%)',
  
  // Button gradients
  cta: 'linear-gradient(135deg, #5CFFF0 0%, #9BFF93 100%)',
  ctaHover: 'linear-gradient(135deg, #4DE6D7 0%, #88E680 100%)',
};

// ===== SHADOWS & GLOWS =====
export const SHADOWS = {
  dark: {
    // Regular shadows
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.55,
      shadowRadius: 24,
      elevation: 8,
    },
    
    // Neon glows
    neonMint: {
      shadowColor: '#75FFB0',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 6,
    },
    neonAqua: {
      shadowColor: '#66F0FF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 6,
    },
    neonPrimary: {
      shadowColor: '#5CFFF0',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  light: {
    // Regular shadows for light mode
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 8,
    },
    
    // Light mode glows
    neonMint: {
      shadowColor: '#059669',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    neonAqua: {
      shadowColor: '#0284C7',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    neonPrimary: {
      shadowColor: '#0891B2',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

// ===== TYPOGRAPHY =====
export const TYPOGRAPHY = {
  sizes: {
    // Display (Hero sections)
    display: { fontSize: 40, lineHeight: 48 },
    // Headings
    h1: { fontSize: 32, lineHeight: 40 },
    h2: { fontSize: 20, lineHeight: 24 },
    h3: { fontSize: 18, lineHeight: 24 },
    // Body text
    base: { fontSize: 16, lineHeight: 24 },
    body: { fontSize: 16, lineHeight: 24 },
    caption: { fontSize: 14, lineHeight: 20 },
    small: { fontSize: 12, lineHeight: 16 },
    sm: { fontSize: 14, lineHeight: 20 },
    lg: { fontSize: 18, lineHeight: 24 },
    '3xl': { fontSize: 32, lineHeight: 40 },
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// ===== SPACING (8pt Grid) =====
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  
  // Specific use cases
  safeArea: 24,      // Horizontal safe area padding
  hitZone: 56,       // Minimum touch zone
};

// ===== BORDER RADIUS =====
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,            // Card radius (Echo style)
  '2xl': 24,
  full: 9999,        // FAB and circular elements
};

// ===== QUICK ACCESS =====
export const NEON_COLORS = {
  mint: '#75FFB0',
  aqua: '#66F0FF', 
  primary: '#5CFFF0',
  lime: '#9BFF93',
};

// Export default theme (dark-first)
export const DEFAULT_THEME = THEME_COLORS.dark;