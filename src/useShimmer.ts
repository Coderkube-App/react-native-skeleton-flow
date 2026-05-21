import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export interface UseShimmerOptions {
  duration?: number;
  easing?: (value: number) => number;
}

/**
 * A custom hook that runs a loop from 0 to 1 on the GPU thread.
 */
export const useShimmer = (options: UseShimmerOptions = {}) => {
  const {
    duration = 1500,
    easing = Easing.bezier(0.4, 0, 0.6, 1),
  } = options;

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing,
        useNativeDriver: true,
      })
    );

    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
    };
  }, [animatedValue, duration, easing]);

  return animatedValue;
};
