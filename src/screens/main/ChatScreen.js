import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { generateAIResponse } from '../../services/googleAI';
import { colors } from '../../styles/theme';

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Let me know what you\'d like to focus on!',
      isUser: false,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      // Try to generate a test response to check if API key is set
      await generateAIResponse("test");
      setApiKeyMissing(false);
    } catch (error) {
      if (error.message && error.message.includes('API key is missing')) {
        setApiKeyMissing(true);
      }
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (apiKeyMissing) {
      Alert.alert(
        "API Key Required",
        "Please set your Google AI API key in Profile settings to use this feature.",
        [
          { text: "Go to Settings", onPress: () => navigation.navigate('Profile') },
          { text: "Cancel", style: "cancel" }
        ]
      );
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(userMessage.text);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
      };
      setMessages(prev => [...prev, aiMessage]);
      setApiKeyMissing(false);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: error.message || 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      
      if (error.message && error.message.includes('API key is missing')) {
        setApiKeyMissing(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    if (item.isUser) {
      return (
        <View style={styles.userMessageWrapper}>
          <View style={styles.userMessage}>
            <Text style={styles.userMessageText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.aiMessageOuter}>
        <View style={styles.aiMessageInner}>
          <Text style={styles.aiMessageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {apiKeyMissing && (
        <TouchableOpacity 
          style={styles.apiKeyWarning}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.apiKeyWarningText}>
            ⚠️ API key not set. Tap here to configure in Profile settings.
          </Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Google net</Text>
            <Text style={styles.subtitle}>Total Time Spent: 130 minutes</Text>
          </View>
        </View>
      </View>

      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          removeClippingChildren={true}
          style={{ width: '100%' }}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          multiline
          maxLength={500}
        />
        {isLoading ? (
          <ActivityIndicator style={styles.sendButton} color="#007AFF" />
        ) : (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000000',
  },
  titleContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  chatContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  userMessageWrapper: {
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'flex-end',
    marginVertical: 2,
  },
  userMessage: {
    maxWidth: '80%',
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 12,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  aiMessageOuter: {
    width: '100%',
    marginVertical: 1,
    backgroundColor: '#1C1C1E',
    left: 0,
    right: 0,
    position: 'relative',
  },
  aiMessageInner: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E',
  },
  aiMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    color: '#FF3B30',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    marginRight: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
  },
  sendButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  apiKeyWarning: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B',
  },
  apiKeyWarningText: {
    color: '#92400E',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ChatScreen; 