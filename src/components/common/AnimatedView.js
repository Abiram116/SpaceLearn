import React, { useEffect, useRef } from 'react';
import { Animated, View, Platform } from 'react-native';

const AnimatedView = ({ 
  children, 
  animation = 'fade', 
  delay = 0, 
  duration = 500,
  style,
  ...props 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    let animationConfig;
    
    switch (animation) {
      case 'fade':
        animationConfig = Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
          delay,
        });
        break;
      case 'scale':
        animationConfig = Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
            delay,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            delay,
            tension: 80,
            friction: 8,
          }),
        ]);
        break;
      case 'slide':
        animationConfig = Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
            delay,
          }),
        ]);
        break;
      default:
        animationConfig = Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
          delay,
        });
    }

    animationConfig.start();
  }, [fadeAnim, scaleAnim, slideAnim, animation, delay, duration]);

  // Apply the appropriate styles based on the animation type
  const getAnimationStyle = () => {
    switch (animation) {
      case 'fade':
        return { opacity: fadeAnim };
      case 'scale':
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        };
      case 'slide':
        return {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        };
      default:
        return { opacity: fadeAnim };
    }
  };

  return (
    <Animated.View style={[getAnimationStyle(), style]} {...props}>
      {children}
    </Animated.View>
  );
};

export default AnimatedView; 