import React, { createContext, useContext } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useShimmer, UseShimmerOptions } from './useShimmer';
import { SkeletonItem } from './SkeletonItem';

// ──────────────────────────────────────────────
// 1. EXTRACT LAYOUT STYLES HELPER
// ──────────────────────────────────────────────
const extractLayoutStyles = (style: any): ViewStyle => {
  if (!style) return {};
  const flat = StyleSheet.flatten(style);
  const layoutKeys = [
    'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical',
    'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingHorizontal', 'paddingVertical',
    'flex', 'flexGrow', 'flexShrink', 'flexBasis',
    'flexDirection', 'alignItems', 'justifyContent', 'alignSelf',
    'position', 'top', 'bottom', 'left', 'right',
    'aspectRatio', 'gap', 'rowGap', 'columnGap',
    'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'
  ];
  const extracted: any = {};
  for (const key of layoutKeys) {
    if (flat[key] !== undefined) {
      extracted[key] = flat[key];
    }
  }
  return extracted;
};

// ──────────────────────────────────────────────
// 2. SKELETON CONTEXT & HOOKS
// ──────────────────────────────────────────────
export interface SkeletonContextType {
  loading: boolean;
  shimmerAnim: Animated.Value;
  backgroundColor: string;
  highlightColor: string;
}

const SkeletonContext = createContext<SkeletonContextType | null>(null);

export const useSkeleton = () => {
  const context = useContext(SkeletonContext);
  if (!context) {
    throw new Error('useSkeleton must be used inside a SkeletonFlow provider.');
  }
  return context;
};

// ──────────────────────────────────────────────
// 3. SKELETON FLOW COMPONENT
// ──────────────────────────────────────────────
export interface SkeletonFlowProps {
  children: React.ReactNode;
  loading: boolean;
  backgroundColor?: string;
  highlightColor?: string;
  duration?: number;
  easing?: UseShimmerOptions['easing'];
  style?: StyleProp<ViewStyle>;
}

