import React, { useState } from "react";
import { View, Dimensions } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface SortableItemProps {
  id: string;
  index: number;
  positions: Animated.SharedValue<Record<string, number>>;
  itemWidth: number;
  itemSpacing: number;
  onDragEnd: (newOrder: string[]) => void;
  children: React.ReactNode;
  ids: string[];
}

function SortableItem({ id, index, positions, itemWidth, itemSpacing, onDragEnd, children, ids }: SortableItemProps) {
  const isDragging = useSharedValue(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Use `index` prop for initial position — avoids reading shared value .value on the JS thread during render
  const positionX = useSharedValue(index * (itemWidth + itemSpacing));

  useAnimatedReaction(
    () => positions.value[id],
    (newOrder) => {
      if (!isDragging.value) {
        positionX.value = withSpring(newOrder * (itemWidth + itemSpacing));
      }
    }
  );

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;

      const newPosition = positionX.value + e.translationX;
      const newIndex = Math.max(0, Math.min(ids.length - 1, Math.round(newPosition / (itemWidth + itemSpacing))));
      
      const oldIndex = positions.value[id];

      if (newIndex !== oldIndex) {
        const newPositions = { ...positions.value };
        const idToSwap = Object.keys(newPositions).find(key => newPositions[key] === newIndex);
        if (idToSwap) {
          newPositions[idToSwap] = oldIndex;
          newPositions[id] = newIndex;
          positions.value = newPositions;
        }
      }
    })
    .onEnd(() => {
      isDragging.value = false;
      positionX.value = positions.value[id] * (itemWidth + itemSpacing);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      
      // Update the actual array order in JS
      const finalPositions = positions.value;
      const newOrder = [...ids].sort((a, b) => finalPositions[a] - finalPositions[b]);
      runOnJS(onDragEnd)(newOrder);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: positionX.value,
      top: 0,
      zIndex: isDragging.value ? 100 : 1,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: withSpring(isDragging.value ? 1.05 : 1) },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[animatedStyle, { width: itemWidth }]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

interface SortableHorizontalListProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemWidth: number;
  itemSpacing?: number;
  onOrderChange: (newData: T[]) => void;
}

export function SortableHorizontalList<T>({
  data,
  keyExtractor,
  renderItem,
  itemWidth,
  itemSpacing = 8,
  onOrderChange,
}: SortableHorizontalListProps<T>) {
  const ids = data.map(keyExtractor);
  
  const initialPositions = ids.reduce((acc, id, index) => {
    acc[id] = index;
    return acc;
  }, {} as Record<string, number>);

  const positions = useSharedValue(initialPositions);

  const handleDragEnd = (newIds: string[]) => {
    const newData = newIds.map(id => data.find(item => keyExtractor(item) === id)!);
    onOrderChange(newData);
  };

  return (
    <GestureHandlerRootView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 32 }}>
        <View style={{ height: 160, width: data.length * (itemWidth + itemSpacing), position: "relative" }}>
          {data.map((item, index) => {
            const id = keyExtractor(item);
            return (
              <SortableItem
                key={id}
                id={id}
                index={index}
                positions={positions}
                itemWidth={itemWidth}
                itemSpacing={itemSpacing}
                onDragEnd={handleDragEnd}
                ids={ids}
              >
                {renderItem(item, index)}
              </SortableItem>
            );
          })}
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}
