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
import { chatService } from '../../services/chatService';
import { useAuth } from '../../hooks/useAuth';
import Markdown from 'react-native-markdown-display';

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
            <Markdown
              key={index}
              style={message.is_ai ? markdownStylesAI : markdownStylesUser}
            >
              {part.content}
            </Markdown>
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
                // Always start at 0 - we'll track the exact time
                duration_minutes: 0
              }
            ])
            .select();

          if (error) {
            console.error('Error updating learning session:', error.message);
          } else {
            console.log('Successfully created learning session:', data);
            // Make sure we have a valid session ID
            if (data && data.length > 0 && data[0].id) {
              global.currentLearningSessionId = data[0].id;
              console.log('Set global learning session ID:', global.currentLearningSessionId);
              
              // Setup precise time tracking
              global.sessionStartTime = new Date();  // Record exact start time
              global.sessionElapsedSeconds = 0;      // Track elapsed seconds
              
              // Set up a timer to count seconds ONLY while in the subspace
              // This ensures we only count time when the user is actively in the session
              if (!global.sessionUpdateTimer) {
                global.sessionUpdateTimer = setInterval(() => {
                  // Increment elapsed time by 1 second
                  global.sessionElapsedSeconds += 1;
                  
                  // Only update the database every 15 seconds to reduce load
                  if (global.sessionElapsedSeconds % 15 === 0) {
                    try {
                      // Convert seconds to minutes, always rounding down
                      const minutes = Math.floor(global.sessionElapsedSeconds / 60);
                      
                      // Update the database with the precise time
                      supabase
                        .from('learning_sessions')
                        .update({ duration_minutes: minutes })
                        .eq('id', global.currentLearningSessionId)
                        .then(() => {
                          console.log(`Session updated: ${minutes} minutes (${global.sessionElapsedSeconds} seconds)`);
                        })
                        .catch(error => {
                          console.error('Error updating session time:', error);
                        });
                    } catch (error) {
                      console.error('Error in session timer:', error);
                    }
                  }
                }, 1000); // Update counter every 1 second for precise tracking
                
                console.log('Started precise second-by-second session timer');
              }
            } else {
              console.error('Failed to get valid session ID from response:', data);
            }
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

      // Call Google AI API through chat service
      const aiResponse = await chatService.generateResponse(userMessage.content, context);
      
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

  // Track learning session time spent - using precise second tracking
  const endLearningSession = async () => {
    try {
      if (!global.currentLearningSessionId) {
        console.log('No active learning session found to end');
        return;
      }

      console.log(`Ending learning session: ${global.currentLearningSessionId} after ${global.sessionElapsedSeconds} seconds`);
      const sessionId = global.currentLearningSessionId;
      
      // Use our precisely tracked elapsed seconds
      const exactMinutes = Math.floor(global.sessionElapsedSeconds / 60);
      console.log(`Using exact tracked time: ${exactMinutes} minutes (${global.sessionElapsedSeconds} seconds)`);
      
      // Add detailed time tracking log
      
      const { data: session, error: sessionError } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('Error fetching session for ending:', sessionError);
        return;
      }

      if (!session) {
        console.error('Session not found for ID:', sessionId);
        return;
      }

      // Use created_at as the start time since there's no start_time column
      const startTime = new Date(session.created_at);
      
      // We'll use our precise second counter instead of calculating time difference
      // This ensures we ONLY count time while the user was actually in the subspace
      const durationMinutes = Math.floor(global.sessionElapsedSeconds / 60);
      
      // Log the details for debugging
      console.log(`Using elapsed seconds from counter: ${global.sessionElapsedSeconds}`);
      console.log(`Converting to ${durationMinutes} minutes`);
      
      // Add detailed logging to track time calculations
      console.log('Time calculation details:', {
        startTimeISO: session.created_at,
        nowTimeISO: now.toISOString(),
        exactSeconds: global.sessionElapsedSeconds,
        finalMinutes: durationMinutes,
        // Show minutes and seconds for logging
        minutesSeconds: `${Math.floor(global.sessionElapsedSeconds / 60)}m ${global.sessionElapsedSeconds % 60}s`
      });
      
      console.log('Learning session details:', {
        sessionId: sessionId,
        actualSeconds: global.sessionElapsedSeconds,
        calculatedMinutes: durationMinutes
      });

      // Update the session with the calculated duration
      // Note: The schema shows learning_sessions does NOT have an updated_at column
      const { data: updatedSession, error: updateError } = await supabase
        .from('learning_sessions')
        .update({
          duration_minutes: Number(durationMinutes) // Ensure it's stored as a number
        })
        .eq('id', sessionId)
        .select();

      if (updateError) {
        console.error('Error updating session duration:', updateError);
        return;
      }
      
      if (!updatedSession || updatedSession.length === 0) {
        console.error('No session was updated');
        return;
      }

      console.log('Successfully ended learning session:', {
        id: updatedSession[0]?.id,
        duration: updatedSession[0]?.duration_minutes,
        startTime: updatedSession[0]?.created_at,
        endTime: now.toISOString() // Log but don't store in DB
      });

      // Store the ID for verification before clearing
      const completedSessionId = global.currentLearningSessionId;
      
      // Clear the global session ID
      global.currentLearningSessionId = null;
      
      // Return the ID so we can verify it later
      return completedSessionId;
    } catch (error) {
      console.error('Error in endLearningSession:', error);
    }
  };

  // Function to verify the session was recorded properly
  const verifySessionRecorded = async (sessionId) => {
    try {
      if (!sessionId) return;
      
      // Give the database a moment to update
      setTimeout(async () => {
        console.log('Verifying session was recorded properly:', sessionId);
        const { data, error } = await supabase
          .from('learning_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
        
        if (error) {
          console.error('Error verifying session:', error);
          return;
        }
        
        console.log('Session verification result:', {
          id: data.id,
          duration: data.duration_minutes,

          startTime: data.created_at
        });
      }, 1000);
    } catch (error) {
      console.error('Error in session verification:', error);
    }
  };

  // End the learning session when component unmounts
  useEffect(() => {
    return () => {
      // Clean up the auto-update timer if it exists
      if (global.sessionUpdateTimer) {
        clearInterval(global.sessionUpdateTimer);
        global.sessionUpdateTimer = null;
        console.log('Cleared session auto-update timer');
      }
      
      // Only end the session if we successfully created one
      // Use the exact seconds we've been tracking
      if (global.currentLearningSessionId) {
        console.log(`Component unmounting, ending learning session after ${global.sessionElapsedSeconds} seconds`);
        
        // Convert seconds to minutes directly, using only exact time spent
        const finalMinutes = Math.floor(global.sessionElapsedSeconds / 60);
        
        // Update session with final time instead of recalculating
        supabase
          .from('learning_sessions')
          .update({ duration_minutes: finalMinutes })
          .eq('id', global.currentLearningSessionId)
          .then(({ data, error }) => {
            if (error) {
              console.error('Error updating final session time:', error);
            } else {
              console.log(`Final session time recorded: ${finalMinutes} minutes`);
              // Reset global timer variables
              global.sessionElapsedSeconds = 0;
              global.sessionStartTime = null;
              // Verify session was properly recorded
              verifySessionRecorded(global.currentLearningSessionId);
            }
          })
          .catch(error => {
            console.error('Error in cleanup function:', error);
          });
      }
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={colors.background} 
        translucent={false}
      />
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
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior="padding"
          keyboardVerticalOffset={0}
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
      ) : (
        <View style={styles.container}>
          <View style={styles.content}>
            <ScrollView
              ref={scrollViewRef}
              style={[styles.chatContainer, { marginBottom: 70 }]}
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
            
            <View style={styles.androidInputContainer}>
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
        </View>
      )}
    </SafeAreaView>
  );
};

