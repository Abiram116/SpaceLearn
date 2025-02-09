import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
  Clipboard,
} from 'react-native';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { generateResponse } from '../api/deepseek/client';
import { Ionicons } from '@expo/vector-icons';

const Message = ({ content, isAI, onCopyCode }) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }

    // Add code block
    parts.push({
      type: 'code',
      language: match[1] || 'plaintext',
      content: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return (
    <View style={[styles.messageContainer, isAI ? styles.aiMessage : styles.userMessage]}>
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <View key={index} style={styles.codeBlock}>
              <View style={styles.codeHeader}>
                <Text style={styles.codeLanguage}>{part.language}</Text>
                <TouchableOpacity
                  onPress={() => onCopyCode(part.content)}
                  style={styles.copyButton}
                >
                  <Ionicons name="copy-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.codeContent}>{part.content}</Text>
            </View>
          );
        }
        return <Text key={index} style={styles.messageText}>{part.content}</Text>;
      })}
    </View>
  );
};

export default function SubspaceScreen({ route, navigation }) {
  const { subspace } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();
  const { user } = useAuth();

  useEffect(() => {
    navigation.setOptions({
      title: subspace.name,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('SubspaceSettings', { subspace })}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('subspace_id', subspace.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      content: newMessage,
      is_ai: false,
      user_id: user.id,
      subspace_id: subspace.id,
    };

    try {
      setIsLoading(true);
      // Save user message
      const { error: userMsgError } = await supabase
        .from('chat_messages')
        .insert([userMessage]);

      if (userMsgError) throw userMsgError;

      // Generate AI response
      const aiResponse = await generateResponse(newMessage, subspace.name);
      
      // Save AI response
      const { error: aiMsgError } = await supabase
        .from('chat_messages')
        .insert([{
          content: aiResponse,
          is_ai: true,
          user_id: user.id,
          subspace_id: subspace.id,
        }]);

      if (aiMsgError) throw aiMsgError;

      // Reload messages to get the latest state
      await loadMessages();
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await Clipboard.setString(code);
      Alert.alert('Success', 'Code copied to clipboard!');
    } catch (error) {
      console.error('Error copying code:', error);
      Alert.alert('Error', 'Failed to copy code');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => (
          <Message
            key={message.id || index}
            content={message.content}
            isAI={message.is_ai}
            onCopyCode={handleCopyCode}
          />
        ))}
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
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isLoading || !newMessage.trim()}
        >
          <Ionicons
            name={isLoading ? "timer-outline" : "send"}
            size={24}
            color={isLoading ? "#999" : "#fff"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    color: '#000',
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  codeBlock: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginVertical: 5,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    padding: 8,
  },
  codeLanguage: {
    color: '#fff',
    fontSize: 14,
  },
  copyButton: {
    padding: 4,
  },
  codeContent: {
    color: '#fff',
    fontFamily: 'monospace',
    padding: 10,
    fontSize: 14,
  },
}); 