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
  ActivityIndicator,
  SafeAreaView,
  StatusBar
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
  const { subspaceId, subspaceName, subjectName } = route.params;

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={colors.background}
        translucent={false} 
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{subspaceName}</Text>
            <Text style={styles.headerSubtitle}>{subjectName}</Text>
          </View>
        </View>

        <FlatList
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <ChatBubble message={item.content} isUser={item.isUser} />
          )}
          inverted
          contentContainerStyle={styles.messagesContainer}
          style={[styles.messagesList, { marginBottom: Platform.OS === 'android' ? 60 : 0 }]}
        />

        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={0}
            style={{ width: '100%' }}
          >
            <View style={styles.inputWrapper}>
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
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Ionicons name="send" size={24} color={colors.white} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        ) : (
          <View style={styles.androidInputWrapper}>
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
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Ionicons name="send" size={24} color={colors.white} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
  headerButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  chatContainer: {
    flex: 1,
    marginBottom: 0,
  },
  chatContent: {
    paddingVertical: spacing.md,
  },
  loadingMore: {
    padding: spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.xs,
  },
  aiBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: borderRadius.xs,
  },
  messageText: {
    ...typography.body,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.background,
  },
  aiMessageText: {
    color: colors.text,
  },
  codeBlockWrapper: {
    marginVertical: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#282C34',
  },
  codeBlock: {
    width: '100%',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#21252B',
    borderBottomWidth: 1,
    borderBottomColor: '#181A1F',
  },
  codeLanguage: {
    ...typography.caption,
    color: '#ABB2BF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: '#2C313A',
  },
  copyButtonText: {
    ...typography.caption,
    color: '#ABB2BF',
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  codeContent: {
    padding: spacing.md,
    minWidth: '100%',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  typingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? 8 : 5,
    marginBottom: Platform.OS === 'ios' ? 0 : 0,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: spacing.sm,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  backButtonText: {
    ...typography.caption,
    color: colors.background,
  },
  codeContainer: {
    padding: spacing.sm,
  },
  codeLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'android' ? spacing.md : spacing.sm,
    height: Platform.OS === 'android' ? 80 : 70,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...Platform.select({
      ios: {
        ...shadows.small,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    fontSize: 22,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 13,
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  androidInputWrapper: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 4,
  },
  messagesList: {
    flex: 1,
    marginTop: 0,
  },
  messagesContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: 0,
  },
});

export default ChatScreen; 