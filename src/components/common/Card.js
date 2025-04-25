import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, borderRadius, shadows } from '../../styles/theme';

const Card = ({ children, style, ...props }) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
    overflow: 'hidden',
  },
});

export default Card; 