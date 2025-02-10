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
  secureTextEntry,
  onChangeText,
  onSubmitEditing,
  keyboardType,
  returnKeyType,
  blurOnSubmit,
  ...props
}, ref) => {
  const handleChange = (e) => {
    if (Platform.OS === 'web') {
      onChangeText?.(e.target.value);
    }
  };

  const handleKeyPress = (e) => {
    if (Platform.OS === 'web' && e.key === 'Enter' && onSubmitEditing) {
      e.preventDefault();
      onSubmitEditing();
    }
  };

  const getInputType = () => {
    if (secureTextEntry) return 'password';
    if (keyboardType === 'email-address') return 'email';
    if (keyboardType === 'number-pad') return 'number';
    return 'text';
  };

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
          type={getInputType()}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
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
          secureTextEntry={secureTextEntry}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
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