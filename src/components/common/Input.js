import React, { forwardRef } from 'react';
import { TextInput, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/theme';

export const Input = forwardRef(({
  icon,
  style,
  containerStyle,
  error,
  multiline = false,
  ...props
}, ref) => {
  return (
    <View style={[styles.container, error && styles.errorContainer, containerStyle]}>
      {icon && (
        <Ionicons 
          name={icon} 
          size={20} 
          color={error ? colors.error : colors.textSecondary} 
          style={styles.icon}
        />
      )}
      {Platform.OS === 'web' ? (
        <input
          ref={ref}
          style={{
            flex: 1,
            border: 'none',
            backgroundColor: 'transparent',
            color: colors.text,
            fontSize: '16px',
            padding: `${spacing.sm}px`,
            width: '100%',
            outline: 'none',
            minHeight: '40px',
            fontFamily: 'inherit',
          }}
          placeholder={props.placeholder}
          value={props.value}
          onChange={(e) => props.onChangeText?.(e.target.value)}
          type={props.secureTextEntry ? 'password' : 'text'}
          autoCapitalize={props.autoCapitalize}
          {...props}
        />
      ) : (
        <TextInput
          ref={ref}
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            multiline && styles.multilineInput,
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    minHeight: Platform.OS === 'ios' ? 56 : 48,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  errorContainer: {
    borderColor: colors.error,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    minHeight: Platform.OS === 'ios' ? 44 : 40,
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: Platform.OS === 'ios' ? 22 : undefined,
  },
  inputWithIcon: {
    marginLeft: 0,
  },
  multilineInput: {
    minHeight: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    textAlignVertical: 'top',
  },
}); 