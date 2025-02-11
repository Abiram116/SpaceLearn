import { Platform } from 'react-native';
import gsap from 'gsap';
import { Animated } from 'react-native';

const isWeb = Platform.OS === 'web';

export const pageTransition = (element, direction = 'forward') => {
  if (!isWeb || !element) return;

  const duration = 0.6;
  const ease = 'power2.inOut';

  if (direction === 'forward') {
    gsap.fromTo(element,
      {
        opacity: 0,
        x: 50,
      },
      {
        opacity: 1,
        x: 0,
        duration,
        ease,
        clearProps: 'all',
      }
    );
  } else {
    gsap.fromTo(element,
      {
        opacity: 0,
        x: -50,
      },
      {
        opacity: 1,
        x: 0,
        duration,
        ease,
        clearProps: 'all',
      }
    );
  }
};

export const fadeIn = (element, delay = 0) => {
  if (!isWeb || !element) return;

  gsap.fromTo(element,
    {
      opacity: 0,
      y: 20,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay,
      ease: 'power2.out',
      clearProps: 'all',
    }
  );
};

export const staggerChildren = (parent, stagger = 0.1) => {
  if (!isWeb || !parent) return;

  gsap.fromTo(
    parent.children,
    {
      opacity: 0,
      y: 20,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger,
      ease: 'power2.out',
      clearProps: 'all',
    }
  );
};

export const scaleIn = (element, delay = 0) => {
  if (!isWeb || !element) return;

  gsap.fromTo(element,
    {
      opacity: 0,
      scale: 0.8,
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      delay,
      ease: 'back.out(1.7)',
      clearProps: 'all',
    }
  );
};

export const buttonPop = (element) => {
  if (!isWeb || !element) return;

  gsap.fromTo(element,
    {
      scale: 0.95,
    },
    {
      scale: 1,
      duration: 0.3,
      ease: 'back.out(2)',
      clearProps: 'all',
    }
  );
};

export const slideUp = (element, delay = 0) => {
  if (!isWeb || !element) return;

  gsap.fromTo(element,
    {
      opacity: 0,
      y: 50,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay,
      ease: 'power3.out',
      clearProps: 'all',
    }
  );
};

export const cardHover = (element) => {
  if (!isWeb || !element) return;

  gsap.to(element, {
    y: -5,
    scale: 1.02,
    duration: 0.3,
    ease: 'power2.out',
  });
};

export const cardHoverExit = (element) => {
  if (!isWeb || !element) return;

  gsap.to(element, {
    y: 0,
    scale: 1,
    duration: 0.3,
    ease: 'power2.out',
    clearProps: 'all',
  });
};

// Add React Native specific animations for non-web platforms
export const nativeAnimations = {
  fadeIn: (animatedValue, duration = 800) => {
    if (isWeb) return;
    
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  },

  slideUp: (animatedValue, duration = 800) => {
    if (isWeb) return;

    animatedValue.setValue(50);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start();
  },

  scaleIn: (animatedValue, duration = 600) => {
    if (isWeb) return;

    animatedValue.setValue(0.8);
    Animated.spring(animatedValue, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  },
}; 