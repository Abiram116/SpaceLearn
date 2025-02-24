import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/theme';
import { chatService } from '../../services/chatService';
import { subjectService } from '../../services/subjectService';
import { useAuth } from '../../hooks/useAuth';
import ChatBubble from '../../components/chat/ChatBubble';

const ChatScreen = ({ route, navigation }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const { user } = useAuth();
  const { subspaceId } = route.params;

  useEffect(() => {
    loadChatHistory();
    startSession();

    // Clean up function to end session when leaving
    return () => {
      if (currentSession?.id) {
        console.log('Ending session on cleanup:', currentSession.id);
        endSession(currentSession.id);
      }
    };
  }, []);

  const startSession = async () => {
    try {
      // Check if there's already an active session
      const activeSession = await subjectService.getActiveSession(subspaceId);
      if (activeSession) {
        console.log('Resuming active session:', activeSession.id);
        setCurrentSession(activeSession);
        return;
      }

      // Start new session
      const session = await subjectService.startLearningSession(subspaceId);
      console.log('Started new learning session:', {
        id: session.id,
        subspaceId: session.subspace_id,
        startTime: session.start_time
      });
      setCurrentSession(session);
    } catch (error) {
      console.error('Error starting learning session:', error);
    }
  };

  const endSession = async (sessionId) => {
    try {
      const session = await subjectService.endLearningSession(sessionId);
      console.log('Ended learning session:', {
        id: session.id,
        duration: session.duration_minutes,
        startTime: session.start_time,
        endTime: session.end_time
      });
    } catch (error) {
      console.error('Error ending learning session:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const history = await chatService.getChatHistory(user.id);
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: message,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [userMessage, ...prev]);
    setMessage('');
    setLoading(true);

    try {
      const response = await chatService.sendMessage(user.id, message);
      const aiMessage = {
        id: Date.now() + 1,
        content: response.message,
        isUser: false,
        timestamp: response.timestamp
      };
      setMessages(prev => [aiMessage, ...prev]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a back button handler to ensure session ends
  const handleBack = async () => {
    if (currentSession?.id) {
      console.log('Ending session on back:', currentSession.id);
      await endSession(currentSession.id);
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Chat</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <ChatBubble message={item.content} isUser={item.isUser} />
        )}
        inverted
        contentContainerStyle={styles.messagesContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <Ionicons name="send" size={24} color={colors.background} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginLeft: spacing.md,
  },
  messagesContainer: {
    padding: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.small,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginRight: spacing.sm,
    maxHeight: 100,
    ...typography.body,
    color: colors.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
});

export default ChatScreen; 