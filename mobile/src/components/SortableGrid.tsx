import React, { useState } from "react";
import { View, Dimensions } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";

interface SortableGridItemProps {
  id: string;
  index: number;
  positions: Animated.SharedValue<Record<string, number>>;
  itemWidth: number;
  itemHeight: number;
  itemSpacing: number;
  columns: number;
  onDragEnd: (newOrder: string[]) => void;
  children: React.ReactNode;
  ids: string[];
}

function SortableGridItem({ id, index, positions, itemWidth, itemHeight, itemSpacing, columns, onDragEnd, children, ids }: SortableGridItemProps) {
  const isDragging = useSharedValue(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const getPosition = (idx: number) => {
    "worklet";
    const col = idx % columns;
    const row = Math.floor(idx / columns);
    return {
      x: col * (itemWidth + itemSpacing),
      y: row * (itemHeight + itemSpacing),
    };
  };

  // Use `index` prop for initial position — avoids reading shared value .value on the JS thread during render
  const initialPos = getPosition(index);
  const positionX = useSharedValue(initialPos.x);
  const positionY = useSharedValue(initialPos.y);

  useAnimatedReaction(
    () => positions.value[id],
    (newOrder) => {
      const pos = getPosition(newOrder);
      if (!isDragging.value) {
        positionX.value = withSpring(pos.x);
        positionY.value = withSpring(pos.y);
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

      const newPositionX = positionX.value + e.translationX;
      const newPositionY = positionY.value + e.translationY;

      const col = Math.max(0, Math.min(columns - 1, Math.round(newPositionX / (itemWidth + itemSpacing))));
      const row = Math.max(0, Math.round(newPositionY / (itemHeight + itemSpacing)));
      const newIndex = Math.min(ids.length - 1, row * columns + col);

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
      const finalPos = getPosition(positions.value[id]);
      positionX.value = finalPos.x;
      positionY.value = finalPos.y;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      
      const finalPositions = positions.value;
      const newOrder = [...ids].sort((a, b) => finalPositions[a] - finalPositions[b]);
      runOnJS(onDragEnd)(newOrder);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: positionX.value,
      top: positionY.value,
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
      <Animated.View style={[animatedStyle, { width: itemWidth, height: itemHeight }]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

interface SortableGridProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemWidth: number;
  itemHeight: number;
  itemSpacing?: number;
  columns?: number;
  onOrderChange: (newData: T[]) => void;
}

export function SortableGrid<T>({
  data,
  keyExtractor,
  renderItem,
  itemWidth,
  itemHeight,
  itemSpacing = 10,
  columns = 3,
  onOrderChange,
}: SortableGridProps<T>) {
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

  const rows = Math.ceil(data.length / columns);
  const containerHeight = rows * (itemHeight + itemSpacing);

  return (
    <GestureHandlerRootView>
      <View style={{ height: containerHeight, width: "100%", position: "relative" }}>
        {data.map((item, index) => {
          const id = keyExtractor(item);
          return (
            <SortableGridItem
              key={id}
              id={id}
              index={index}
              positions={positions}
              itemWidth={itemWidth}
              itemHeight={itemHeight}
              itemSpacing={itemSpacing}
              columns={columns}
              onDragEnd={handleDragEnd}
              ids={ids}
            >
              {renderItem(item, index)}
            </SortableGridItem>
          );
        })}
      </View>
    </GestureHandlerRootView>
  );
}
