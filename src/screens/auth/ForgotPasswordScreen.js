import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout, typography } from '../../styles/theme';
import Button from '../../components/common/Button';
import { KeyboardAwareView } from '../../components/common/KeyboardAwareView';
import Input from '../../components/common/Input';
import { userService } from '../../services/userService';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await userService.resetPassword(email);
      Alert.alert(
        "Password Reset Email Sent",
        "Check your email for instructions to reset your password.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      setError(err.message || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="lock-open" size={60} color={colors.primary} />
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address to reset your password
          </Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <Input
            icon="mail"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
            error={error}
          />

          <Button
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.submitButton}
            fullWidth={true}
          >
            {isLoading ? <ActivityIndicator color={colors.background} size="small" /> : "Reset Password"}
          </Button>

          <Button
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.backButton}
            fullWidth={true}
          >
            Back to Sign In
          </Button>
        </View>
      </View>
    </KeyboardAwareView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? layout.statusBarHeight + 100 : spacing.xl,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    flex: 1,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  backButton: {
    marginTop: spacing.md,
  },
});

export default ForgotPasswordScreen; 