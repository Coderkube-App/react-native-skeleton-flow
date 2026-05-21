# react-native-skeleton-flow 🚀

A zero-dependency, high-performance, automatic layout skeleton placeholder creator for **React Native** and **Expo**. It preserves your exact layout structures and turns your text, images, and container components into beautiful, hardware-accelerated shimmering skeleton views.

---

## Features

- ⚡ **GPU-Accelerated Shimmer**: Uses standard native driver transforms (`useNativeDriver: true`) for 60FPS fluid diagonal skew animations.
- 🤖 **Automatic Layout Scanning**: Automatically translates your existing `View`, `Text`, and `Image` layouts into placeholders. No need to recreate layout metrics manually.
- 📦 **Zero Native Code**: No complex linking or native dependencies required. 100% compatible with **Expo Go** and **React Native Bare**.
- 🛠️ **Manual Customization**: Exposes `<SkeletonFlow.Item>` for building bespoke layout loading placeholders.
- 🎨 **Fully Customizable**: Modify background colors, gradient highlight speeds, curves, and shading.

---

## Installation

```bash
npm install react-native-skeleton-flow
```
or
```bash
yarn add react-native-skeleton-flow
```

---

## Usage

### 1. Automatic Mode (Default)
Simply wrap your visual screen with `<SkeletonFlow>` and pass the `loading` state. The component tree's structural layout will be converted into shimmering bones automatically:

```tsx
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SkeletonFlow } from 'react-native-skeleton-flow';

export default function ProfileScreen() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <SkeletonFlow loading={isLoading} style={styles.container}>
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: 'https://placekitten.com/100/100' }} 
          style={styles.avatar} 
        />
        <View style={styles.profileText}>
          <Text style={styles.name}>Jane Doe</Text>
          <Text style={styles.bio}>Software Engineer & Designer</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.body}>
          This text content automatically turns into multiple lines of shimmering bars based on length!
        </Text>
      </View>
    </SkeletonFlow>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileText: {
    marginLeft: 16,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    marginTop: 10,
  },
  body: {
    fontSize: 15,
  },
});
```

---

### 2. Manual Placement
If you want to construct custom-tailored skeleton loading cards explicitly, use `<SkeletonFlow.Item>`:

```tsx
import { SkeletonFlow } from 'react-native-skeleton-flow';

const LoadingCard = () => (
  <SkeletonFlow loading={true}>
    <View style={{ flexDirection: 'row', padding: 12 }}>
      <SkeletonFlow.Item style={{ width: 50, height: 50 }} borderRadius={25} />
      <View style={{ marginLeft: 12, justifyContent: 'center' }}>
        <SkeletonFlow.Item style={{ width: 120, height: 16 }} />
        <SkeletonFlow.Item style={{ width: 80, height: 12, marginTop: 6 }} />
      </View>
    </View>
  </SkeletonFlow>
);
```

---

## API Properties

### `<SkeletonFlow>`
Wraps the skeleton context, initiating the animated shimmer timeline loop.

| Parameter | Type | Default | Description |
|---|---|---|---|
| **`loading`** | `boolean` | (Required) | When `true`, automatically swaps visual content for skeleton loaders. |
| **`backgroundColor`** | `string` | `#E2E8F0` | Base background color of the bone shapes. |
| **`highlightColor`** | `string` | `rgba(255,255,255,0.55)` | Shimmer overlay color. |
| **`duration`** | `number` | `1500` | Shimmer loop duration in milliseconds. |
| **`style`** | `StyleProp<ViewStyle>` | `undefined` | Style overrides for the top-level container. |

---

## License

MIT
