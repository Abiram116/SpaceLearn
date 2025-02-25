import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/theme';
import { subjectService } from '../../services/subjectService';
import { supabase } from '../../api/supabase/client';
import { generateResponse } from '../../api/deepseek/client';
import { useAuth } from '../../hooks/useAuth';

const CodeBlock = ({ content, language }) => {
  // Basic syntax highlighting using regex
  const highlightSyntax = (code) => {
    // Remove any existing color spans
    code = code.replace(/<[^>]*>/g, '');
    
    // Keywords for different languages
    const keywords = {
      javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'null', 'undefined', 'true', 'false'],
      python: ['def', 'class', 'return', 'if', 'else', 'for', 'while', 'import', 'from', 'as', 'try', 'except', 'finally', 'None', 'True', 'False'],
      java: ['public', 'private', 'class', 'void', 'int', 'String', 'boolean', 'return', 'if', 'else', 'for', 'while'],
    };

    // Colors for different syntax elements
    const colors = {
      keyword: '#C678DD',     // Purple for keywords
      string: '#98C379',      // Green for strings
      comment: '#5C6370',     // Gray for comments
      number: '#D19A66',      // Orange for numbers
      function: '#61AFEF',    // Blue for functions
      default: '#ABB2BF',     // Default text color
    };

    let highlighted = code;

    // Highlight strings
    highlighted = highlighted.replace(
      /(["'`])(.*?)\1/g,
      `<Text style={{color: '${colors.string}'}}>$&</Text>`
    );

    // Highlight comments
    highlighted = highlighted.replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
      `<Text style={{color: '${colors.comment}'}}>$&</Text>`
    );

    // Highlight numbers
    highlighted = highlighted.replace(
      /\b(\d+)\b/g,
      `<Text style={{color: '${colors.number}'}}>$&</Text>`
    );

    // Highlight keywords for the specific language
    if (keywords[language]) {
      const keywordPattern = new RegExp(
        `\\b(${keywords[language].join('|')})\\b`,
        'g'
      );
      highlighted = highlighted.replace(
        keywordPattern,
        `<Text style={{color: '${colors.keyword}'}}>$&</Text>`
      );
    }

    // Highlight function calls
    highlighted = highlighted.replace(
      /\b([a-zA-Z_]\w*)\s*\(/g,
      `<Text style={{color: '${colors.function}'}}>$1</Text>(`
    );

    return highlighted;
  };

  const renderHighlightedCode = () => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Use regex to parse the highlighted syntax
      const parts = line.split(/(<Text[^>]*>.*?<\/Text>)/g);
      
      return (
        <View key={index} style={styles.codeLine}>
          {parts.map((part, partIndex) => {
            if (part.startsWith('<Text')) {
              // Extract the style and content from the Text tag
              const styleMatch = part.match(/style={{color: '([^']*)'}}>(.*?)<\/Text>/);
              if (styleMatch) {
                return (
                  <Text key={partIndex} style={{ color: styleMatch[1] }}>
                    {styleMatch[2]}
                  </Text>
                );
              }
            }
            return (
              <Text key={partIndex} style={{ color: '#ABB2BF' }}>
                {part}
              </Text>
            );
          })}
        </View>
      );
    });
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.codeContainer}>
        {renderHighlightedCode()}
      </View>
    </ScrollView>
  );
};

