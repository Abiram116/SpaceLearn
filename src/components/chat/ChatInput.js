import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { generateAssignment } from '../../services/assignmentService';

const ChatInput = ({ 
  onSendMessage, 
  subspaceName, 
  subspaceDescription,
  subjectId,
  disabled = false 
}) => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    try {
      setIsSending(true);
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateAssignment = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      await generateAssignment(subspaceName, subspaceDescription, subjectId);
      Alert.alert(
        'Success', 
        'Assignment generated successfully! Check the Assignments tab to view it.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error generating assignment:', error);
      Alert.alert('Error', 'Failed to generate assignment. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.colors.card }
    ]}>
      <TouchableOpacity
        style={[
          styles.assignmentButton,
          isGenerating && styles.disabledButton,
          disabled && styles.disabledButton
        ]}
        onPress={handleGenerateAssignment}
        disabled={isGenerating || disabled}
      >
        {isGenerating ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Ionicons 
            name="school-outline" 
            size={24} 
            color={disabled ? theme.colors.textSecondary : theme.colors.primary} 
          />
        )}
      </TouchableOpacity>

      <View style={[
        styles.inputContainer,
        { backgroundColor: theme.colors.background }
      ]}>
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text }
          ]}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          maxLength={1000}
          editable={!disabled}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.sendButton,
          (!message.trim() || isSending || disabled) && styles.disabledButton
        ]}
        onPress={handleSend}
        disabled={!message.trim() || isSending || disabled}
      >
        {isSending ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Ionicons 
            name="send" 
            size={24} 
            color={!message.trim() || disabled ? theme.colors.textSecondary : theme.colors.primary} 
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  assignmentButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 20,
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  input: {
    fontSize: 16,
    maxHeight: 80,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ChatInput; 