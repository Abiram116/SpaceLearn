import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';

/**
 * Input component with support for labels, errors, and icons
 *
 * @param {Object} props Component props
 * @param {string} [props.label] - Input label text 
 * @param {string} [props.placeholder] - Input placeholder text
 * @param {string} [props.value] - Input value
 * @param {Function} [props.onChangeText] - Function to call when text changes
 * @param {string} [props.error] - Error message to display
 * @param {boolean} [props.secureTextEntry] - Whether to hide input text
 * @param {React.ReactNode} [props.leftIcon] - Icon to display on the left side of input
 * @param {React.ReactNode} [props.rightIcon] - Icon to display on the right side of input
 * @param {Function} [props.onRightIconPress] - Function to call when right icon is pressed
 * @param {Object} [props.style] - Additional styles for the input container
 * @param {Object} [props.inputStyle] - Additional styles for the TextInput
 */
const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (props.onBlur) props.onBlur();
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.focused,
        error && styles.error
      ]}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    minHeight: 48,
  },
  focused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  error: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  leftIcon: {
    paddingLeft: spacing.md,
  },
  rightIcon: {
    paddingRight: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  }
});

export default Input; 