import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius, layout } from '../../styles/theme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { subjectService } from '../../services/subjectService';
import { userService } from '../../services/userService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';

const DayStreak = ({ day, isActive }) => (
  <View style={[styles.dayStreak, isActive && styles.dayStreakActive]}>
    <Ionicons 
      name="flash" 
      size={20} 
      color={isActive ? colors.primary : colors.textSecondary} 
    />
    <Text style={[styles.dayText, isActive && styles.dayTextActive]}>
      {day}
    </Text>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [streak, setStreak] = useState(0);
  const [continueLearning, setContinueLearning] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const days = [
    { key: 'mon', label: 'M' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'W' },
    { key: 'thu', label: 'T' },
    { key: 'fri', label: 'F' },
    { key: 'sat', label: 'S' },
    { key: 'sun', label: 'S' },
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Load each piece of data separately to better handle errors
      try {
        const activitiesData = await subjectService.getRecentActivities();
        setRecentActivities(activitiesData || []);
      } catch (error) {
        console.error('Error loading activities:', error);
        setRecentActivities([]);
      }

      try {
        const streakData = await userService.getUserStreak(user.id);
        setStreak(streakData?.streak_count || 0);
      } catch (error) {
        console.error('Error loading streak:', error);
        setStreak(0);
      }

      try {
        const lastAccessedData = await subjectService.getLastAccessedSubspace();
        setContinueLearning(lastAccessedData);
      } catch (error) {
        console.error('Error loading last accessed:', error);
        setContinueLearning(null);
      }

      try {
        const profileData = await userService.getCurrentUser();
        console.log('Profile data loaded:', profileData);
        setUserProfile(profileData);
      } catch (error) {
        console.error('Error loading profile:', error);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error in loadData:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  console.log('User data:', user);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const headerHeight = 44;
  const totalHeaderHeight = insets.top + headerHeight;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={[
        styles.header,
        {
          paddingTop: insets.top,
          height: insets.top + 48,
          paddingHorizontal: spacing.lg,
          backgroundColor: colors.background,
        }
      ]}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[
        styles.content, 
        { 
          paddingTop: insets.top + 48 + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.lg
        }
      ]}>
        <View style={[styles.welcomeContainer, { marginTop: 0 }]}>
          <Text style={[
            styles.userName,
            { 
              lineHeight: 56,
              includeFontPadding: false,
              textAlignVertical: 'center'
            }
          ]}>
            {userProfile?.username || userProfile?.full_name || 'User'}
          </Text>
        </View>

        <View style={styles.streakContainer}>
          <View style={styles.streakInfo}>
            <View style={styles.streakIconContainer}>
              <Ionicons name="flame" size={28} color={colors.primary} />
            </View>
            <View style={styles.streakTextContainer}>
              <Text style={styles.streakCount}>{streak}</Text>
              <Text style={styles.streakLabel}>Days Streak!</Text>
            </View>
          </View>
          <Text style={styles.streakSubtext}>Keep learning to maintain your streak</Text>
        </View>

        {continueLearning && (
          <View style={styles.continueContainer}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <TouchableOpacity
              style={styles.continueCard}
              onPress={() => navigation.navigate('Subspace', {
                subjectId: continueLearning.subject_id,
                subspaceId: continueLearning.id,
              })}
            >
              <View style={styles.continueContent}>
                <Text style={styles.continueTitle}>{continueLearning.name}</Text>
                <Text style={styles.continueSubtitle}>Continue where you left off</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivities.length > 0 ? (
            <View style={styles.activitiesContainer}>
              {recentActivities.slice(0, 3).map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityItem}
                  onPress={() => navigation.navigate('Subspace', {
                    subjectId: activity.subject_id,
                    subspaceId: activity.subspace_id,
                  })}
                >
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle} numberOfLines={1}>
                      {activity.subject?.name}
                    </Text>
                    <Text style={styles.activitySubtitle} numberOfLines={1}>
                      {activity.subspace?.name}
                    </Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '30%' }]} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyText}>
                No recent activity. Start learning!
              </Text>
              <Button
                title="Start Learning"
                onPress={() => navigation.navigate('Subjects')}
                style={styles.startButton}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  profileButton: {
    padding: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  content: {
    flex: 1,
  },
  welcomeContainer: {
    marginBottom: spacing.xl,
  },
  userName: {
    ...typography.h1,
    fontSize: 48,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  streakContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIconContainer: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginRight: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  streakTextContainer: {
    flex: 1,
  },
  streakCount: {
    ...typography.h1,
    fontSize: 32,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  streakLabel: {
    ...typography.h2,
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  streakSubtext: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  activitiesContainer: {
    gap: spacing.sm,
  },
  activityItem: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activityContent: {
    padding: spacing.md,
  },
  activityTitle: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  activitySubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  emptyStateContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  startButton: {
    minWidth: 160,
    height: 40,
    borderRadius: borderRadius.lg,
  },
  continueContainer: {
    marginBottom: spacing.md,
  },
  continueCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  continueContent: {
    flexDirection: 'column',
  },
  continueTitle: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  continueSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default HomeScreen; 