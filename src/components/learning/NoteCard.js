import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, shadows, borderRadius, typography, spacing } from '../../styles/theme';

const NoteCard = ({ title, preview, date, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.preview} numberOfLines={2}>
          {preview}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    ...shadows.small,
  },
  container: {
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  preview: {
    ...typography.body,
    color: colors.textSecondary,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
    alignSelf: 'flex-end',
  },
});

export default NoteCard; 