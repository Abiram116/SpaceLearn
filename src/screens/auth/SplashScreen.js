import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { colors } from '../../styles/theme';
import { supabase } from '../../api/supabase/client';

const SplashScreen = ({ navigation }) => {
  const [error, setError] = useState(null);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    console.log('SplashScreen mounted');
    
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
    ]).start(() => {
      console.log('Animation completed');
      checkAuth();
    });

    // Check authentication status and navigate accordingly
    const checkAuth = async () => {
      console.log('Checking auth...');
      try {
        const { data, error: authError } = await supabase.auth.getUser();
        console.log('Auth response:', { data, authError });

        if (authError) {
          console.error('Auth error:', authError);
          setError(authError.message);
          navigation.replace('Auth');
          return;
        }

        if (data?.user) {
          console.log('User found, navigating to App');
          navigation.replace('App');
        } else {
          console.log('No user found, navigating to Auth');
          navigation.replace('Auth');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setError(error.message);
        navigation.replace('Auth');
      }
    };
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