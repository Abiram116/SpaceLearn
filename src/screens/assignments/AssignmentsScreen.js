import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../styles/theme';

const AssignmentsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Assignments Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  text: {
    fontSize: 18,
    color: colors.textSecondary,
  },
});

export default AssignmentsScreen; 