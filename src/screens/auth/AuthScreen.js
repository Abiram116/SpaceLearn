import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/theme';
import { userService } from '../../services/userService';
import Button from '../../components/common/Button';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
    gender: '',
    age: '',
    grade: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      if (isLogin) {
        const { email, password } = formData;
        if (!email || !password) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }

        const { data, error } = await userService.signIn(email, password);
        if (error) {
          setError(error);
          return;
        }

        navigation.reset({
          index: 0,
          routes: [{ name: 'App' }],
        });
      } else {
        const {
          email,
          password,
          confirmPassword,
          fullName,
          username,
          gender,
          age,
          grade,
        } = formData;

        // Validate required fields
        if (!email || !password || !confirmPassword || !fullName || !username || !gender || !age || !grade) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }

        // Validate password match
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }

        // Validate age
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 13) {
          Alert.alert('Error', 'You must be at least 13 years old to register');
          return;
        }

        await userService.signUp({
          email,
          password,
          full_name: fullName,
          username,
          gender,
          age: ageNum,
          grade,
        });

        navigation.reset({
          index: 0,
          routes: [{ name: 'App' }],
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      username: '',
      gender: '',
      age: '',
      grade: '',
    });
  };

  const handleSelectGender = (gender) => {
    setFormData({ ...formData, gender });
    setShowGenderPicker(false);
  };

  const renderGenderPicker = () => (
    <Modal
      visible={showGenderPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowGenderPicker(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Gender</Text>
          {GENDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.genderOption,
                formData.gender === option.value && styles.genderOptionSelected,
              ]}
              onPress={() => handleSelectGender(option.value)}
            >
              <Text
                style={[
                  styles.genderOptionText,
                  formData.gender === option.value && styles.genderOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Ionicons name="school" size={60} color={colors.primary} />
          <Text style={styles.title}>Space Learn</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {!isLogin && (
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="at" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.username}
                  onChangeText={(text) => setFormData({ ...formData, username: text })}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowGenderPicker(true)}
              >
                <Ionicons name="male-female" size={20} color={colors.textSecondary} />
                <Text
                  style={[
                    styles.input,
                    !formData.gender && styles.placeholderText,
                  ]}
                >
                  {formData.gender
                    ? GENDER_OPTIONS.find(option => option.value === formData.gender)?.label
                    : 'Select Gender'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <Ionicons name="calendar" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.age}
                  onChangeText={(text) => setFormData({ ...formData, age: text })}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="school" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Grade/Year"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.grade}
                  onChangeText={(text) => setFormData({ ...formData, grade: text })}
                />
              </View>
            </>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textSecondary}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry
              />
            </View>
          )}

          <Button
            title={loading ? '' : (isLogin ? 'Sign In' : 'Sign Up')}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          >
            {loading && <ActivityIndicator color={colors.background} />}
          </Button>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleMode}
          >
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      {renderGenderPicker()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  toggleButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  toggleText: {
    ...typography.body,
    color: colors.primary,
  },
  forgotButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  forgotText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.large,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  genderOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
  },
  genderOptionSelected: {
    backgroundColor: colors.primary,
  },
  genderOptionText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  genderOptionTextSelected: {
    color: colors.background,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
});

export default AuthScreen; 