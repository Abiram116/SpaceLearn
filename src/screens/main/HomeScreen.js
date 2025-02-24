import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius, layout } from '../../styles/theme';
import { subjectService } from '../../services/subjectService';
import { userService } from '../../services/userService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import AnimatedView from '../../components/common/AnimatedView';

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [streak, setStreak] = useState(0);
  const [continueLearning, setContinueLearning] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const onRefresh = React.useCallback(async () => {
    console.log('Manual refresh triggered');
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const loadData = async () => {
    if (!user?.id) {
      console.log('No user ID available, skipping data load');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Starting to load home screen data...');

      const [streakData, lastAccessedData, profileData] = await Promise.all([
        userService.getUserStreak(user.id).catch(error => {
          console.error('Error loading streak:', error);
          return { streak_count: 0 };
        }),
        subjectService.getLastAccessedSubspace().catch(error => {
          console.error('Error loading last accessed:', error);
          return null;
        }),
        userService.getCurrentUser().catch(error => {
          console.error('Error loading profile:', error);
          return null;
        })
      ]);

      setStreak(streakData?.streak_count || 0);
      setContinueLearning(lastAccessedData);
      setUserProfile(profileData);

      console.log('Home data loaded:', {
        streak: streakData?.streak_count,
        hasLastAccessed: !!lastAccessedData,
        lastAccessedName: lastAccessedData?.name,
        hasProfile: !!profileData
      });
    } catch (error) {
      console.error('Error in loadData:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { 
            paddingTop: insets.top + 48 + spacing.md,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
            flexGrow: 1,
          }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <AnimatedView animation="fade">
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
        </AnimatedView>

        <AnimatedView animation="slide" delay={200}>
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
        </AnimatedView>

        {continueLearning ? (
          <AnimatedView animation="slide" delay={400}>
            <View style={styles.continueContainer}>
              <Text style={styles.sectionTitle}>
                {continueLearning.id ? 'Continue Learning' : 'Start Learning'}
              </Text>
              <TouchableOpacity
                style={styles.continueCard}
                onPress={() => {
                  if (continueLearning.id) {
                    console.log('Navigating to subspace:', {
                      subjectId: continueLearning.subject?.id,
                      subspaceId: continueLearning.id,
                      subspaceName: continueLearning.name,
                      subjectName: continueLearning.subject?.name,
                      totalTime: continueLearning.total_time_spent
                    });
                    navigation.navigate('Subspace', {
                      subjectId: continueLearning.subject?.id,
                      subspaceId: continueLearning.id,
                      subspaceName: continueLearning.name,
                      subjectName: continueLearning.subject?.name
                    });
                  } else {
                    // Navigate to subject to create first subspace
                    navigation.navigate('Subjects');
                  }
                }}
              >
                <View style={styles.continueContent}>
                  <View style={styles.continueHeader}>
                    <Text style={styles.continueTitle}>
                      {continueLearning.id 
                        ? continueLearning.name 
                        : 'Create Your First Subspace'}
                    </Text>
                    <Text style={styles.continueSubject}>
                      {continueLearning.id
                        ? continueLearning.subject?.name
                        : continueLearning.subject?.name || 'Begin your learning journey'}
                    </Text>
                  </View>
                  
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.statText}>
                        {continueLearning.total_time_spent > 0 
                          ? `${Math.round(continueLearning.total_time_spent)} mins spent`
                          : 'No time logged yet'}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons 
                        name={continueLearning.id ? "time" : "add-circle"}
                        size={16} 
                        color={colors.primary}
                      />
                      <Text style={[styles.statText, { color: colors.primary }]}>
                        {continueLearning.id ? 'Continue Learning' : 'Create Subspace'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </AnimatedView>
        ) : (
          <AnimatedView animation="slide" delay={400}>
            <View style={styles.continueContainer}>
              <Text style={styles.sectionTitle}>Start Learning</Text>
              <TouchableOpacity
                style={styles.continueCard}
                onPress={() => navigation.navigate('Subjects')}
              >
                <View style={styles.continueContent}>
                  <View style={styles.continueHeader}>
                    <Text style={styles.continueTitle}>Create Your First Subject</Text>
                    <Text style={styles.continueSubject}>Begin your learning journey</Text>
                  </View>
                  
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Ionicons 
                        name="add-circle" 
                        size={16} 
                        color={colors.primary}
                      />
                      <Text style={[styles.statText, { color: colors.primary }]}>
                        Get Started
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </AnimatedView>
        )}
      </ScrollView>
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
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    marginRight: spacing.md,
    marginBottom: spacing.xs,
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
  sectionTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  continueContainer: {
    marginBottom: spacing.lg,
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
    padding: spacing.lg,
  },
  continueHeader: {
    marginBottom: spacing.md,
  },
  continueTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  continueSubject: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default HomeScreen; 