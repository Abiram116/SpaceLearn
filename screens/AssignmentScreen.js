import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AssignmentCard from '../components/AssignmentCard';
import { Ionicons } from '@expo/vector-icons';

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
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default AssignmentScreen; 