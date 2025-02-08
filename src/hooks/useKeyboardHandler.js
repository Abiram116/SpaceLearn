import { useEffect } from 'react';
import { Keyboard, Platform } from 'react-native';

export const useKeyboardHandler = (onKeyboardDismiss) => {
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        if (onKeyboardDismiss) {
          onKeyboardDismiss();
        }
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [onKeyboardDismiss]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return {
    dismissKeyboard,
  };
}; 