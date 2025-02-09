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
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef();
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!subjectId || !subspaceId) {
      setError('Invalid subspace parameters');
      setLoading(false);
      return;
    }
    loadSubspace();
    loadMessages();
  }, [subjectId, subspaceId]);

  const loadSubspace = async () => {
    try {
      const response = await subjectService.getSubspaces(subjectId);
      const currentSubspace = response.find(s => s.id === subspaceId);
      if (currentSubspace) {
        setSubspace(currentSubspace);
        navigation.setOptions({ 
          title: currentSubspace.name,
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('EditSubspace', { subspace: currentSubspace })}
            >
              <Ionicons name="settings-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        });
      } else {
        setError('Subspace not found');
      }
    } catch (error) {
      console.error('Error loading subspace:', error);
      setError('Failed to load subspace');
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
    if (!inputText.trim() || sending) return;

    try {
      setSending(true);
      const userMessage = {
        user_id: user.id,
        subspace_id: subspaceId,
        content: inputText.trim(),
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
      setInputText('');

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

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !subspace) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Subspace not found'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask anything about this topic..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxHeight={100}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || sending) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
            >
              <Ionicons 
                name="send" 
                size={24} 
                color={!inputText.trim() || sending ? colors.textSecondary : colors.primary} 
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
    padding: spacing.sm,
    ...shadows.medium,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 0,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  sendButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    ...shadows.small,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
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
});

export default SubspaceScreen; 