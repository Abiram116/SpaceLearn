import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
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
    if (user) loadData();
  }, [user]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [streakData, lastAccessed, profile] = await Promise.all([
        userService.getUserStreak(user.id).catch(() => ({ streak_count: 0 })),
        subjectService.getLastAccessedSubspace().catch(() => null),
        userService.getCurrentUser().catch(() => null),
      ]);
      setStreak(streakData.streak_count || 0);
      setContinueLearning(lastAccessed);
      setUserProfile(profile);
    } catch (e) {
      console.error(e);
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

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            height: insets.top + 52,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle" size={36} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 52 + spacing.md,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.md,
        }}
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
        {/* Welcome */}
        <AnimatedView animation="fade">
          <View style={styles.welcomeContainer}>
            <Text
              style={[
                styles.userName,
                { lineHeight: 60, includeFontPadding: false },
              ]}
            >
              {userProfile?.username || userProfile?.full_name || 'User'}
            </Text>
          </View>
        </AnimatedView>

        {/* Streak */}
        <AnimatedView animation="slide" delay={200}>
          <View style={styles.streakContainer}>
            <View style={styles.streakInfo}>
              <View style={styles.streakIcon}>
                <Ionicons name="flame" size={32} color={colors.primary} />
              </View>
              <View style={styles.streakText}>
                <Text style={styles.streakCount}>{streak}</Text>
                <Text style={styles.streakLabel}>Days Streak!</Text>
              </View>
            </View>
            <Text style={styles.streakSub}>Keep learning to maintain your streak</Text>
          </View>
        </AnimatedView>

        {/* Continue / Start Learning */}
        <AnimatedView animation="slide" delay={400}>
          <View style={styles.continueSection}>
            <Text style={styles.sectionTitle}>
              {continueLearning?.id ? 'Continue Learning' : 'Start Learning'}
            </Text>

            <TouchableOpacity
              style={styles.continueCard}
              onPress={() =>
                continueLearning?.id
                  ? navigation.navigate('Subspace', {
                      subjectId: continueLearning.subject?.id,
                      subspaceId: continueLearning.id,
                      subspaceName: continueLearning.name,
                      subjectName: continueLearning.subject?.name,
                    })
                  : navigation.navigate('Subjects')
              }
            >
              <View style={styles.continueContent}>
                <View style={styles.continueHeader}>
                  <Text style={styles.continueTitle}>
                    {continueLearning?.id
                      ? continueLearning.name
                      : 'Create Your First Subspace'}
                  </Text>
                  <Text style={styles.continueSubject}>
                    {continueLearning?.subject?.name || 'Begin your journey'}
                  </Text>
                </View>
                <View style={styles.stats}>
                  <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.statText}>
                    {continueLearning?.total_time_spent > 0
                      ? `${Math.round(continueLearning.total_time_spent)} mins`
                      : 'No time yet'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </AnimatedView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },

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
    padding: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },

  welcomeContainer: { marginBottom: spacing.md },
  userName: {
    ...typography.h1,
    fontSize: 52,
    color: colors.primary,
    fontWeight: '700',
  },

  streakContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: -15,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  streakInfo: { flexDirection: 'row', alignItems: 'center' },
  streakIcon: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.xl,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  streakText: { flex: 1 },
  streakCount: { ...typography.h1, fontSize: 34, fontWeight: '700' },
  streakLabel: { ...typography.h2, fontSize: 20, fontWeight: '600' },
  streakSub: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  sectionTitle: {
    ...typography.h2,
    fontSize: 22,
    marginBottom: spacing.sm,
  },

  continueSection: { marginBottom: spacing.md },
  continueCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  continueContent: { padding: spacing.md },
  continueHeader: { marginBottom: spacing.md },
  continueTitle: { ...typography.h3, fontSize: 20, marginBottom: spacing.xs },
  continueSubject: {
    ...typography.caption,
    fontSize: 15,
    color: colors.textSecondary,
  },

  stats: { flexDirection: 'row', alignItems: 'center' },
  statText: { ...typography.caption, fontSize: 15, marginLeft: spacing.xs },
});

export default HomeScreen;
