import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

const ChatBubble = ({ message, isUser }) => {
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
      {isUser ? (
        // User messages stay as plain text
        <Text style={[styles.text, styles.userText]}>
          {message}
        </Text>
      ) : (
        // AI messages get rendered as markdown
        <Markdown
          style={markdownStyles}
        >
          {message}
        </Markdown>
      )}
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

// Markdown-specific styles
const markdownStyles = {
  body: {
    fontSize: 16,
    color: '#000000',
  },
  strong: {
    fontWeight: 'bold',
  },
  code_block: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 5,
    fontFamily: 'monospace',
  },
  code_inline: {
    backgroundColor: '#F0F0F0',
    fontFamily: 'monospace',
    padding: 2,
  },
  paragraph: {
    marginVertical: 5,
  },
  list_item: {
    marginLeft: 10,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  blockquote: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#CCCCCC',
    marginVertical: 5,
  },
};

export default ChatBubble;