import React from 'react';
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { colors } from '../../styles/theme';
import { useKeyboardHandler } from '../../hooks/useKeyboardHandler';

export const KeyboardAwareView = ({
  children,
  style,
  keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  enabled = true,
  containerStyle,
}) => {
  const { dismissKeyboard } = useKeyboardHandler();

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
      <KeyboardAvoidingView
        behavior={behavior}
        style={[styles.container, style]}
        keyboardVerticalOffset={keyboardVerticalOffset}
        enabled={enabled}
      >
        <View style={[styles.contentContainer, containerStyle]}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
}); 