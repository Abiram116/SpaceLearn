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
  Keyboard,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../styles/theme';
import { subjectService } from '../../services/subjectService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AssignmentsScreen = ({ navigation }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [subspaces, setSubspaces] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [loadingSubspaces, setLoadingSubspaces] = useState({});

  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadSubjects();
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

  const handleSubspacePress = (subspace, subject) => {
    navigation.navigate('Chat', {
      subspaceId: subspace.id,
      subjectId: subject.id,
      subspaceName: subspace.name,
      subjectName: subject.name,
      isAssignment: true
    });
  };

  const renderSubspace = ({ item, subject }) => (
    <TouchableOpacity
      style={styles.subspaceItem}
      onPress={() => handleSubspacePress(item, subject)}
    >
      <View style={styles.subspaceContent}>
        <Ionicons name="document-text-outline" size={20} color={colors.primary} />
        <Text style={styles.subspaceName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSubject = ({ item }) => (
    <View style={styles.subjectCard}>
      <TouchableOpacity 
        style={styles.subjectHeader}
        onPress={() => {
          setExpandedSubject(expandedSubject === item.id ? null : item.id);
          if (!subspaces[item.id]) {
            loadSubspaces(item.id);
          }
        }}
      >
        <View style={styles.subjectTitleContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={expandedSubject === item.id ? 'book' : 'book-outline'}
              size={24}
              color={colors.primary}
            />
          </View>
          <Text style={styles.subjectTitle}>{item.name}</Text>
        </View>
        <Ionicons
          name={expandedSubject === item.id ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {expandedSubject === item.id && (
        <View style={styles.subspacesList}>
          {loadingSubspaces[item.id] ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : subspaces[item.id]?.length > 0 ? (
            subspaces[item.id].map(subspace => (
              <View key={subspace.id}>
                {renderSubspace({ item: subspace, subject: item })}
              </View>
            ))
          ) : (
            <Text style={styles.noSubspacesText}>No topics available</Text>
          )}
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (subjects.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No assignments available</Text>
        <Text style={styles.emptySubtitle}>
          Select a subject and topic to create an assignment
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={subjects}
        renderItem={renderSubject}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
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
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  list: {
    padding: spacing.md,
  },
  subjectCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  subjectTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  subspacesList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  subspaceItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subspaceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subspaceName: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  noSubspacesText: {
    padding: spacing.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loader: {
    padding: spacing.md,
  },
});

export default AssignmentsScreen; 