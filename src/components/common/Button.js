import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  ActivityIndicator,
  View
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../styles/theme';

const Button = ({
  title,
  onPress,
  type = 'primary',
  style,
  textStyle,
  isLoading = false,
  disabled = false,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    type === 'primary' ? styles.primary : styles.secondary,
    disabled && styles.disabled,
    style,
  ];

  const textStyleComp = [
    styles.text,
    type === 'primary' ? styles.primaryText : styles.secondaryText,
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={type === 'primary' ? colors.background : colors.primary} 
          size="small" 
        />
      ) : (
        <Text style={textStyleComp}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.border,
    borderColor: colors.border,
    opacity: 0.7,
  },
  text: {
    ...typography.button,
    fontSize: 16,
  },
  primaryText: {
    color: colors.background,
  },
  secondaryText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.textSecondary,
  },
});

export default Button; 