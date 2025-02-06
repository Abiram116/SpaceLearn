import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const SubspaceScreen = ({ route, navigation }) => {
  const { subspaceId, subspaceName, subjectName } = route.params;
  const insets = useSafeAreaInsets();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: subspaceName,
      headerRight: () => (
        <View style={styles.headerRight}>
          <Text style={styles.subjectName}>{subjectName}</Text>
        </View>
      ),
    });
  }, [navigation, subspaceName, subjectName]);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Ionicons name="bookmark" size={24} color={colors.primary} />
        <Text style={styles.title}>{subspaceName}</Text>
      </View>
      
      {/* Content will be added here in future updates */}
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Start adding content to your subspace!</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  headerRight: {
    marginRight: spacing.md,
  },
  subjectName: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default SubspaceScreen; 