const Message = ({ message, onCopyCode }) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  // Helper function to get language-specific settings
  const getLanguageConfig = (lang) => {
    const defaultLang = 'plaintext';
    const supportedLanguages = {
      python: 'python',
      javascript: 'javascript',
      js: 'javascript',
      typescript: 'typescript',
      ts: 'typescript',
      java: 'java',
      cpp: 'cpp',
      'c++': 'cpp',
      c: 'c',
      csharp: 'csharp',
      'c#': 'csharp',
      ruby: 'ruby',
      php: 'php',
      swift: 'swift',
      kotlin: 'kotlin',
      go: 'go',
      rust: 'rust',
      sql: 'sql',
      html: 'html',
      css: 'css',
      shell: 'shell',
      bash: 'bash',
      plaintext: 'plaintext',
    };

    const normalized = (lang || '').toLowerCase();
    return supportedLanguages[normalized] || defaultLang;
  };

  while ((match = codeBlockRegex.exec(message.content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: message.content.slice(lastIndex, match.index),
      });
    }

    // Add code block with language info
    parts.push({
      type: 'code',
      language: getLanguageConfig(match[1]),
      content: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < message.content.length) {
    parts.push({
      type: 'text',
      content: message.content.slice(lastIndex),
    });
  }

  return (
    <View style={[
      styles.messageContainer,
      message.is_ai ? styles.aiMessage : styles.userMessage
    ]}>
      <View style={[
        styles.messageBubble,
        message.is_ai ? styles.aiBubble : styles.userBubble
      ]}>
        {parts.map((part, index) => {
          if (part.type === 'code') {
            return (
              <View key={index} style={styles.codeBlockWrapper}>
                <View style={styles.codeBlock}>
                  <View style={styles.codeHeader}>
                    <Text style={styles.codeLanguage}>
                      {part.language}
                    </Text>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={() => onCopyCode(part.content)}
                    >
                      <Ionicons name="copy-outline" size={16} color="#E0E0E0" />
                      <Text style={styles.copyButtonText}>Copy code</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.codeContent}>
                    <CodeBlock content={part.content} language={part.language} />
                  </View>
                </View>
              </View>
            );
          }
          return (
            <Text key={index} style={[
              styles.messageText,
              message.is_ai ? styles.aiMessageText : styles.userMessageText
            ]}>
              {part.content}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

const SubspaceScreen = ({ route, navigation }) => {
  const { subjectId, subspaceId } = route.params || {};
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subspace, setSubspace] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef();
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('Loading subspace and messages for:', { subjectId, subspaceId });
    loadSubspace();
    loadMessages();
  }, [subjectId, subspaceId]);

  const loadSubspace = async () => {
    try {
      setLoading(true);
      const response = await subjectService.getSubspaces(subjectId);
      console.log('Fetched subspaces:', response);
      const currentSubspace = response.find(s => s.id === subspaceId);
      
      if (currentSubspace) {
        console.log('Current subspace:', currentSubspace);
        setSubspace(currentSubspace);

        // Store this as the last accessed subspace
        try {
          await subjectService.updateLastAccessedId(currentSubspace.full_sequence_id);
          console.log('Updated last accessed sequence:', currentSubspace.full_sequence_id);
        } catch (updateError) {
          console.error('Error updating last accessed sequence:', updateError.message);
        }

        // Update last accessed timestamp
        try {
          console.log('Updating last accessed for subspace:', subspaceId, 'user:', user.id);
          const { data, error } = await supabase
            .from('learning_sessions')
            .upsert([
              {
                user_id: user.id,
                subject_id: subjectId,
                subspace_id: subspaceId,
                duration_minutes: 0,
                start_time: new Date().toISOString(),
                end_time: null,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select();

          if (error) {
            console.error('Error updating learning session:', error.message);
          } else {
            console.log('Successfully updated learning session:', data);
          }
        } catch (updateError) {
          console.error('Error in learning session update:', updateError.message);
        }
      } else {
        console.warn('Subspace not found in response');
      }
    } catch (error) {
      console.error('Error loading subspace:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (older = false) => {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('subspace_id', subspaceId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(older ? messages.length : 0, older ? messages.length + 19 : 19);

      if (error) throw error;

      console.log('Loaded messages:', messages);

      if (messages.length < 20) {
        setHasMore(false);
      }

      setMessages(prev => {
        const newMessages = [...messages].reverse();
        return older ? [...prev, ...newMessages] : newMessages;
      });
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadMessages(true);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const userMessage = {
        user_id: user.id,
        subspace_id: subspaceId,
        content: newMessage.trim(),
        is_ai: false,
      };

      // Save user message
      const { data: savedMessage, error: saveError } = await supabase
        .from('chat_messages')
        .insert([userMessage])
        .select()
        .single();

      if (saveError) throw saveError;

      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');

      // Get context from subspace
      const context = `This is a learning session about ${subspace.name}. ${subspace.description || ''}`;

      // Call DeepSeek API
      const aiResponse = await generateResponse(userMessage.content, context);
      
      // Save AI response
      const { data: savedAiMessage, error: aiSaveError } = await supabase
        .from('chat_messages')
        .insert([{
          user_id: user.id,
          subspace_id: subspaceId,
          content: aiResponse,
          is_ai: true,
          context,
        }])
        .select()
        .single();

      if (aiSaveError) throw aiSaveError;

      setMessages(prev => [...prev, savedAiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCopyCode = async (code) => {
    await Clipboard.setString(code);
    Alert.alert('Success', 'Code copied to clipboard!');
  };

  const startLearningSession = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          subject_id: subjectId,
          subspace_id: subspaceId,
          duration_minutes: 0,
          start_time: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Started learning session:', data);
      return data;
    } catch (error) {
      console.error('Error starting learning session:', error);
      throw error;
    }
  };

  const endLearningSession = async (sessionId) => {
    try {
      const now = new Date();
      const { data: session, error: sessionError } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        throw new Error('Session not found or unauthorized');
      }

      const startTime = new Date(session.start_time);
      const durationMinutes = Math.max(0.5, (now - startTime) / (1000 * 60)); // Minimum 30 seconds

      const { data: updatedSession, error: updateError } = await supabase
        .from('learning_sessions')
        .update({
          duration_minutes: durationMinutes,
          updated_at: now.toISOString(),
          is_active: false,
          end_time: now.toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('Updated session duration:', {
        id: updatedSession.id,
        duration: updatedSession.duration_minutes,
        startTime: updatedSession.start_time,
        endTime: updatedSession.end_time
      });

      return updatedSession;
    } catch (error) {
      console.error('Error in endLearningSession:', error);
      throw error;
    }
  };

  useEffect(() => {
    let sessionId;
    const startSession = async () => {
      const session = await startLearningSession();
      sessionId = session.id;
    };

    startSession();

    return () => {
      if (sessionId) {
        endLearningSession(sessionId);
      }
    };
  }, [subjectId, subspaceId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{route.params?.subspaceName || subspace?.name || 'Loading...'}</Text>
          <Text style={styles.headerSubtitle}>Total Time Spent: {subspace?.total_time_spent || 0} minutes</Text>
        </View>
      </View>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.content}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            onScroll={({ nativeEvent }) => {
              if (nativeEvent.contentOffset.y === 0) {
                handleLoadMore();
              }
            }}
            scrollEventThrottle={400}
          >
            {loadingMore && (
              <ActivityIndicator style={styles.loadingMore} size="small" color={colors.primary} />
            )}
            
            {messages.map(message => (
              <Message
                key={message.id}
                message={message}
                onCopyCode={handleCopyCode}
              />
            ))}
            
            {sending && (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.typingText}>AI is typing...</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type your message..."
              multiline
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newMessage.trim() || sending) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!newMessage.trim() || sending}
            >
              <Ionicons 
                name="send" 
                size={24} 
                color={!newMessage.trim() || sending ? colors.textSecondary : colors.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: spacing.md,
  },
  chatContent: {
    // paddingVertical: spacing.md,
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
    backgroundColor: '#282C34', // One Dark theme background
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
    backgroundColor: '#21252B', // Slightly lighter than background
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
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...shadows.medium,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? spacing.xs : 0,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  sendButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    ...shadows.small,
  },
  sendButtonDisabled: {
    opacity: 0.5,
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
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.small,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    fontSize: 20,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subspaceName: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  timeSpent: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default SubspaceScreen; 