const markdownStylesAI = {
  body: {
    color: '#000000',
    fontSize: 16,
  },
  paragraph: {
    marginVertical: 8,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  heading4: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  heading5: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  heading6: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  bullet_list: {
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  list_item: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  blockquote: {
    backgroundColor: '#F0F0F0',
    borderLeftWidth: 4,
    borderLeftColor: '#CCCCCC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 8,
  },
  link: {
    color: '#0366d6',
    textDecorationLine: 'underline',
  },
  hr: {
    backgroundColor: '#CCCCCC',
    height: 1,
    marginVertical: 8,
  },
};

const markdownStylesUser = {
  body: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  paragraph: {
    marginVertical: 8,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  heading4: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  heading5: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  heading6: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  bullet_list: {
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  list_item: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  blockquote: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 8,
  },
  link: {
    color: '#ADD8E6',
    textDecorationLine: 'underline',
  },
  hr: {
    backgroundColor: '#FFFFFF',
    height: 1,
    marginVertical: 8,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 0,
    paddingBottom: Platform.OS === 'android' ? 0 : 70, // Space for floating input on iOS only
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
    paddingHorizontal: spacing.xs,
    paddingVertical: Platform.OS === 'ios' ? 6 : 7,
    marginHorizontal: spacing.lg,
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    ...shadows.medium,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    minHeight: 40,
    maxHeight: 90,
    paddingHorizontal: spacing.sm,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
  },
  sendButton: {     
    paddingVertical: spacing.sm,     
    paddingHorizontal: spacing.md,     
    marginLeft: spacing.xs,     
    borderRadius: 0,     
    alignContent: 'center',     
    justifyContent: 'center',     
    backgroundColor: colors.card,   
  },
  
  sendButtonDisabled: {
    opacity: 0.1,
    // backgroundColor: colors.card,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    // ...shadows.small,
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
  subspaceName: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  timeSpent: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  androidInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xs,
    paddingVertical: 5,
    marginHorizontal: spacing.lg,
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    elevation: 4,
  },
});

export default SubspaceScreen; 