import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

/**
 * AnimatedView component that supports multiple animation types
 * 
 * @param {Object} props Component props
 * @param {string} [props.animation='fade'] - Animation type (fade, slideUp, slideDown, slideLeft, slideRight, scale)
 * @param {number} [props.duration=300] - Animation duration in milliseconds
 * @param {number} [props.delay=0] - Animation delay in milliseconds
 * @param {boolean} [props.triggerOnMount=true] - Whether to trigger animation on mount
 * @param {boolean} [props.triggerOnUpdate=false] - Whether to trigger animation when component updates
 * @param {Object} [props.style] - Additional styles for the animated view
 */
const AnimatedView = ({
  children,
  animation = 'fade',
  duration = 300,
  delay = 0,
  triggerOnMount = true,
  triggerOnUpdate = false,
  style,
  ...props
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const getAnimationStyle = () => {
    switch (animation) {
      case 'slideUp':
        return {
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      case 'slideDown':
        return {
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        };
      case 'slideLeft':
        return {
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      case 'slideRight':
        return {
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        };
      case 'scale':
        return {
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
      case 'fade':
      default:
        return {
          opacity: animatedValue,
        };
    }
  };

  const startAnimation = () => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (triggerOnMount) {
      startAnimation();
    }
  }, []);

  // If triggerOnUpdate is true, run animation when component updates
  useEffect(() => {
    if (triggerOnUpdate) {
      startAnimation();
    }
  }, [children, triggerOnUpdate]);

  return (
    <Animated.View style={[styles.container, getAnimationStyle(), style]} {...props}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AnimatedView; 