import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows, borderRadius } from '../../styles/theme';
import AssignmentCard from '../../components/learning/AssignmentCard';

const assignments = [
  {
    id: '1',
    title: 'Math Homework - Chapter 5',
    dueDate: '2024-02-10',
    status: 'Pending',
  },
  {
    id: '2',
    title: 'Physics Lab Report',
    dueDate: '2024-02-08',
    status: 'Completed',
  },
  {
    id: '3',
    title: 'Chemistry Quiz',
    dueDate: '2024-02-01',
    status: 'Overdue',
  },
];

const AssignmentScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={assignments}
        renderItem={({ item }) => (
          <AssignmentCard
            title={item.title}
            dueDate={item.dueDate}
            status={item.status}
            onPress={() => navigation.navigate('EditAssignment', { assignmentId: item.id })}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EditAssignment', { assignmentId: null })}
      >
        <Ionicons name="add" size={24} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
});

export default AssignmentScreen; 