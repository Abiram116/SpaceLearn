import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../styles/theme';

/**
 * Card component that can be either static or interactive
 * 
 * @param {Object} props Component props
 * @param {string} [props.variant='elevated'] - Card variant (elevated, flat, interactive)
 * @param {Function} [props.onPress] - Function to call when card is pressed (makes card interactive)
 * @param {boolean} [props.noPadding=false] - Whether to remove padding
 * @param {Object} props.style - Additional styles for the card
 */
const Card = ({ 
  children, 
  variant = 'elevated',
  onPress, 
  noPadding = false,
  style, 
  ...props 
}) => {
  // Select styling based on variant
  const getCardStyle = () => {
    switch (variant) {
      case 'flat':
        return styles.flat;
      case 'interactive':
        return styles.interactive;
      default:
        return styles.elevated;
    }
  };

  const cardStyle = [
    styles.card,
    getCardStyle(),
    noPadding && styles.noPadding,
    style
  ];

  // If onPress is provided, make it a TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyle} 
        onPress={onPress} 
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Otherwise render as a View
  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  elevated: {
    ...shadows.medium,
  },
  flat: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  interactive: {
    ...shadows.small,
  },
  noPadding: {
    padding: 0,
  }
});

export default Card; 