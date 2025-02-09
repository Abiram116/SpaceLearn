import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius, layout } from '../../styles/theme';
import { userService } from '../../services/userService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await userService.getCurrentUser();
      if (userData) {
        setUser(userData);
        setPreferences({
          notification_enabled: true,
          ...userData.user_preferences?.[0]
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await userService.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleEditProfile = () => {
    if (!user) return;
    navigation.navigate('EditProfile', {
      user,
      onUpdate: loadUserProfile,
    });
  };

  const handleToggleNotifications = async (value) => {
    if (!user) return;
    try {
      await userService.updatePreferences(user.id, {
        notification_enabled: value,
      });
      setPreferences(prev => ({
        ...prev,
        notification_enabled: value,
      }));
    } catch (error) {
      console.error('Error updating preferences:', error);
      Alert.alert('Error', 'Failed to update preferences');
    }
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAccount();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Please sign in to view your profile</Text>
        <Button
          title="Sign In"
          onPress={() => navigation.navigate('Auth')}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={40} color={colors.textSecondary} />
            </View>
          )}
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="camera" size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user.full_name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      <View style={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>
                {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{user.age || 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="flame" size={24} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Learning Streak</Text>
              <Text style={styles.infoValue}>{user.streak_count} days</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="time" size={24} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {new Date(user.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Settings</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleEditProfile}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="person-circle" size={24} color={colors.primary} />
              </View>
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="notifications" size={24} color={colors.primary} />
              </View>
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={preferences?.notification_enabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          <TouchableOpacity
            style={[styles.settingRow, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="lock-closed" size={24} color={colors.primary} />
              </View>
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <Button
          title="Sign Out"
          onPress={handleLogout}
          style={styles.signOutButton}
          type="secondary"
        />

        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteAccountText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl + layout.statusBarHeight : spacing.xl,
    paddingBottom: spacing.xl,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.medium,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.background,
    backgroundColor: colors.card,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    ...shadows.small,
  },
  name: {
    ...typography.h2,
    fontSize: 24,
    color: colors.background,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  username: {
    ...typography.body,
    color: colors.background,
    opacity: 0.9,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  bio: {
    ...typography.body,
    color: colors.background,
    opacity: 0.9,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? layout.bottomSpacing : spacing.xl,
  },
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  settingsCard: {
    marginBottom: spacing.xl,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingText: {
    ...typography.body,
    color: colors.text,
  },
  signOutButton: {
    marginTop: spacing.md,
  },
  deleteAccountButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  deleteAccountText: {
    ...typography.body,
    color: colors.error,
  },
});

export default ProfileScreen; 