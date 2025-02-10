import React, { useState, useEffect, useRef } from 'react';
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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius, layout } from '../../styles/theme';
import { userService } from '../../services/userService';
import Button from '../../components/common/Button';
import { KeyboardAwareView } from '../../components/common/KeyboardAwareView';
import { Input } from '../../components/common/Input';

// Add web-specific styles
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-tap-highlight-color: transparent;
    }

    input, textarea, select, button {
      font-family: inherit;
      border-radius: inherit;
    }
    
    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: ${colors.primary};
    }
    
    input::selection {
      background-color: ${colors.primary}40;
    }

    input::-moz-selection {
      background-color: ${colors.primary}40;
    }
  `;
  document.head.appendChild(style);
}

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
  const [genderInputPosition, setGenderInputPosition] = useState(0);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const usernameRef = useRef(null);
  const ageRef = useRef(null);
  const gradeRef = useRef(null);
  const genderInputRef = useRef(null);

  const handleSubmit = async (e) => {
    if (Platform.OS === 'web' && e) {
      e.preventDefault();
    }

    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isLogin) {
        const { email, password } = formData;
        if (!email || !password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }

        console.log('Attempting to sign in...', { email });
        const { data, error } = await userService.signIn(email, password);
        
        if (error) {
          console.error('Sign in error:', error);
          setError(typeof error === 'string' ? error : error.message || 'Failed to sign in');
          setLoading(false);
          return;
        }

        if (!data) {
          console.error('No data returned from sign in');
          setError('Failed to sign in');
          setLoading(false);
          return;
        }

        console.log('Sign in successful, navigating to MainApp');
        setLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
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
          routes: [{ name: 'MainApp' }],
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
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

  const handleGenderPress = () => {
    genderInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setGenderInputPosition(pageY + height);
      setShowGenderPicker(true);
    });
  };

  const renderGenderPicker = () => (
    <Modal
      visible={showGenderPicker}
      transparent
      animationType="none"
      onRequestClose={() => setShowGenderPicker(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowGenderPicker(false)}
      >
        <View style={[
          styles.modalContent, 
          { 
            position: 'absolute', 
            top: genderInputPosition, 
            left: spacing.xl, 
            right: spacing.xl,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            marginTop: -3,
          }
        ]}>
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
    <KeyboardAwareView keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      {Platform.OS === 'web' ? (
        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            bounces={false}
          >
            <View>
              <View style={styles.header}>
                <Ionicons name="school" size={60} color={colors.primary} />
                <Text style={styles.title}>Space Learn</Text>
                <Text style={styles.subtitle}>
                  {isLogin ? 'Welcome back!' : 'Create your account'}
                </Text>
              </View>

              <View style={styles.inputSection}>
                {error && <Text style={styles.errorText}>{error}</Text>}
                {!isLogin && (
                  <>
                    <Input
                      ref={emailRef}
                      icon="person"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={() => usernameRef?.current?.focus()}
                      blurOnSubmit={false}
                    />

                    <Input
                      ref={usernameRef}
                      icon="at"
                      placeholder="Username"
                      value={formData.username}
                      onChangeText={(text) => setFormData({ ...formData, username: text })}
                      autoCapitalize="none"
                      returnKeyType="next"
                      onSubmitEditing={() => handleGenderPress()}
                      blurOnSubmit={false}
                    />

                    <View style={styles.dropdownContainer}>
                      <TouchableOpacity
                        style={[
                          styles.inputContainer,
                          showGenderPicker && {
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                            borderBottomWidth: 0,
                            borderBottomColor: 'transparent',
                            marginBottom: 0,
                          }
                        ]}
                        onPress={() => setShowGenderPicker(!showGenderPicker)}
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
                        <Ionicons 
                          name={showGenderPicker ? "chevron-up" : "chevron-down"} 
                          size={20} 
                          color={colors.textSecondary} 
                        />
                      </TouchableOpacity>
                      {showGenderPicker && (
                        <View style={styles.dropdownList}>
                          {GENDER_OPTIONS.map((option, index) => (
                            <TouchableOpacity
                              key={option.value}
                              style={[
                                styles.genderOption,
                                formData.gender === option.value && styles.genderOptionSelected,
                                index === GENDER_OPTIONS.length - 1 && styles.lastOption
                              ]}
                              onPress={() => {
                                setFormData({ ...formData, gender: option.value });
                                setShowGenderPicker(false);
                              }}
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
                      )}
                    </View>

                    <Input
                      ref={ageRef}
                      icon="calendar"
                      placeholder="Age"
                      value={formData.age}
                      onChangeText={(text) => setFormData({ ...formData, age: text })}
                      keyboardType="number-pad"
                      returnKeyType="next"
                      onSubmitEditing={() => gradeRef?.current?.focus()}
                      blurOnSubmit={false}
                    />

                    <Input
                      ref={gradeRef}
                      icon="school"
                      placeholder="Grade/Year"
                      value={formData.grade}
                      onChangeText={(text) => setFormData({ ...formData, grade: text })}
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef?.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </>
                )}

                <Input
                  ref={emailRef}
                  icon="mail"
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef?.current?.focus()}
                  blurOnSubmit={false}
                  error={error}
                />

                <Input
                  ref={passwordRef}
                  icon="lock-closed"
                  placeholder="Password"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                  returnKeyType={isLogin ? "go" : "next"}
                  onSubmitEditing={isLogin ? handleSubmit : () => confirmPasswordRef?.current?.focus()}
                  blurOnSubmit={isLogin}
                  error={error}
                />

                {!isLogin && (
                  <Input
                    ref={confirmPasswordRef}
                    icon="lock-closed"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    secureTextEntry
                    returnKeyType="go"
                    onSubmitEditing={handleSubmit}
                    error={error}
                  />
                )}
              </View>
            </View>

            <View style={styles.buttonSection}>
              <button
                type="submit"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  padding: `${spacing.sm}px ${spacing.md}px`,
                  borderRadius: borderRadius.lg,
                  border: 'none',
                  width: '100%',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: loading ? 0.7 : 1,
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  isLogin ? 'Sign In' : 'Sign Up'
                )}
              </button>

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
        </form>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={false}
        >
          <View>
            <View style={styles.header}>
              <Ionicons name="school" size={60} color={colors.primary} />
              <Text style={styles.title}>Space Learn</Text>
              <Text style={styles.subtitle}>
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </Text>
            </View>

            <View style={styles.inputSection}>
              {error && <Text style={styles.errorText}>{error}</Text>}
              {!isLogin && (
                <>
                  <Input
                    ref={emailRef}
                    icon="person"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => usernameRef?.current?.focus()}
                    blurOnSubmit={false}
                  />

                  <Input
                    ref={usernameRef}
                    icon="at"
                    placeholder="Username"
                    value={formData.username}
                    onChangeText={(text) => setFormData({ ...formData, username: text })}
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => handleGenderPress()}
                    blurOnSubmit={false}
                  />

                  <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                      style={[
                        styles.inputContainer,
                        showGenderPicker && {
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                          borderBottomWidth: 0,
                          borderBottomColor: 'transparent',
                          marginBottom: 0,
                        }
                      ]}
                      onPress={() => setShowGenderPicker(!showGenderPicker)}
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
                      <Ionicons 
                        name={showGenderPicker ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.textSecondary} 
                      />
                    </TouchableOpacity>
                    {showGenderPicker && (
                      <View style={styles.dropdownList}>
                        {GENDER_OPTIONS.map((option, index) => (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.genderOption,
                              formData.gender === option.value && styles.genderOptionSelected,
                              index === GENDER_OPTIONS.length - 1 && styles.lastOption
                            ]}
                            onPress={() => {
                              setFormData({ ...formData, gender: option.value });
                              setShowGenderPicker(false);
                            }}
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
                    )}
                  </View>

                  <Input
                    ref={ageRef}
                    icon="calendar"
                    placeholder="Age"
                    value={formData.age}
                    onChangeText={(text) => setFormData({ ...formData, age: text })}
                    keyboardType="number-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => gradeRef?.current?.focus()}
                    blurOnSubmit={false}
                  />

                  <Input
                    ref={gradeRef}
                    icon="school"
                    placeholder="Grade/Year"
                    value={formData.grade}
                    onChangeText={(text) => setFormData({ ...formData, grade: text })}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef?.current?.focus()}
                    blurOnSubmit={false}
                  />
                </>
              )}

              <Input
                ref={emailRef}
                icon="mail"
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef?.current?.focus()}
                blurOnSubmit={false}
                error={error}
              />

              <Input
                ref={passwordRef}
                icon="lock-closed"
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                returnKeyType={isLogin ? "go" : "next"}
                onSubmitEditing={isLogin ? handleSubmit : () => confirmPasswordRef?.current?.focus()}
                blurOnSubmit={isLogin}
                error={error}
              />

              {!isLogin && (
                <Input
                  ref={confirmPasswordRef}
                  icon="lock-closed"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                  error={error}
                />
              )}
            </View>
          </View>

          <View style={styles.buttonSection}>
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
      )}
    </KeyboardAwareView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? layout.statusBarHeight + spacing.xl : spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
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
  inputSection: {
    marginTop: spacing.lg,
  },
  buttonSection: {
    width: '100%',
    marginTop: spacing.xl,
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.large,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  dropdownContainer: {
    zIndex: 1,
  },
  dropdownList: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.small,
  },
  genderOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  genderOptionSelected: {
    backgroundColor: colors.primary,
  },
  genderOptionText: {
    ...typography.body,
    color: colors.text,
  },
  genderOptionTextSelected: {
    color: colors.background,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    minHeight: Platform.OS === 'ios' ? 56 : 48,
    ...shadows.small,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 0,
    marginLeft: spacing.sm,
    height: '100%',
    textAlignVertical: 'center',
    lineHeight: Platform.OS === 'ios' ? 22 : undefined,
    includeFontPadding: false,
    minHeight: Platform.OS === 'ios' ? 44 : 40,
  },
});

export default AuthScreen; 