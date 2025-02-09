import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/theme';
import { userService } from '../../services/userService';
import Button from '../../components/common/Button';
import { KeyboardAwareView } from '../../components/common/KeyboardAwareView';
import { Input } from '../../components/common/Input';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

const EditProfileScreen = ({ route, navigation }) => {
  const { user, onUpdate } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    username: user.username || '',
    gender: user.gender || '',
    age: user.age?.toString() || '',
    bio: user.bio || '',
    avatar_url: user.avatar_url || '',
  });

  const fullNameRef = useRef(null);
  const usernameRef = useRef(null);
  const ageRef = useRef(null);
  const bioRef = useRef(null);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate required fields
      if (!formData.full_name || !formData.username) {
        setError('Name and username are required');
        return;
      }

      // Validate age if provided
      if (formData.age) {
        const ageNum = parseInt(formData.age);
        if (isNaN(ageNum) || ageNum < 13) {
          setError('Age must be at least 13');
          return;
        }
      }

      // Validate gender if provided
      if (formData.gender && !['male', 'female', 'prefer_not_to_say'].includes(formData.gender.toLowerCase())) {
        setError('Invalid gender selection');
        return;
      }

      const updates = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender?.toLowerCase(),
      };

      await userService.updateProfile(user.id, updates);
      
      Alert.alert('Success', 'Profile updated successfully');
      onUpdate?.();
      navigation.goBack();
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareView>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarSection}>
          {formData.avatar_url ? (
            <Image
              source={{ uri: formData.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={40} color={colors.textSecondary} />
            </View>
          )}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => Alert.alert('Coming Soon', 'Image upload will be available in the next update')}
          >
            <Ionicons name="camera" size={20} color={colors.primary} />
            <Text style={styles.uploadText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Input
            ref={fullNameRef}
            icon="person"
            label="Full Name"
            value={formData.full_name}
            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
            placeholder="Your full name"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => usernameRef?.current?.focus()}
            blurOnSubmit={false}
          />

          <Input
            ref={usernameRef}
            icon="at"
            label="Username"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            placeholder="Your username"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => ageRef?.current?.focus()}
            blurOnSubmit={false}
          />

          <TouchableOpacity
            style={styles.genderSelector}
            onPress={() => setShowGenderPicker(true)}
          >
            <View style={styles.genderButton}>
              <Ionicons name="male-female" size={20} color={colors.primary} />
              <Text style={styles.genderButtonText}>
                {formData.gender ? 
                  GENDER_OPTIONS.find(opt => opt.value === formData.gender)?.label || 'Select Gender' 
                  : 'Select Gender'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <Input
            ref={ageRef}
            icon="calendar"
            label="Age"
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            placeholder="Your age"
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => bioRef?.current?.focus()}
            blurOnSubmit={false}
          />

          <Input
            ref={bioRef}
            icon="information-circle"
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
            style={styles.bioInput}
          />

          <Button
            title={loading ? '' : 'Save Changes'}
            onPress={handleUpdateProfile}
            disabled={loading}
            style={styles.submitButton}
          >
            {loading && <ActivityIndicator color={colors.background} />}
          </Button>
        </View>

        <Modal
          visible={showGenderPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowGenderPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowGenderPicker(false)}
          >
            <View style={styles.modalContent}>
              {GENDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.genderOption,
                    formData.gender === option.value && styles.genderOptionSelected
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, gender: option.value });
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={[
                    styles.genderOptionText,
                    formData.gender === option.value && styles.genderOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </KeyboardAwareView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  uploadText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  form: {
    flex: 1,
    gap: spacing.md,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  genderSelector: {
    marginBottom: spacing.md,
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderButtonText: {
    ...typography.body,
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '80%',
    maxWidth: 300,
    ...shadows.large,
  },
  genderOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
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
    fontWeight: '600',
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});

export default EditProfileScreen; 