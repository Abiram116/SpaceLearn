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
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius, layout } from '../../styles/theme';
import { subjectService } from '../../services/subjectService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button as WebButton } from 'react-native';
import { KeyboardAwareView } from '../../components/common/KeyboardAwareView';
import { Input } from '../../components/common/Input';
import AnimatedView from '../../components/common/AnimatedView';

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
  const [error, setError] = useState(null);
  const [loadingSubspaces, setLoadingSubspaces] = useState({});

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
    setError(null);
    try {
      setLoading(true);
      const data = await subjectService.getSubjects();
      setSubjects(data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError(error.message || 'Failed to load subjects');
      Alert.alert('Error', error.message || 'Failed to load subjects');
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
    setError(null);
    try {
      setLoadingSubspaces(prev => ({ ...prev, [subjectId]: true }));
      const data = await subjectService.getSubspaces(subjectId);
      setSubspaces(prev => ({ ...prev, [subjectId]: data }));
    } catch (error) {
      console.error('Error loading subspaces:', error);
      setError(error.message || 'Failed to load subspaces');
      Alert.alert('Error', error.message || 'Failed to load subspaces');
    } finally {
      setLoadingSubspaces(prev => ({ ...prev, [subjectId]: false }));
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return;
    
    setError(null);
    try {
      setLoading(true);
      const subject = await subjectService.createSubject(newSubjectName.trim());
      if (subject) {
        setSubjects(prev => [subject, ...prev]);
        setNewSubjectName('');
        dismissKeyboard();
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      setError(error.message || 'Failed to create subject');
      Alert.alert('Error', error.message || 'Failed to create subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubject = async (id, name) => {
    setError(null);
    try {
      const updated = await subjectService.updateSubject(id, name);
      setSubjects(prev => prev.map(s => s.id === id ? updated : s));
      setEditingSubject(null);
    } catch (error) {
      console.error('Error updating subject:', error);
      setError(error.message || 'Failed to update subject');
      Alert.alert('Error', error.message || 'Failed to update subject');
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
    
    setError(null);
    try {
      setLoadingSubspaces(prev => ({ ...prev, [subjectId]: true }));
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
      console.error('Error creating subspace:', error);
      setError(error.message || 'Failed to create subspace');
      Alert.alert('Error', error.message || 'Failed to create subspace');
    } finally {
      setLoadingSubspaces(prev => ({ ...prev, [subjectId]: false }));
    }
  };

  const handleSubspacePress = (subspace, subject) => {
    navigation.navigate('Subspace', {
      subspaceId: subspace.id,
      subjectId: subject.id,
      subspaceName: subspace.name,
      subjectName: subject.name
    });
  };

  const renderSubject = ({ item, index }) => (
    <AnimatedView animation="slide" delay={index * 100}>
      <TouchableOpacity 
        style={[
          styles.subjectCard,
          expandedSubject === item.id && styles.expandedCard
        ]}
        onPress={() => {
          setExpandedSubject(expandedSubject === item.id ? null : item.id);
          if (!subspaces[item.id]) {
            loadSubspaces(item.id);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.subjectHeader}>
          <View style={styles.subjectTitleContainer}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={expandedSubject === item.id ? 'book' : 'book-outline'}
                size={24}
                color={colors.primary}
              />
            </View>
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
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{item.name}</Text>
                <Text style={styles.timeSpent}>
                  {item.total_time_spent > 0 
                    ? `${Math.round(item.total_time_spent)} mins total`
                    : 'No time logged yet'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setEditingSubject({ id: item.id, name: item.name })}
            >
              <Ionicons name="pencil" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteSubject(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
            <Ionicons
              name={expandedSubject === item.id ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </View>

        {expandedSubject === item.id && (
          <View style={styles.subspaceContainer}>
            {loadingSubspaces[item.id] ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : (
              <>
                {subspaces[item.id]?.map((subspace, subspaceIndex) => (
                  <TouchableOpacity
                    key={subspace.id}
                    style={styles.subspaceCard}
                    onPress={() => handleSubspacePress(subspace, item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.subspaceContent}>
                      <View style={styles.subspaceTitleContainer}>
                        <Ionicons name="cube-outline" size={20} color={colors.primary} />
                        <View style={styles.subspaceInfo}>
                          <Text style={styles.subspaceName}>{subspace.name}</Text>
                          <Text style={styles.subspaceTimeSpent}>
                            {subspace.total_time_spent > 0 
                              ? `${Math.round(subspace.total_time_spent)} mins spent`
                              : 'No time logged yet'}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteSubspace}
                        onPress={() => handleDeleteSubspace(item.id, subspace.id)}
                      >
                        <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
                
                <View style={styles.addSubspaceContainer}>
                  <TextInput
                    ref={subspaceInputRef}
                    style={styles.subspaceInput}
                    placeholder="Add new subspace..."
                    placeholderTextColor={colors.textTertiary}
                    value={newSubspaceName}
                    onChangeText={setNewSubspaceName}
                    onSubmitEditing={() => handleCreateSubspace(item.id)}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addSubspaceButton,
                      !newSubspaceName.trim() && styles.disabledButton
                    ]}
                    onPress={() => handleCreateSubspace(item.id)}
                    disabled={!newSubspaceName.trim()}
                  >
                    <Ionicons name="add" size={24} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    </AnimatedView>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAwareView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.addSubjectContainer, { marginTop: safeAreaInsets.top + spacing.md }]}>
          <TextInput
            style={styles.addSubjectInput}
            placeholder="Add new subject..."
            placeholderTextColor={colors.textTertiary}
            value={newSubjectName}
            onChangeText={setNewSubjectName}
            onSubmitEditing={handleCreateSubject}
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              !newSubjectName.trim() && styles.disabledButton
            ]}
            onPress={handleCreateSubject}
            disabled={!newSubjectName.trim()}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={subjects}
            renderItem={renderSubject}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="library-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No subjects yet</Text>
                <Text style={styles.emptySubtext}>Add your first subject to start learning</Text>
              </View>
            }
          />
        )}
      </View>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
            </Text>
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
        </TouchableOpacity>
      </Modal>
    </KeyboardAwareView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  addSubjectContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  addSubjectInput: {
    flex: 1,
    height: 50,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    ...typography.body,
    color: colors.text,
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  subjectCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
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
  expandedCard: {
    backgroundColor: colors.cardSelected,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  subjectTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  timeSpent: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
  editInput: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    padding: 0,
  },
  subspaceContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  subspaceCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  subspaceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  subspaceTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  subspaceInfo: {
    flex: 1,
  },
  subspaceName: {
    ...typography.body,
    color: colors.text,
  },
  deleteSubspace: {
    padding: spacing.xs,
  },
  addSubspaceContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  subspaceInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  addSubspaceButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.h2,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  modalButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  cancelButton: {
    backgroundColor: colors.cardSelected,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text,
  },
  deleteButtonText: {
    ...typography.button,
    color: colors.white,
  },
  loader: {
    marginTop: spacing.xl,
  },
  subspaceTimeSpent: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
});

export default SubjectsScreen; 