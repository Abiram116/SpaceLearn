import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const window = Dimensions.get('window');

export const colors = {
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  secondary: '#10B981',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  overlay: 'rgba(0, 0, 0, 0.5)',
  ripple: 'rgba(108, 99, 255, 0.1)',

  // Dark mode colors
  dark: {
    background: '#1A1A1A',
    card: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#404040',
    primary: '#6C63FF', // Keep primary color same for dark mode
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  contentHorizontal: Platform.OS === 'ios' ? 20 : 16,
  contentVertical: Platform.OS === 'ios' ? 24 : 20,
  screenPadding: Platform.select({
    ios: {
      paddingHorizontal: 20,
      paddingTop: 44,
      paddingBottom: 34,
    },
    android: {
      paddingHorizontal: 16,
      paddingTop: StatusBar.currentHeight,
      paddingBottom: 24,
    },
  }),
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};

export const layout = {
  window: {
    width: window.width,
    height: window.height,
  },
  statusBarHeight: Platform.OS === 'ios' ? 44 : 0,
  bottomSpacing: Platform.OS === 'ios' ? 34 : 16,
  isSmallDevice: window.width < 375,
  headerHeight: Platform.OS === 'ios' ? 88 : 64,
  safeAreaPadding: {
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
};

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

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const buttons = {
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    ...shadows.small,
  },
  secondary: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
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
};

export const inputs = {
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.text,
    minHeight: Platform.OS === 'ios' ? 44 : 40,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: Platform.OS === 'ios' ? 22 : undefined,
  },
  textInputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  },
};

export const cards = {
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
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