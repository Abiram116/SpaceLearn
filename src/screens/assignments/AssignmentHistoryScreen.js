import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { getUserAssignments } from '../../services/assignmentService';
import { colors, spacing } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

const AssignmentHistoryScreen = ({ navigation }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await getUserAssignments();
      setAssignments(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load your assignments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderAssignmentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.assignmentCard}
      onPress={() => navigation.navigate('AssignmentDetails', { assignment: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.assignmentTitle}>{item.title || item.subspace_name}</Text>
        <Text style={styles.dateText}>
          {format(new Date(item.created_at), 'MMM d, yyyy')}
        </Text>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.subjectName}>{item.subjects.name}</Text>
        <Text style={styles.questionCount}>
          {item.questions.length} Questions
        </Text>
      </View>
      
      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => navigation.navigate('AssignmentQuiz', { assignmentId: item.id })}
        >
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assignment History</Text>
      </View>
      
      {assignments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No assignments yet</Text>
          <Text style={styles.emptySubtext}>
            Create an assignment from the Assignments tab
          </Text>
        </View>
      ) : (
        <FlatList
          data={assignments}
          renderItem={renderAssignmentItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  list: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  assignmentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardBody: {
    marginBottom: spacing.md,
  },
  subjectName: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  questionCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  startButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default AssignmentHistoryScreen; 