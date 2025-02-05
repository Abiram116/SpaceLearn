import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../styles/theme';
import { supabase } from '../../api/supabase/client';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();

    // Check authentication status and navigate accordingly
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        // Navigate to Auth screen if no user, otherwise to App
        navigation.replace(user ? 'App' : 'Auth');
      } catch (error) {
        console.error('Error checking auth:', error);
        navigation.replace('Auth');
      }
    };

    // Wait for animation and check auth
    const timer = setTimeout(checkAuth, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Space Learn</Text>
        <Text style={styles.subtitle}>Explore. Learn. Grow.</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
});

export default SplashScreen; 