// Subcomponent for manual placements
interface SkeletonFlowItemProps {
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

const SkeletonFlowItem: React.FC<SkeletonFlowItemProps> = ({ style, borderRadius }) => {
  const { shimmerAnim, backgroundColor, highlightColor } = useSkeleton();
  return (
    <SkeletonItem
      shimmerAnim={shimmerAnim}
      backgroundColor={backgroundColor}
      highlightColor={highlightColor}
      borderRadius={borderRadius}
      style={style}
    />
  );
};

// Recursive child replacement logic
const convertToSkeleton = (
  node: React.ReactNode,
  shimmerAnim: Animated.Value,
  config: { backgroundColor: string; highlightColor: string }
): React.ReactNode => {
  if (!node) return null;

  return React.Children.map(node, (child) => {
    if (!React.isValidElement(child)) {
      if (typeof child === 'string' || typeof child === 'number') {
        return (
          <SkeletonItem
            shimmerAnim={shimmerAnim}
            backgroundColor={config.backgroundColor}
            highlightColor={config.highlightColor}
            style={{ width: 80, height: 14, marginVertical: 4 }}
          />
        );
      }
      return child;
    }

    const props = child.props as any;
    const type = child.type as any;

    // Check if it is already a SkeletonItem or SkeletonFlowItem
    if (type === SkeletonItem || type === SkeletonFlowItem) {
      return React.cloneElement(child, { shimmerAnim } as any);
    }

    const typeStr = type?.displayName || type?.name || (typeof type === 'string' ? type : '');
    const isLayoutContainer =
      typeStr === 'View' ||
      typeStr === 'ScrollView' ||
      typeStr === 'SafeAreaView' ||
      typeStr === 'KeyboardAvoidingView';

    if (isLayoutContainer) {
      const layoutStyles = extractLayoutStyles(props.style);

      // If it is a container with no children, treat it as a block item
      if (!props.children || React.Children.count(props.children) === 0) {
        return (
          <SkeletonItem
            shimmerAnim={shimmerAnim}
            backgroundColor={config.backgroundColor}
            highlightColor={config.highlightColor}
            borderRadius={layoutStyles.borderRadius as number || 4}
            style={layoutStyles}
          />
        );
      }

      // Clone container keeping structure but substituting children
      return React.cloneElement(
        child,
        {
          style: [
            props.style,
            {
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              shadowOpacity: 0,
              elevation: 0,
            },
          ],
        },
        convertToSkeleton(props.children, shimmerAnim, config)
      );
    }

    // Leaf nodes
    const isTextNode = typeStr === 'Text' || typeStr === 'TextView';
    const isImageNode = typeStr === 'Image' || typeStr === 'ImageView';

    if (isTextNode || isImageNode) {
      const style = StyleSheet.flatten(props.style) || {};
      const layoutStyles = extractLayoutStyles(style);

      // Height fallbacks
      if (layoutStyles.height === undefined) {
        layoutStyles.height = isTextNode ? 14 : 60;
      }

      // Width fallbacks
      if (layoutStyles.width === undefined) {
        if (isTextNode) {
          const content = props.children;
          if (typeof content === 'string' || typeof content === 'number') {
            layoutStyles.width = Math.min(280, Math.max(40, content.toString().length * 7));
          } else {
            layoutStyles.width = '85%';
          }
        } else {
          layoutStyles.width = 60;
        }
      }

      const finalBorderRadius =
        layoutStyles.borderRadius !== undefined
          ? (layoutStyles.borderRadius as number)
          : isImageNode
          ? 8
          : 4;

      return (
        <SkeletonItem
          shimmerAnim={shimmerAnim}
          backgroundColor={config.backgroundColor}
          highlightColor={config.highlightColor}
          borderRadius={finalBorderRadius}
          style={layoutStyles}
        />
      );
    }

    // Handle custom elements that have style but no children (leaf block)
    const style = StyleSheet.flatten(props.style) || {};
    if (style && Object.keys(style).length > 0 && (!props.children || React.Children.count(props.children) === 0)) {
      const layoutStyles = extractLayoutStyles(style);
      return (
        <SkeletonItem
          shimmerAnim={shimmerAnim}
          backgroundColor={config.backgroundColor}
          highlightColor={config.highlightColor}
          borderRadius={layoutStyles.borderRadius as number || 4}
          style={layoutStyles}
        />
      );
    }

    // If it is a custom wrapper with children, drill down to preserve hierarchy layout
    if (props.children) {
      try {
        return React.cloneElement(
          child,
          {
            ...props,
          },
          convertToSkeleton(props.children, shimmerAnim, config)
        );
      } catch {
        return (
          <SkeletonItem
            shimmerAnim={shimmerAnim}
            backgroundColor={config.backgroundColor}
            highlightColor={config.highlightColor}
            style={{ width: '100%', height: 40, marginVertical: 4 }}
          />
        );
      }
    }

    return (
      <SkeletonItem
        shimmerAnim={shimmerAnim}
        backgroundColor={config.backgroundColor}
        highlightColor={config.highlightColor}
        style={{ width: '100%', height: 40, marginVertical: 4 }}
      />
    );
  });
};

export const SkeletonFlowComponent: React.FC<SkeletonFlowProps> & {
  Item: React.FC<SkeletonFlowItemProps>;
} = ({
  children,
  loading,
  backgroundColor = '#E2E8F0',
  highlightColor = 'rgba(255, 255, 255, 0.55)',
  duration = 1500,
  easing,
  style,
}) => {
  const shimmerAnim = useShimmer({ duration, easing });

  if (!loading) {
    return <View style={style}>{children}</View>;
  }

  const contextValue: SkeletonContextType = {
    loading,
    shimmerAnim,
    backgroundColor,
    highlightColor,
  };

  return (
    <SkeletonContext.Provider value={contextValue}>
      <View style={style}>
        {convertToSkeleton(children, shimmerAnim, { backgroundColor, highlightColor })}
      </View>
    </SkeletonContext.Provider>
  );
};

SkeletonFlowComponent.Item = SkeletonFlowItem;
