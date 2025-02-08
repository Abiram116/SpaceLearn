import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

export const colors = {
  primary: '#6C63FF',
  secondary: '#4CAF50',
  background: '#FFFFFF',
  card: '#F8F9FA',
  text: '#2D3748',
  textSecondary: '#718096',
  border: '#E2E8F0',
  error: '#FF5252',
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
  overlay: 'rgba(0, 0, 0, 0.5)',
  ripple: 'rgba(108, 99, 255, 0.1)',
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
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
  },
};

export const layout = {
  window: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  isSmallDevice: Dimensions.get('window').width < 375,
  statusBarHeight: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
  headerHeight: Platform.OS === 'ios' ? 88 : 64,
  bottomSpacing: Platform.OS === 'ios' ? 34 : 24,
  safeAreaPadding: {
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
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