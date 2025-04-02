import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getUserAssignments } from '../services/assignmentService';

const AssignmentsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSpaces, setExpandedSpaces] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAssignments();
    
    // Refresh assignments when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', fetchAssignments);
    return unsubscribe;
  }, [navigation]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await getUserAssignments();
      
      // Group assignments by spaces and subjects
      const groupedData = groupAssignmentsBySpaceAndSubject(data);
      setAssignments(groupedData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      Alert.alert('Error', 'Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const groupAssignmentsBySpaceAndSubject = (data) => {
    const grouped = {};
    
    data.forEach(assignment => {
      if (!assignment.subjects || !assignment.subjects.spaces) {
        console.warn('Missing data in assignment:', assignment);
        return;
      }
      
      const spaceName = assignment.subjects.spaces.name;
      const spaceId = assignment.subjects.spaces.id;
      const subjectName = assignment.subjects.name;
      const subjectId = assignment.subjects.id;
      
      if (!grouped[spaceId]) {
        grouped[spaceId] = {
          id: spaceId,
          name: spaceName,
          subjects: {}
        };
      }
      
      if (!grouped[spaceId].subjects[subjectId]) {
        grouped[spaceId].subjects[subjectId] = {
          id: subjectId,
          name: subjectName,
          subspaces: {}
        };
      }
      
      if (!grouped[spaceId].subjects[subjectId].subspaces[assignment.subspace_name]) {
        grouped[spaceId].subjects[subjectId].subspaces[assignment.subspace_name] = {
          name: assignment.subspace_name,
          id: assignment.id,
          questions: assignment.questions
        };
      }
    });
    
    // Convert to array format for FlatList
    return Object.values(grouped).map(space => ({
      ...space,
      subjects: Object.values(space.subjects).map(subject => ({
        ...subject,
        subspaces: Object.values(subject.subspaces)
      }))
    }));
  };

  const toggleSpace = (spaceId) => {
    setExpandedSpaces(prev => ({
      ...prev,
      [spaceId]: !prev[spaceId]
    }));
  };

  const handleDifficultyPress = (subspaceId, difficulty) => {
    navigation.navigate('AssignmentQuiz', {
      subspaceId,
      difficulty
    });
  };

  const renderDifficultyButton = (subspaceId, difficulty) => {
    const colors = {
      easy: '#4CAF50',
      medium: '#FFA000',
      hard: '#F44336'
    };

    return (
      <TouchableOpacity
        style={[styles.difficultyButton, { backgroundColor: colors[difficulty] }]}
        onPress={() => handleDifficultyPress(subspaceId, difficulty)}
      >
        <Text style={styles.difficultyText}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
      </TouchableOpacity>
    );
  };

  const renderSubspace = ({ item }) => (
    <View style={[styles.subspaceContainer, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.subspaceName, { color: theme.colors.text }]}>{item.name}</Text>
      <View style={styles.difficultyContainer}>
        {renderDifficultyButton(item.id, 'easy')}
        {renderDifficultyButton(item.id, 'medium')}
        {renderDifficultyButton(item.id, 'hard')}
      </View>
    </View>
  );

  const renderSubject = ({ item: subject }) => (
    <View style={[styles.subjectContainer, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.subjectName, { color: theme.colors.text }]}>{subject.name}</Text>
      <FlatList
        data={subject.subspaces}
        renderItem={renderSubspace}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
      />
    </View>
  );

  const renderSpace = ({ item: space }) => (
    <View style={[styles.spaceContainer, { backgroundColor: theme.colors.card }]}>
      <TouchableOpacity
        style={[styles.spaceHeader, { backgroundColor: theme.colors.background }]}
        onPress={() => toggleSpace(space.id)}
      >
        <Text style={[styles.spaceName, { color: theme.colors.text }]}>{space.name}</Text>
        <Ionicons
          name={expandedSpaces[space.id] ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={theme.colors.text}
        />
      </TouchableOpacity>
      {expandedSpaces[space.id] && (
        <FlatList
          data={space.subjects}
          renderItem={renderSubject}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (assignments.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>No assignments available</Text>
        <Text style={[styles.subText, { color: theme.colors.textSecondary }]}>
          Go to a chat and click the assignment button to generate questions
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={assignments}
        renderItem={renderSpace}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchAssignments();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
  },
  spaceContainer: {
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  spaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  spaceName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subjectContainer: {
    padding: 15,
    borderBottomWidth: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subspaceContainer: {
    marginVertical: 8,
    padding: 10,
    borderRadius: 8,
  },
  subspaceName: {
    fontSize: 15,
    marginBottom: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  difficultyText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AssignmentsScreen; 