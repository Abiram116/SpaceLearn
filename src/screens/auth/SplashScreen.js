import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { colors } from '../../styles/theme';
import { supabase } from '../../api/supabase/client';

const SplashScreen = ({ navigation }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    console.log('SplashScreen mounted');
    let mounted = true;
    let animationTimeout;
    let navigationTimeout;

    const startAnimations = () => {
      console.log('Starting animations');
      return new Promise((resolve) => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 20,
            friction: 7,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start(() => {
          console.log('Animations completed');
          resolve();
        });
      });
    };

    const navigateToScreen = (screenName) => {
      if (!mounted) return;
      console.log('Navigating to:', screenName);
      
      // Clear any existing timeouts
      if (navigationTimeout) clearTimeout(navigationTimeout);
      
      navigationTimeout = setTimeout(() => {
        if (mounted) {
          navigation.reset({
            index: 0,
            routes: [{ name: screenName }],
          });
        }
      }, 200);
    };

    const checkAuth = async () => {
      try {
        setIsLoading(true);
        console.log('Checking auth status...');

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Session check:', { hasSession: !!session, error: sessionError });

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        // If no session, go to auth
        if (!session) {
          console.log('No session found, will navigate to Auth');
          return navigateToScreen('Auth');
        }

        // Verify the user
        console.log('Verifying user...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('User check:', { hasUser: !!user, error: userError });

        if (userError) {
          console.error('User verification error:', userError);
          throw userError;
        }

        if (!user) {
          console.log('No user found, signing out and navigating to Auth');
          await supabase.auth.signOut();
          return navigateToScreen('Auth');
        }

        console.log('User verified, navigating to MainApp');
        return navigateToScreen('MainApp');

      } catch (error) {
        console.error('Auth check error:', error);
        setError(error.message);
        
        // Clear any invalid session
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
        
        return navigateToScreen('Auth');
      } finally {
        setIsLoading(false);
      }
    };

    const initialize = async () => {
      try {
        // Start with animations
        await startAnimations();
        
        // Set a timeout to ensure we move forward even if auth check hangs
        animationTimeout = setTimeout(() => {
          if (mounted && isLoading) {
            console.log('Auth check timeout, navigating to Auth');
            navigateToScreen('Auth');
          }
        }, 5000);

        // Check auth
        await checkAuth();
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Something went wrong. Please try again.');
        navigateToScreen('Auth');
      }
    };

    initialize();

    return () => {
      console.log('SplashScreen unmounting, cleaning up...');
      mounted = false;
      if (animationTimeout) clearTimeout(animationTimeout);
      if (navigationTimeout) clearTimeout(navigationTimeout);
    };
  }, [navigation]);

  const containerStyle = Platform.OS === 'web' ? {
    ...styles.container,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  } : styles.container;

  return (
    <View style={containerStyle}>
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
        {error && <Text style={styles.errorText}>{error}</Text>}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
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
  errorText: {
    color: colors.error,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default SplashScreen; 