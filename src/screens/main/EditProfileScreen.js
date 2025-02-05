import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/theme';
import { userService } from '../../services/userService';
import Button from '../../components/common/Button';

const EditProfileScreen = ({ route, navigation }) => {
  const { user, onUpdate } = route.params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    username: user.username || '',
    gender: user.gender || '',
    age: user.age?.toString() || '',
    grade: user.grade || '',
    bio: user.bio || '',
    avatar_url: user.avatar_url || '',
  });

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.full_name || !formData.username) {
        Alert.alert('Error', 'Name and username are required');
        return;
      }

      // Validate age if provided
      if (formData.age) {
        const ageNum = parseInt(formData.age);
        if (isNaN(ageNum) || ageNum < 13) {
          Alert.alert('Error', 'Age must be at least 13');
          return;
        }
      }

      // Validate gender if provided
      if (formData.gender && !['male', 'female', 'other', 'prefer_not_to_say'].includes(formData.gender.toLowerCase())) {
        Alert.alert('Error', 'Invalid gender selection');
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
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = () => {
    // TODO: Implement image upload functionality
    Alert.alert('Coming Soon', 'Image upload will be available in the next update');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
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
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              placeholder="Your full name"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              placeholder="Your username"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              value={formData.gender}
              onChangeText={(text) => setFormData({ ...formData, gender: text })}
              placeholder="male/female/other/prefer_not_to_say"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              placeholder="Your age"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Grade/Year</Text>
            <TextInput
              style={styles.input}
              value={formData.grade}
              onChangeText={(text) => setFormData({ ...formData, grade: text })}
              placeholder="Your grade or year"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Tell us about yourself"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

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
    </KeyboardAvoidingView>
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
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: spacing.md,
  },
});

export default EditProfileScreen; 