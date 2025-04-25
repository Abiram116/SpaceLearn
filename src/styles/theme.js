import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const window = Dimensions.get('window');

export const colors = {
  // Primary colors with a more modern purple gradient
  primary: '#6366F1', // Indigo
  primaryDark: '#4F46E5', // Darker indigo
  primaryLight: '#EEF2FF', // Light indigo background
  secondary: '#10B981', // Emerald
  secondaryLight: '#D1FAE5', // Light emerald background
  
  // Enhanced UI colors
  background: '#F9FAFB', // Slightly off-white for better contrast
  card: '#FFFFFF',
  text: '#111827', // Near black
  textSecondary: '#6B7280', // Medium gray
  textLight: '#9CA3AF', // Lighter gray for tertiary text
  border: '#E5E7EB',
  
  // Status colors
  error: '#EF4444', // Red
  errorLight: '#FEE2E2', // Light red background
  success: '#10B981', // Green
  successLight: '#D1FAE5', // Light green background
  warning: '#F59E0B', // Amber
  warningLight: '#FEF3C7', // Light amber background
  info: '#3B82F6', // Blue
  infoLight: '#DBEAFE', // Light blue background
  
  // UI elements
  overlay: 'rgba(0, 0, 0, 0.5)',
  ripple: 'rgba(99, 102, 241, 0.1)',
  inputBackground: '#F9FAFB',
  divider: '#E5E7EB',
  inactive: '#D1D5DB',
  highlight: '#818CF8', // Light indigo for highlights
  
  // Dark mode colors - enhanced
  dark: {
    background: '#111827', // Dark gray/blue
    card: '#1F2937', // Slightly lighter dark gray
    text: '#F9FAFB', // Off white
    textSecondary: '#9CA3AF', // Medium gray
    textLight: '#6B7280', // Darker gray for tertiary text (dark mode)
    border: '#374151', // Medium dark gray
    inputBackground: '#1F2937', // Slightly lighter than background
    divider: '#374151',
    inactive: '#4B5563',
    primary: '#818CF8', // Lighter indigo for dark mode
    primaryDark: '#6366F1',
    primaryLight: '#312E81',
  },
};

// Updated spacing system with more precision
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Common layout patterns
export const layout = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  screenPadding: {
    paddingHorizontal: spacing.lg,
  },
};

// Enhanced typography system with font weights
export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: 0.25,
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 30,
    letterSpacing: 0,
    color: colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: 0.15,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.15,
    color: colors.text,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.15,
    color: colors.text,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.5,
    color: colors.text,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.25,
    color: colors.textSecondary,
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.25,
    color: colors.textSecondary,
  },
};

// Enhanced input styles
export const inputs = {
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.label,
    marginBottom: spacing.xxs,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.xs,
  },
};

// Enhanced shadow system for better depth perception
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {
      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
    },
  }),
};

// Enhanced border radius system
export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

// Enhanced button styles
export const buttons = {
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiary: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextSecondary: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextTertiary: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    marginRight: spacing.xs,
  },
};

// Enhanced card styles
export const cards = {
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...shadows.medium,
  },
  flat: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  interactive: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...shadows.medium,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  content: {
    ...typography.body,
  },
  footer: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerImage: {
    height: 150,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
};

export default StyleSheet.create({
  container: layout.container,
  section: layout.section,
  row: layout.row,
  center: layout.center,
  ...typography,
  ...buttons,
  ...inputs,
  ...cards,
}); 