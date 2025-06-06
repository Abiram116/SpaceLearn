import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout, typography } from '../../styles/theme';
import Button from '../../components/common/Button';
import { KeyboardAwareView } from '../../components/common/KeyboardAwareView';
import { Input } from '../../components/common/Input';
import { userService } from '../../services/userService';

const ChangePasswordScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // Set up navigation options with back button
  useEffect(() => {
    navigation.setOptions({
      title: 'Change Password',
      headerShown: true,
      headerStyle: {
        backgroundColor: colors.background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: colors.primary,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: () => (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleSubmit = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await userService.updatePassword(formData.newPassword);
      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareView>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="lock-closed" size={60} color={colors.primary} />
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            Enter your current password and choose a new one
          </Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Input
            ref={currentPasswordRef}
            icon="lock-closed"
            placeholder="Current Password"
            value={formData.currentPassword}
            onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
            secureTextEntry
            returnKeyType="next"
            onSubmitEditing={() => newPasswordRef?.current?.focus()}
            blurOnSubmit={false}
            error={error}
          />

          <Input
            ref={newPasswordRef}
            icon="lock-closed"
            placeholder="New Password"
            value={formData.newPassword}
            onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
            secureTextEntry
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef?.current?.focus()}
            blurOnSubmit={false}
            error={error}
          />

          <Input
            ref={confirmPasswordRef}
            icon="lock-closed"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
            error={error}
          />

          <Button
            title="Change Password"
            onPress={handleSubmit}
            isLoading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </View>
    </KeyboardAwareView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? layout.statusBarHeight + spacing.xl : spacing.xl,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 10,
    marginLeft: 6,
  },
  header: {
    alignItems: 'center',
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
});

export default ChangePasswordScreen; 