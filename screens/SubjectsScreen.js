import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../styles/globalStyles';
import { subjectService } from '../services/subjectService';
import Card from '../components/Card';
import Button from '../components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SubjectsScreen = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [newSubspaceName, setNewSubspaceName] = useState('');
  const [subspaces, setSubspaces] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await subjectService.getSubjects();
      setSubjects(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load subjects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSubjects();
  };

  const loadSubspaces = async (subjectId) => {
    try {
      const data = await subjectService.getSubspaces(subjectId);
      setSubspaces(prev => ({ ...prev, [subjectId]: data }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load subspaces');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return;
    
    setLoading(true);
    try {
      const subject = await subjectService.createSubject(newSubjectName.trim());
      if (subject) {
        setSubjects(prev => [subject, ...prev]);
        setNewSubjectName('');
        dismissKeyboard();
      } else {
        throw new Error('Failed to create subject');
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      Alert.alert('Error', 'Failed to create subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubject = async (id, name) => {
    try {
      const updated = await subjectService.updateSubject(id, name);
      setSubjects(prev => prev.map(s => s.id === id ? updated : s));
      setEditingSubject(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update subject');
    }
  };

  const handleDeleteSubject = async (id) => {
    Alert.alert(
      'Delete Subject',
      'Are you sure you want to delete this subject? This will also delete all subspaces.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await subjectService.deleteSubject(id);
              setSubjects(prev => prev.filter(s => s.id !== id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete subject');
            }
          }
        }
      ]
    );
  };

  const handleCreateSubspace = async (subjectId) => {
    if (!newSubspaceName.trim()) return;
    try {
      const subspace = await subjectService.createSubspace(subjectId, newSubspaceName.trim());
      setSubspaces(prev => ({
        ...prev,
        [subjectId]: [...(prev[subjectId] || []), subspace]
      }));
      setNewSubspaceName('');
    } catch (error) {
      Alert.alert('Error', 'Failed to create subspace');
    }
  };

  const handleDeleteSubspace = async (subjectId, subspaceId) => {
    Alert.alert(
      'Delete Subspace',
      'Are you sure you want to delete this subspace?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await subjectService.deleteSubspace(subspaceId);
              setSubspaces(prev => ({
                ...prev,
                [subjectId]: prev[subjectId].filter(s => s.id !== subspaceId)
              }));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete subspace');
            }
          }
        }
      ]
    );
  };

  const renderSubject = ({ item }) => (
    <Card style={styles.subjectCard}>
      <View style={styles.subjectHeader}>
        {editingSubject?.id === item.id ? (
          <TextInput
            style={styles.editInput}
            value={editingSubject.name}
            onChangeText={(text) => setEditingSubject({ ...editingSubject, name: text })}
            onBlur={() => handleUpdateSubject(item.id, editingSubject.name)}
            autoFocus
          />
        ) : (
          <TouchableOpacity 
            style={styles.subjectTitle}
            onPress={() => {
              setExpandedSubject(expandedSubject === item.id ? null : item.id);
              if (!subspaces[item.id]) {
                loadSubspaces(item.id);
              }
            }}
          >
            <Ionicons
              name={expandedSubject === item.id ? 'chevron-down' : 'chevron-forward'}
              size={24}
              color={colors.primary}
            />
            <Text style={styles.subjectName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => setEditingSubject({ id: item.id, name: item.name })}
            style={styles.actionButton}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteSubject(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {expandedSubject === item.id && (
        <View style={styles.subspacesContainer}>
          {subspaces[item.id]?.map(subspace => (
            <View key={subspace.id} style={styles.subspaceItem}>
              <View style={styles.subspaceContent}>
                <Ionicons name="bookmark-outline" size={16} color={colors.primary} />
                <Text style={styles.subspaceName}>{subspace.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteSubspace(item.id, subspace.id)}
                style={styles.actionButton}
              >
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.addSubspaceContainer}>
            <TextInput
              style={styles.subspaceInput}
              placeholder="New subspace name"
              value={newSubspaceName}
              onChangeText={setNewSubspaceName}
              onSubmitEditing={() => handleCreateSubspace(item.id)}
              placeholderTextColor={colors.textSecondary}
            />
            <Button
              title="Add"
              onPress={() => handleCreateSubspace(item.id)}
              variant="outline"
              size="small"
            />
          </View>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <Text style={styles.headerTitle}>Your Subjects</Text>
            <Text style={styles.headerSubtitle}>Create and organize your learning spaces</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter new subject name"
              value={newSubjectName}
              onChangeText={setNewSubjectName}
              onSubmitEditing={handleCreateSubject}
              placeholderTextColor={colors.textSecondary}
              returnKeyType="done"
              blurOnSubmit={true}
            />
            <Button
              title="Create"
              onPress={handleCreateSubject}
              disabled={!newSubjectName.trim() || loading}
              loading={loading}
              style={styles.createButton}
            />
          </View>

          {subjects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="library-outline" 
                size={64} 
                color={colors.primary} 
                style={styles.emptyIcon} 
              />
              <Text style={styles.emptyText}>No subjects yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first subject to get started!
              </Text>
            </View>
          ) : (
            <FlatList
              data={subjects}
              renderItem={renderSubject}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    ...typography.body,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginRight: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    padding: spacing.md,
  },
  subjectCard: {
    marginBottom: spacing.md,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectName: {
    ...typography.h3,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: spacing.sm,
  },
  editInput: {
    flex: 1,
    ...typography.h3,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    marginRight: spacing.md,
  },
  subspacesContainer: {
    marginTop: spacing.md,
    paddingLeft: spacing.xl,
  },
  subspaceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  subspaceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subspaceName: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  addSubspaceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  subspaceInput: {
    flex: 1,
    ...typography.body,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  createButton: {
    minWidth: 100,
  },
});

export default SubjectsScreen; 