import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { generateAssignment } from '../../services/assignmentService';
import { useTheme } from '../../context/ThemeContext';

const ChatInput = ({ onSendMessage, subspaceName, subspaceDescription, subjectId }) => {
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const theme = useTheme();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleGenerateAssignment = async () => {
    try {
      setIsGenerating(true);
      await generateAssignment(subspaceName, subspaceDescription, subjectId);
      alert('Assignment generated successfully!');
    } catch (error) {
      console.error('Error generating assignment:', error);
      alert('Failed to generate assignment. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border
        }]}
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message..."
        placeholderTextColor={theme.colors.textSecondary}
        multiline
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={handleGenerateAssignment}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Ionicons name="school-outline" size={24} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  input: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  iconButton: {
    padding: 8,
    marginRight: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatInput; 