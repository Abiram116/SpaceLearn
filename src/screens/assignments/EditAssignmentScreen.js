import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { colors, spacing } from '../../styles/theme';

const EditAssignmentScreen = ({ route, navigation }) => {
  const { assignmentId } = route.params;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');

  useEffect(() => {
    if (assignmentId) {
      // TODO: Fetch assignment data from Supabase
      // For now, we'll just set placeholders
      setTitle('Assignment Title');
      setDescription('Assignment description...');
      setDueDate('2024-02-10');
      setStatus('Pending');
    }
  }, [assignmentId]);

  const handleSave = async () => {
    try {
      // TODO: Save assignment to Supabase
      navigation.goBack();
    } catch (error) {
      console.error('Error saving assignment:', error);
    }
  };

  const statusOptions = ['Pending', 'Completed', 'Overdue'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Assignment Title"
          placeholderTextColor={colors.textSecondary}
        />

        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Assignment Description"
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
        />

        <TextInput
          style={styles.dateInput}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="Due Date (YYYY-MM-DD)"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusContainer}>
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.statusOption,
                status === option && styles.statusOptionSelected,
              ]}
              onPress={() => setStatus(option)}
            >
              <Text
                style={[
                  styles.statusText,
                  status === option && styles.statusTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  descriptionInput: {
    height: 120,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  dateInput: {
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statusOption: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statusOptionSelected: {
    backgroundColor: colors.primary,
  },
  statusText: {
    color: colors.text,
    fontSize: 14,
  },
  statusTextSelected: {
    color: colors.card,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditAssignmentScreen; 