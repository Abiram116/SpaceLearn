import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatBubble = ({ message, isUser }) => {
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
      <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginVertical: 5,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    marginLeft: '20%',
  },
  botBubble: {
    backgroundColor: '#E8E8E8',
    alignSelf: 'flex-start',
    marginRight: '20%',
  },
  text: {
    fontSize: 16,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#000000',
  },
});

export default ChatBubble; 