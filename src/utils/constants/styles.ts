/**
 * NativeWind utility classes for universal mobile app
 * Contains commonly used class combinations for consistent styling
 */

// Basic containers with light/dark mode support
export const containers = {
  screen: 'flex-1 bg-white dark:bg-gray-900',
  safeScreen: 'flex-1 bg-white dark:bg-gray-900 pt-safe',
  modal: 'flex-1 bg-white dark:bg-gray-800 rounded-t-3xl px-6 pt-6',
  card: 'bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm',
  cardBordered:
    'bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700',
};

// Universal gray theme colors
export const colors = {
  primary: 'bg-primary dark:bg-primary-400',
  primaryLight: 'bg-primary-100 dark:bg-primary-800',
  primaryDark: 'bg-primary-600 dark:bg-primary-300',
  textPrimary: 'text-primary dark:text-primary-300',
  textWhite: 'text-white dark:text-white',
  textSecondary: 'text-gray-600 dark:text-gray-300',
  textMuted: 'text-gray-400 dark:text-gray-500',
};

// Button styles with light/dark mode support
export const buttons = {
  primary:
    'bg-primary dark:bg-primary-400 active:bg-primary-600 dark:active:bg-primary-300 items-center justify-center rounded-xl px-6 py-3 min-h-touch',
  secondary:
    'bg-gray-100 dark:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 items-center justify-center rounded-xl px-6 py-3 min-h-touch',
  outline:
    'border-2 border-primary dark:border-primary-400 bg-transparent active:bg-primary/10 dark:active:bg-primary/20 items-center justify-center rounded-xl px-6 py-3 min-h-touch',
  ghost:
    'bg-transparent active:bg-primary/10 dark:active:bg-primary/20 items-center justify-center rounded-xl px-4 py-2',
};

// Text styles with light/dark mode support
export const text = {
  heading1: 'text-3xl font-bold text-gray-800 dark:text-gray-100',
  heading2: 'text-2xl font-bold text-gray-800 dark:text-gray-100',
  heading3: 'text-xl font-semibold text-gray-700 dark:text-gray-200',
  body: 'text-base text-gray-600 dark:text-gray-300',
  small: 'text-sm text-gray-500 dark:text-gray-400',
  caption: 'text-xs text-gray-400 dark:text-gray-500',
  buttonPrimary: 'text-white dark:text-white font-semibold text-base',
  buttonSecondary: 'text-gray-700 dark:text-gray-200 font-medium text-base',
  buttonOutline: 'text-primary dark:text-primary-300 font-semibold text-base',
};

// Layouty
export const layouts = {
  centerContent: 'flex-1 items-center justify-center',
  spaceBetween: 'flex-row items-center justify-between',
  row: 'flex-row items-center',
  column: 'flex-col',
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },
};

// Spacing (pro konzistentní paddiny a marginy)
export const spacing = {
  screen: 'px-6 py-4',
  modal: 'px-6 pt-6 pb-8',
  card: 'p-4',
  button: 'px-6 py-3',
  tight: 'px-4 py-2',
};

// Form elements with light/dark mode support
export const forms = {
  input:
    'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-700 dark:text-gray-200 focus:border-primary dark:focus:border-primary-400',
  inputError:
    'bg-white dark:bg-gray-800 border border-error rounded-xl px-4 py-3 text-base text-gray-700 dark:text-gray-200',
  label: 'text-sm font-medium text-gray-700 dark:text-gray-200 mb-2',
  errorText: 'text-sm text-error mt-1',
  helperText: 'text-sm text-gray-500 dark:text-gray-400 mt-1',
};

// Shadows
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  card: 'shadow-lg shadow-black/5',
};

// Generic app components with light/dark mode support
export const components = {
  featureCard:
    'bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-l-primary dark:border-l-primary-400 shadow-sm',
  progressBar: 'bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden',
  progressFill: 'bg-primary dark:bg-primary-400 h-full rounded-full',
  badge: 'bg-primary-100 dark:bg-primary-800 rounded-full px-3 py-1',
  highlightCard:
    'bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700 rounded-xl p-4',
};
