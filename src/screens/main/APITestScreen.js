import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import { generateAIResponse } from '../../services/googleAI';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useTheme } from '../../context/ThemeContext';

const TEST_PROMPTS = [
  "Explain the concept of black holes in simple terms.",
  "What is the difference between machine learning and deep learning?",
  "Tell me a short fun fact about space exploration."
];

const APITestScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);

  // Set up navigation options with back button
  useEffect(() => {
    navigation.setOptions({
      title: 'API Test',
      headerShown: true,
      headerStyle: {
        backgroundColor: theme.colors.background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: theme.colors.primary,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: () => (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme]);

  const runTest = async (prompt) => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      const response = await generateAIResponse(prompt);
      setTestResult({
        prompt,
        response,
        success: true
      });
    } catch (err) {
      console.error('API Test Error:', err);
      setError(err.message || 'An unknown error occurred');
      setTestResult({
        prompt,
        success: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goToAPISettings = () => {
    navigation.goBack();
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Google AI API Test
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Test your API key with sample prompts
        </Text>
      </View>

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Select a test prompt
        </Text>
        
        {TEST_PROMPTS.map((prompt, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.promptButton, { borderColor: theme.colors.border }]}
            onPress={() => runTest(prompt)}
            disabled={isLoading}
          >
            <Text 
              style={[styles.promptText, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {prompt}
            </Text>
          </TouchableOpacity>
        ))}
      </Card>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Testing API connection...
          </Text>
        </View>
      )}

      {testResult && (
        <Card style={[styles.card, styles.resultCard]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Test Result
          </Text>
          
          <View style={styles.resultStatus}>
            <View style={[
              styles.statusIndicator, 
              { 
                backgroundColor: testResult.success 
                  ? theme.colors.success 
                  : theme.colors.error 
              }
            ]} />
            <Text style={[
              styles.statusText,
              { 
                color: testResult.success 
                  ? theme.colors.success 
                  : theme.colors.error 
              }
            ]}>
              {testResult.success ? 'Success' : 'Failed'}
            </Text>
          </View>

          <View style={styles.promptContainer}>
            <Text style={[styles.promptLabel, { color: theme.colors.textSecondary }]}>
              Prompt:
            </Text>
            <Text style={[styles.promptValue, { color: theme.colors.text }]}>
              {testResult.prompt}
            </Text>
          </View>

          {testResult.success ? (
            <View style={styles.responseContainer}>
              <Text style={[styles.responseLabel, { color: theme.colors.textSecondary }]}>
                Response:
              </Text>
              <Text style={[styles.responseValue, { color: theme.colors.text }]}>
                {testResult.response}
              </Text>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorLabel, { color: theme.colors.error }]}>
                Error:
              </Text>
              <Text style={[styles.errorValue, { color: theme.colors.error }]}>
                {error}
              </Text>
            </View>
          )}
        </Card>
      )}

      <Button
        title="Back to API Settings"
        onPress={goToAPISettings}
        type="secondary"
        style={styles.settingsButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    padding: 10,
    marginLeft: 6,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  promptButton: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  promptText: {
    ...typography.body,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
  },
  resultCard: {
    marginTop: spacing.lg,
  },
  resultStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.body,
    fontWeight: '600',
  },
  promptContainer: {
    marginBottom: spacing.md,
  },
  promptLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  promptValue: {
    ...typography.body,
  },
  responseContainer: {
    marginBottom: spacing.md,
  },
  responseLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  responseValue: {
    ...typography.body,
  },
  errorContainer: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
  },
  errorLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  errorValue: {
    ...typography.body,
  },
  settingsButton: {
    marginTop: spacing.md,
  },
});

export default APITestScreen; 