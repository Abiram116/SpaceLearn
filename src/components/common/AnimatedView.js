import React, { useEffect, useRef } from 'react';
import { Animated, Platform, View } from 'react-native';
import { fadeIn, scaleIn, slideUp } from '../../utils/animations';
import gsap from 'gsap';

const AnimatedView = ({ 
  children, 
  animation = 'fade', // fade, scale, slide
  delay = 0,
  duration = 800,
  style,
}) => {
  const viewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web animations using GSAP
      switch (animation) {
        case 'fade':
          fadeIn(viewRef.current, delay);
          break;
        case 'scale':
          scaleIn(viewRef.current, delay);
          break;
        case 'slide':
          slideUp(viewRef.current, delay);
          break;
        default:
          fadeIn(viewRef.current, delay);
      }
    } else {
      // React Native animations
      let animationConfig;
      switch (animation) {
        case 'fade':
          animationConfig = Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          });
          break;
        case 'scale':
          animationConfig = Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 20,
            friction: 7,
            delay,
            useNativeDriver: true,
          });
          break;
        case 'slide':
          animationConfig = Animated.timing(slideAnim, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          });
          break;
        default:
          animationConfig = Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          });
      }
      animationConfig.start();
    }
  }, [animation, delay, duration, fadeAnim, scaleAnim, slideAnim]);

  if (Platform.OS === 'web') {
    return (
      <View ref={viewRef} style={style}>
        {children}
      </View>
    );
  }

  const getAnimatedStyle = () => {
    switch (animation) {
      case 'fade':
        return { opacity: fadeAnim };
      case 'scale':
        return { transform: [{ scale: scaleAnim }] };
      case 'slide':
        return { transform: [{ translateY: slideAnim }] };
      default:
        return { opacity: fadeAnim };
    }
  };

  return (
    <Animated.View style={[style, getAnimatedStyle()]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedView; 