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
  TextInput,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius, layout } from '../../styles/theme';
import { userService } from '../../services/userService';
import { supabase } from '../../api/supabase/client';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import AnimatedView from '../../components/common/AnimatedView';
import { useTheme } from '../../context/ThemeContext';
import { setGoogleAIApiKey } from '../../services/googleAI';

const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
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
      onUpdate: () => {
        loadUserProfile();
      }
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

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      setGoogleAIApiKey(apiKey.trim());
      setApiKeySaved(true);
      Alert.alert('Success', 'API key has been saved for this session');
    } else {
      Alert.alert('Error', 'Please enter a valid API key');
    }
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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />
      
      <AnimatedView animation="fade">
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={[styles.avatar, { borderColor: theme.colors.background }]}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder, { borderColor: theme.colors.background }]}>
                <Ionicons name="person" size={40} color={theme.colors.textSecondary} />
              </View>
            )}
            <TouchableOpacity
              style={[styles.editAvatarButton, { 
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.background 
              }]}
              onPress={handleEditProfile}
            >
              <Ionicons name="camera" size={20} color={theme.colors.background} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: theme.colors.background }]}>{user?.full_name}</Text>
          <Text style={[styles.username, { color: theme.colors.background }]}>@{user?.username}</Text>
          {user?.bio && <Text style={[styles.bio, { color: theme.colors.background }]}>{user.bio}</Text>}
        </View>
      </AnimatedView>

      <View style={styles.content}>
        <AnimatedView animation="slide" delay={200}>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIconContainer, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="flame" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Learning Streak</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>{user?.streak_count || 0} days</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIconContainer, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="calendar" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Member Since</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                </Text>
              </View>
            </View>
          </Card>
        </AnimatedView>

        <AnimatedView animation="slide" delay={400}>
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
        </AnimatedView>

        <AnimatedView animation="slide" delay={500}>
          <Text style={styles.sectionTitle}>API Settings</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.apiKeyContainer}>
              <Text style={styles.apiKeyLabel}>Google AI API Key</Text>
              <TextInput
                style={styles.apiKeyInput}
                placeholder="Enter your Google AI API key"
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.apiKeyHelper}>
                The API key will be stored temporarily for this session only.
              </Text>
              <Button
                title={apiKeySaved ? "API Key Saved" : "Save API Key"}
                onPress={handleSaveApiKey}
                type={apiKeySaved ? "secondary" : "primary"}
                style={styles.apiKeyButton}
              />
              
              <TouchableOpacity
                style={styles.testApiButton}
                onPress={() => navigation.navigate('APITest')}
              >
                <Text style={styles.testApiText}>Test API Key</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>
        </AnimatedView>

        <AnimatedView animation="slide" delay={600}>
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
        </AnimatedView>
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
  apiKeyContainer: {
    padding: spacing.md,
  },
  apiKeyLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.card,
  },
  apiKeyHelper: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  apiKeyButton: {
    marginTop: spacing.sm,
  },
  testApiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  testApiText: {
    ...typography.body,
    color: colors.primary,
    marginRight: spacing.xs,
  },
});

export default ProfileScreen;
