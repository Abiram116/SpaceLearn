import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  ActivityIndicator,
  View
} from 'react-native';
import { colors, shadows, borderRadius, spacing } from '../../styles/theme';

/**
 * Button component that supports multiple variants and states
 * @param {Object} props Component props
 * @param {string} [props.variant='primary'] - Button variant (primary, secondary, tertiary)
 * @param {string} [props.size='medium'] - Button size (small, medium, large)
 * @param {boolean} [props.fullWidth=false] - Whether button should take full width
 * @param {boolean} [props.isLoading=false] - Whether button is in loading state
 * @param {boolean} [props.disabled=false] - Whether button is disabled
 * @param {Function} props.onPress - Function to call when button is pressed
 * @param {Object} props.style - Additional styles for the button
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onPress, 
  style,
  ...props 
}) => {
  // Define button styles based on variant
  const getButtonStyle = () => {
    const baseStyle = { 
      ...styles.button,
      ...(fullWidth && styles.fullWidth)
    };

    // Add size styles
    if (size === 'small') baseStyle.style = { ...baseStyle.style, ...styles.small };
    if (size === 'large') baseStyle.style = { ...baseStyle.style, ...styles.large };

    // Add variant styles
    switch (variant) {
      case 'secondary':
        return { ...baseStyle, ...styles.secondary };
      case 'tertiary':
        return { ...baseStyle, ...styles.tertiary };
      default:
        return { ...baseStyle, ...styles.primary };
    }
  };

  // Define text styles based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'tertiary':
        return styles.tertiaryText;
      default:
        return styles.primaryText;
    }
  };

  // Define loader color based on variant
  const getLoaderColor = () => {
    return variant === 'primary' ? colors.card : colors.primary;
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getLoaderColor()} size="small" />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 100,
  },
  primary: {
    backgroundColor: colors.primary,
    ...shadows.small,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tertiary: {
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: colors.card,
  },
  secondaryText: {
    color: colors.primary,
  },
  tertiaryText: {
    color: colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    minWidth: 150,
  },
});

export default Button; 