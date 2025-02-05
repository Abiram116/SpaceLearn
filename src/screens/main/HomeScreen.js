import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../styles/globalStyles';
import Card from '../components/Card';
import Button from '../components/Button';
import { subjectService } from '../services/subjectService';

const HomeScreen = ({ navigation }) => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [userStreak, setUserStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // TODO: Replace with actual API calls once user system is implemented
      setUserStreak(3); // Placeholder
      const activities = await subjectService.getRecentActivities();
      setRecentActivities(activities || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFeatureCard = (icon, title, description, onPress) => (
    <Card onPress={onPress} style={styles.featureCard}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </Card>
  );

  const renderRecentActivity = (activity) => (
    <TouchableOpacity
      key={activity.id}
      style={styles.activityItem}
      onPress={() => navigation.navigate('Subspace', {
        subspace: activity.subspace,
        subject: activity.subject,
      })}
    >
      <View style={styles.activityIcon}>
        <Ionicons name="time-outline" size={20} color={colors.primary} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.subspace.name}</Text>
        <Text style={styles.activitySubtitle}>{activity.subject.name}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>Space Learn</Text>
          <Text style={styles.subtitle}>Your personalized learning journey begins here</Text>
        </View>
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={24} color={colors.background} />
          <Text style={styles.streakCount}>{userStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          {recentActivities.length > 0 ? (
            recentActivities.map(renderRecentActivity)
          ) : (
            <Card style={styles.emptyStateCard}>
              <Text style={styles.emptyStateText}>
                Start learning by creating your first subject!
              </Text>
            </Card>
          )}
        </View>

        <Text style={styles.sectionTitle}>Get Started</Text>
        <View style={styles.featuresGrid}>
          {renderFeatureCard(
            'library-outline',
            'Create Subjects',
            'Organize your learning materials by subject',
            () => navigation.navigate('Subjects')
          )}
          {renderFeatureCard(
            'document-text-outline',
            'Take Notes',
            'Capture your thoughts and learnings',
            () => navigation.navigate('Notes')
          )}
          {renderFeatureCard(
            'calendar-outline',
            'Track Assignments',
            'Stay on top of your tasks',
            () => navigation.navigate('Assignments')
          )}
          {renderFeatureCard(
            'person-outline',
            'Your Profile',
            'Customize your learning experience',
            () => navigation.navigate('Profile')
          )}
        </View>

        <View style={styles.actionSection}>
          <Button
            title="Start Learning"
            onPress={() => navigation.navigate('Subjects')}
            size="large"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...shadows.medium,
  },
  welcomeText: {
    ...typography.h3,
    color: colors.background,
    opacity: 0.9,
  },
  appName: {
    ...typography.h1,
    color: colors.background,
    marginVertical: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.background,
    opacity: 0.8,
    maxWidth: '80%',
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  streakCount: {
    ...typography.h2,
    color: colors.background,
    marginVertical: spacing.xs,
  },
  streakLabel: {
    ...typography.caption,
    color: colors.background,
    opacity: 0.9,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: colors.ripple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  activitySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyStateCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    marginBottom: spacing.md,
    alignItems: 'center',
    padding: spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: colors.ripple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionSection: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});

export default HomeScreen; 