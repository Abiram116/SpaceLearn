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
import { useAuth } from '../context/AuthContext';
import { useSubspace } from '../context/SubspaceContext';
import { useChat } from '../context/ChatContext';
import { useLearningSession } from '../context/LearningSessionContext';
import { useFocusEffect } from '@react-navigation/native';
import ChatInput from '../components/ChatInput';
import { generateAssignment } from '../services/assignmentService';

const SubspaceScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const subspace = useSubspace();
  const { messages, sendMessage, loadMessages } = useChat();
  const { isLoading, startSession, endSession, sessionTime } = useLearningSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { subspaceName, subspaceDescription, subjectId } = route.params;

  useFocusEffect(
    React.useCallback(() => {
      if (subspace.id) {
        startSession(subspace.id);
        loadMessages(subspace.id);
      }
      return () => {
        endSession();
      };
    }, [subspace.id])
  );

  const handleSendMessage = async (content) => {
    try {
      await sendMessage(content, subspace.id);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadMessages(subspace.id);
    } catch (error) {
      console.error('Error refreshing messages:', error);
      Alert.alert('Error', 'Failed to refresh messages. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerateAssignment = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      await generateAssignment(subspaceName, subspaceDescription, subjectId);
      Alert.alert('Success', 'Assignment generated! Check your assignments tab.');
    } catch (error) {
      Alert.alert('Error', 'Could not generate assignment. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.is_ai ? styles.aiMessage : styles.userMessage
    ]}>
      <Text style={[
        styles.messageText,
        { color: item.is_ai ? theme.colors.text : '#FFFFFF' }
      ]}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {subspace.name}
          </Text>
          <View style={styles.timeRow}>
            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
              Total Time Spent: {sessionTime} minutes
            </Text>
          </View>
        </View>
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Start a conversation about {subspace.name}
            </Text>
          </View>
        }
      />
      <ChatInput
        onSendMessage={handleSendMessage}
        subspaceName={subspace.name}
        subspaceDescription={subspace.description}
        subjectId={subspace.subject_id}
      />
      
      {/* Add a floating action button for generating assignments */}
      <TouchableOpacity
        style={[
          styles.fabButton,
          isGenerating && styles.disabledButton
        ]}
        onPress={handleGenerateAssignment}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Ionicons name="school-outline" size={24} color="white" />
            <Text style={styles.fabButtonText}>Generate Assignment</Text>
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  timeAndButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between', // Changed to space-between
  },
  timeText: {
    fontSize: 14,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  messageText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: 80, // Position it above the chat input
    backgroundColor: '#007AFF',
    borderRadius: 30,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
  fabButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SubspaceScreen;