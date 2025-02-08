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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/theme';
import { userService } from '../../services/userService';
import Button from '../../components/common/Button';
import { KeyboardAwareView } from '../../components/common/KeyboardAwareView';
import { Input } from '../../components/common/Input';

const EditProfileScreen = ({ route, navigation }) => {
  const { user, onUpdate } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    username: user.username || '',
    gender: user.gender || '',
    age: user.age?.toString() || '',
    grade: user.grade || '',
    bio: user.bio || '',
    avatar_url: user.avatar_url || '',
  });

  const fullNameRef = useRef(null);
  const usernameRef = useRef(null);
  const genderRef = useRef(null);
  const ageRef = useRef(null);
  const gradeRef = useRef(null);
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
      if (formData.gender && !['male', 'female', 'other', 'prefer_not_to_say'].includes(formData.gender.toLowerCase())) {
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
      onUpdate?.(); // Refresh profile data in parent screen
      navigation.goBack();
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = () => {
    // TODO: Implement image upload functionality
    Alert.alert('Coming Soon', 'Image upload will be available in the next update');
  };

  return (
    <KeyboardAwareView>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
            onPress={handleUploadAvatar}
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
            error={error}
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
            onSubmitEditing={() => genderRef?.current?.focus()}
            blurOnSubmit={false}
            error={error}
          />

          <Input
            ref={genderRef}
            icon="male-female"
            label="Gender"
            value={formData.gender}
            onChangeText={(text) => setFormData({ ...formData, gender: text })}
            placeholder="male/female/other/prefer_not_to_say"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => ageRef?.current?.focus()}
            blurOnSubmit={false}
            error={error}
          />

          <Input
            ref={ageRef}
            icon="calendar"
            label="Age"
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            placeholder="Your age"
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => gradeRef?.current?.focus()}
            blurOnSubmit={false}
            error={error}
          />

          <Input
            ref={gradeRef}
            icon="school"
            label="Grade/Year"
            value={formData.grade}
            onChangeText={(text) => setFormData({ ...formData, grade: text })}
            placeholder="Your grade or year"
            returnKeyType="next"
            onSubmitEditing={() => bioRef?.current?.focus()}
            blurOnSubmit={false}
            error={error}
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
            returnKeyType="done"
            onSubmitEditing={handleUpdateProfile}
            error={error}
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
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});

export default EditProfileScreen; 