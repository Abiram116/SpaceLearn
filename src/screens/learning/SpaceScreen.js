import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { colors, spacing, typography, shadows, borderRadius, layout } from '../../styles/theme';
import ChatBubble from '../../components/chat/ChatBubble';

const SpaceScreen = ({ route }) => {
  const { subject } = route.params;
  const [messages, setMessages] = useState([
    { id: '1', text: `Welcome to your ${subject} learning space! How can I help you today?`, isUser: false },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // TODO: Integrate with DeepSpeak API
    const botResponse = {
      id: (Date.now() + 1).toString(),
      text: 'This is a placeholder response. DeepSpeak API integration pending.',
      isUser: false,
    };

    setTimeout(() => {
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>{subject} Space</Text>
        </View>

        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <ChatBubble message={item.text} isUser={item.isUser} />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          inverted={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask anything..."
            multiline
            textAlignVertical="top"
            minHeight={Platform.OS === 'ios' ? 44 : 40}
            maxHeight={100}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.contentHorizontal,
    paddingVertical: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    ...typography.h2,
    color: colors.text,
  },
  messageList: {
    paddingHorizontal: spacing.contentHorizontal,
    paddingVertical: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.contentHorizontal,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? layout.bottomSpacing : spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    marginRight: spacing.sm,
    maxHeight: 100,
    color: colors.text,
    ...typography.body,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    height: Platform.OS === 'ios' ? 36 : 40,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  sendButtonText: {
    color: colors.background,
    ...typography.button,
  },
});

export default SpaceScreen; 