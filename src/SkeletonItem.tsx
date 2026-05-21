import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface SkeletonItemProps {
  shimmerAnim: Animated.Value;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  highlightColor?: string;
  borderRadius?: number;
}

export const SkeletonItem: React.FC<SkeletonItemProps> = ({
  shimmerAnim,
  style,
  backgroundColor = '#E2E8F0', // zinc-200 / slate-200
  highlightColor = 'rgba(255, 255, 255, 0.55)', // soft white shimmer
  borderRadius = 4,
}) => {
  const [width, setWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth } = event.nativeEvent.layout;
    setWidth(layoutWidth);
  };

  // Only animate if the width has been resolved
  const translateX = width > 0
    ? shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width - 60, width + 60],
      })
    : 0;

  const AnimatedView = Animated.View as any;

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.container,
        {
          backgroundColor,
          borderRadius,
        },
        style,
      ]}
    >
      {width > 0 && (
        <AnimatedView
          style={[
            styles.shimmer,
            {
              backgroundColor: highlightColor,
              width: Math.max(50, width * 0.4), // 40% of parent width, minimum 50px
              transform: [
                { translateX },
                { skewX: '-20deg' },
              ],
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    opacity: 0.7,
  },
});
