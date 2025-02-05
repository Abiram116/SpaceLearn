import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/theme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const SubspaceScreen = ({ route, navigation }) => {
  const { subspace, subject } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: subspace.name,
      headerShown: true,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('EditSubspace', { subspace, subject })}
          style={styles.headerButton}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.primary} />
        </TouchableOpacity>
      ),
    });

    // Start conversation with a welcome message
    setMessages([{
      id: Date.now(),
      text: `Welcome to ${subspace.name}! I'm your AI learning assistant. How can I help you learn about this topic?`,
      sender: 'ai',
      timestamp: new Date(),
    }]);
  }, [navigation, subspace]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setIsTyping(true);

    try {
      // TODO: Replace with actual AI API call
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          text: "I understand you're interested in learning about this topic. What specific aspect would you like to explore?",
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        setLoading(false);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setLoading(false);
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      {item.sender === 'ai' && (
        <View style={styles.aiAvatar}>
          <Ionicons name="school" size={20} color={colors.primary} />
        </View>
      )}
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === 'user' ? styles.userMessageText : styles.aiMessageText
        ]}>{item.text}</Text>
        <Text style={[
          styles.timestamp,
          item.sender === 'user' ? styles.userTimestamp : styles.aiTimestamp
        ]}>
          {new Date(item.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <Card style={styles.infoCard}>
          <Text style={styles.subjectName}>{subject.name}</Text>
          <Text style={styles.subspaceName}>{subspace.name}</Text>
          <Text style={styles.description}>
            {subspace.description || 'Start a conversation to learn about this topic!'}
          </Text>
        </Card>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          inverted={false}
          showsVerticalScrollIndicator={false}
        />

        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>AI is typing...</Text>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Ask anything about this topic..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
            editable={!loading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputMessage.trim() || loading) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color={!inputMessage.trim() ? colors.textSecondary : colors.background} 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  infoCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  subjectName: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  subspaceName: {
    ...typography.h3,
    color: colors.text,
    marginVertical: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: spacing.sm,
    maxWidth: '85%',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ripple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  aiBubble: {
    backgroundColor: colors.card,
  },
  messageText: {
    ...typography.body,
  },
  userMessageText: {
    color: colors.background,
  },
  aiMessageText: {
    color: colors.text,
  },
  timestamp: {
    ...typography.caption,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: colors.background,
    opacity: 0.7,
  },
  aiTimestamp: {
    color: colors.textSecondary,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginLeft: spacing.md,
  },
  typingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    ...typography.body,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingTop: spacing.sm,
    marginRight: spacing.sm,
    minHeight: 44,
    maxHeight: 120,
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

export default SubspaceScreen; 