import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing } from '../styles/globalStyles';

const EditNoteScreen = ({ route, navigation }) => {
  const { noteId } = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (noteId) {
      // TODO: Fetch note data from Supabase
      // For now, we'll just set a placeholder
      setTitle('Note Title');
      setContent('Note content goes here...');
    }
  }, [noteId]);

  const handleSave = async () => {
    try {
      // TODO: Save note to Supabase
      navigation.goBack();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.content}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Note Title"
          placeholderTextColor={colors.textSecondary}
        />
        <TextInput
          style={styles.contentInput}
          value={content}
          onChangeText={setContent}
          placeholder="Start typing your note..."
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
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
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 8,
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

export default EditNoteScreen; 