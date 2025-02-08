import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius, layout } from '../../styles/theme';
import { subjectService } from '../../services/subjectService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button as WebButton } from 'react-native';

const SubjectsScreen = ({ navigation }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [newSubspaceName, setNewSubspaceName] = useState('');
  const [subspaces, setSubspaces] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const insets = useSafeAreaInsets();
  const safeAreaInsets = {
    top: insets?.top || Platform.OS === 'ios' ? 44 : 0,
    bottom: insets?.bottom || Platform.OS === 'ios' ? 34 : 0,
  };
  const inputRef = useRef(null);
  const subspaceInputRef = useRef(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
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
    setDeleteTarget({ type: 'subject', id });
    setShowDeleteModal(true);
  };

  const handleDeleteSubspace = async (subjectId, subspaceId) => {
    setDeleteTarget({ type: 'subspace', subjectId, subspaceId });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      // Immediately hide modal
      setShowDeleteModal(false);
      
      // Optimistically update UI
      if (deleteTarget.type === 'subject') {
        setSubjects(prev => prev.filter(s => s.id !== deleteTarget.id));
      } else if (deleteTarget.type === 'subspace') {
        setSubspaces(prev => ({
          ...prev,
          [deleteTarget.subjectId]: prev[deleteTarget.subjectId].filter(s => s.id !== deleteTarget.subspaceId)
        }));
      }

      // Clear delete target
      setDeleteTarget(null);

      // Handle API call in background
      try {
        if (deleteTarget.type === 'subject') {
          await subjectService.deleteSubject(deleteTarget.id);
        } else if (deleteTarget.type === 'subspace') {
          await subjectService.deleteSubspace(deleteTarget.subspaceId);
        }
      } catch (error) {
        // If API call fails, show error and revert the change
        Alert.alert('Error', 'Failed to delete. Please try again.');
        if (deleteTarget.type === 'subject') {
          loadSubjects(); // Reload the full list to revert changes
        } else {
          loadSubspaces(deleteTarget.subjectId); // Reload just the affected subspace
        }
      }
    }
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
      setTimeout(() => {
        if (subspaceInputRef.current) {
          subspaceInputRef.current.focus();
        }
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to create subspace');
    }
  };

  const handleSubspacePress = (subspace, subject) => {
    navigation.navigate('Subspace', {
      subspaceId: subspace.id,
      subspaceName: subspace.name,
      subjectName: subject.name
    });
  };

  const renderSubject = ({ item }) => (
    <Card style={styles.subjectCard}>
      <View style={styles.subjectHeader}>
        {editingSubject?.id === item.id ? (
          <TextInput
            ref={inputRef}
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
            <TouchableOpacity
              key={subspace.id}
              style={styles.subspaceItem}
              onPress={() => handleSubspacePress(subspace, item)}
              activeOpacity={0.7}
            >
              <View style={styles.subspaceContent}>
                <Ionicons name="bookmark-outline" size={16} color={colors.primary} />
                <Text style={styles.subspaceName}>{subspace.name}</Text>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteSubspace(item.id, subspace.id);
                }}
                style={styles.actionButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <View style={styles.addSubspaceContainer}>
            <TextInput
              ref={subspaceInputRef}
              style={[styles.subspaceInput, styles.focusedInput]}
              placeholder="New subspace name"
              value={newSubspaceName}
              onChangeText={setNewSubspaceName}
              onSubmitEditing={() => handleCreateSubspace(item.id)}
              placeholderTextColor={colors.textSecondary}
              returnKeyType="done"
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.container}>
          <View style={[styles.header, { paddingTop: safeAreaInsets.top }]}>
            <Text style={styles.headerTitle}>Your Subjects</Text>
            <Text style={styles.headerSubtitle}>Create and organize your learning spaces</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
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

        <Modal
          visible={showDeleteModal}
          transparent
          animationType="none"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Deletion</Text>
              <Text style={styles.modalMessage}>Are you sure you want to delete this {deleteTarget?.type}?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.deleteButton]} 
                  onPress={confirmDelete}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.contentHorizontal,
    paddingTop: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    paddingBottom: spacing.lg,
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
    paddingHorizontal: spacing.contentHorizontal,
    paddingVertical: spacing.md,
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
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    marginRight: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    paddingHorizontal: spacing.contentHorizontal,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
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
    color: colors.text,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.sm,
    ...shadows.small,
  },
  focusedInput: {
    borderColor: colors.primary,
    borderWidth: 1,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    width: '80%',
    maxWidth: 300,
    ...shadows.large,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  deleteButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
});

export default SubjectsScreen; 