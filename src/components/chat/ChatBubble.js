import React from 'react';
import { View, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

const ChatBubble = ({ message, isUser }) => {
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
      <Markdown
        style={isUser ? userMarkdownStyles : botMarkdownStyles}
      >
        {message}
      </Markdown>
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
});

// Bot message markdown styles
const botMarkdownStyles = {
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

// User message markdown styles
const userMarkdownStyles = {
  body: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  strong: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  code_block: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  code_inline: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontFamily: 'monospace',
    padding: 2,
    color: '#FFFFFF',
  },
  paragraph: {
    marginVertical: 5,
    color: '#FFFFFF',
  },
  list_item: {
    marginLeft: 10,
    color: '#FFFFFF',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#FFFFFF',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#FFFFFF',
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 6,
    color: '#FFFFFF',
  },
  blockquote: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFFFFF',
    marginVertical: 5,
    color: '#FFFFFF',
  },
  link: {
    color: '#ADD8E6', // Light blue for better visibility on dark background
    textDecorationLine: 'underline',
  },
};

export default ChatBubble;