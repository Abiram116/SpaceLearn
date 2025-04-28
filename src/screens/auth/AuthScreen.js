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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius, layout } from '../../styles/theme';
import { userService } from '../../services/userService';
import Button from '../../components/common/Button';
import { KeyboardAwareView } from '../../components/common/KeyboardAwareView';
import Input from '../../components/common/Input';
import { fadeIn, scaleIn, slideUp, buttonPop, nativeAnimations } from '../../utils/animations';
import gsap from 'gsap';

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
  { label: 'Prefer not to say', value: 'prefer_not_to_say' }
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
  });
  const [error, setError] = useState('');
  const [genderInputPosition, setGenderInputPosition] = useState(0);

  // Remove input component refs
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const formRef = useRef(null);
  const buttonRef = useRef(null);
  const genderInputRef = useRef(null);

  // Add animated values for native platforms
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Add new animated values for mode transition
  const modeTransitionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web animations
      fadeIn(containerRef.current);
      scaleIn(headerRef.current, 0.2);
      slideUp(formRef.current, 0.4);
      buttonPop(buttonRef.current);
    } else {
      // Native animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Add animation for mode toggle
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web mode transition
      gsap.fromTo(formRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
      gsap.fromTo(buttonRef.current,
        { scale: 0.9 },
        { scale: 1, duration: 0.3, ease: 'back.out(2)' }
      );
    } else {
      // Native mode transition
      Animated.sequence([
        Animated.timing(modeTransitionAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modeTransitionAnim, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLogin, modeTransitionAnim]);

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
        // Sign up flow
        const {
          email,
          password,
          confirmPassword,
          fullName,
          username,
          gender,
          age,
        } = formData;

        // Validate required fields
        if (!email || !password || !confirmPassword || !fullName || !username || !gender || !age) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }

        // Validate password match
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Validate age
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 13) {
          setError('You must be at least 13 years old to register');
          setLoading(false);
          return;
        }

        try {
          // Sanitize and format the data
          const signupData = {
            email: email.toLowerCase().trim(),
            password: password,
            metadata: {
              full_name: fullName.trim(),
              username: username.toLowerCase().trim(),
              gender: gender || null,
              age: age ? parseInt(age) : null
            }
          };

          console.log('Attempting signup with formatted data:', {
            email: signupData.email,
            metadata: {
              ...signupData.metadata,
              username: signupData.metadata.username
            }
          });

          const { data, error } = await userService.signUp(signupData);

          if (error) {
            console.error('Signup error:', error);
            setError(error.message || 'Failed to create account');
            setLoading(false);
            return;
          }

          if (!data?.user) {
            console.error('No user data returned from signup');
            setError('Failed to create account');
            setLoading(false);
            return;
          }

          console.log('Signup successful, navigating to MainApp');
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainApp' }],
          });
        } catch (signupError) {
          console.error('Signup error:', signupError);
          setError(signupError.message || 'Failed to create account');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    // Reset form with animation
    if (Platform.OS === 'web') {
      gsap.to(formRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setIsLogin(!isLogin);
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            username: '',
            gender: '',
            age: '',
          });
        },
      });
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsLogin(!isLogin);
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          username: '',
          gender: '',
          age: '',
        });
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleSelectGender = (gender) => {
    setFormData({ ...formData, gender });
    setShowGenderPicker(false);
  };

  const handleGenderPress = () => {
    if (genderInputRef.current) {
      genderInputRef.current.measure((x, y, width, height, pageX, pageY) => {
        setGenderInputPosition(pageY + height);
        setShowGenderPicker(true);
      });
    } else {
      // If ref isn't available, just show the picker at a reasonable position
      setShowGenderPicker(true);
    }
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
        <form onSubmit={handleSubmit} style={{ flex: 1 }} ref={containerRef}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            bounces={false}
          >
            <View ref={headerRef}>
              <View style={styles.header}>
                <Ionicons name="school" size={60} color={colors.primary} />
                <Text style={styles.title}>Space Learn</Text>
                <Text style={styles.subtitle}>
                  {isLogin ? 'Welcome back!' : 'Create your account'}
                </Text>
              </View>
            </View>

            <View ref={formRef} style={styles.inputSection}>
              {error && <Text style={styles.errorText}>{error}</Text>}
              {!isLogin && (
                <>
                  <Input
                    icon="person"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                    autoCapitalize="words"
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />

                  <Input
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
                      ref={genderInputRef}
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
                    icon="calendar"
                    placeholder="Age"
                    value={formData.age}
                    onChangeText={(text) => setFormData({ ...formData, age: text })}
                    keyboardType="number-pad"
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </>
              )}

              <Input
                icon="mail"
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                blurOnSubmit={false}
                error={error}
              />

              <Input
                icon="lock-closed"
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                returnKeyType={isLogin ? "go" : "next"}
                onSubmitEditing={isLogin ? handleSubmit : null}
                blurOnSubmit={isLogin}
                error={error}
              />

              {!isLogin && (
                <Input
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

            <View ref={buttonRef} style={styles.buttonSection}>
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
                  transition: 'transform 0.2s ease',
                  transform: 'scale(1)',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
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
        <Animated.View style={{ 
          flex: 1, 
          opacity: fadeAnim,
          transform: [
            {
              translateY: modeTransitionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 20],
              }),
            },
          ],
        }}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            bounces={false}
          >
            <Animated.View style={{
              transform: [
                { scale: scaleAnim }
              ]
            }}>
              <View style={styles.header}>
                <Ionicons name="school" size={60} color={colors.primary} />
                <Text style={styles.title}>Space Learn</Text>
                <Text style={styles.subtitle}>
                  {isLogin ? 'Welcome back!' : 'Create your account'}
                </Text>
              </View>
            </Animated.View>

            <Animated.View style={{
              transform: [
                { translateY: slideAnim }
              ]
            }}>
              <View style={styles.inputSection}>
                {error && <Text style={styles.errorText}>{error}</Text>}
                {!isLogin && (
                  <>
                    <Input
                      icon="person"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                      autoCapitalize="words"
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />

                    <Input
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
                        ref={genderInputRef}
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
                      icon="calendar"
                      placeholder="Age"
                      value={formData.age}
                      onChangeText={(text) => setFormData({ ...formData, age: text })}
                      keyboardType="number-pad"
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </>
                )}

                <Input
                  icon="mail"
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  error={error}
                />

                <Input
                  icon="lock-closed"
                  placeholder="Password"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                  returnKeyType={isLogin ? "go" : "next"}
                  onSubmitEditing={isLogin ? handleSubmit : null}
                  blurOnSubmit={isLogin}
                  error={error}
                />

                {!isLogin && (
                  <Input
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

              <View style={styles.buttonSection}>
                <Button
                  onPress={handleSubmit}
                  disabled={loading}
                  style={styles.submitButton}
                  fullWidth={true}
                  size="large"
                >
                  {loading ? <ActivityIndicator color={colors.background} /> : 
                   isLogin ? 'Sign In' : 'Sign Up'}
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
            </Animated.View>
          </ScrollView>
        </Animated.View>
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
    padding: spacing.sm,
    paddingTop: Platform.OS === 'ios' ? layout.statusBarHeight + 100 : spacing.sm,
    paddingBottom: spacing.xl * 2,
    minHeight: '100%',
    justifyContent: 'flex-start',
  },
  header: {
    alignItems: 'center',
    position: 'relative',
    marginTop: 40,
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
    marginBottom: spacing.md,
  },
  inputSection: {
    marginTop: 0,
  },
  buttonSection: {
    width: '100%',
    marginTop: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'left',
    textAlignVertical: 'center',
    lineHeight: Platform.OS === 'ios' ? 40 : undefined,
    includeFontPadding: false,
    minHeight: Platform.OS === 'ios' ? 48 : 40,
  },
});

export default AuthScreen; 