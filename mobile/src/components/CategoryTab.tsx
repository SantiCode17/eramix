import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CategoryTabProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
  count?: number;
}

export function CategoryTab({ label, icon, active, onPress, count }: CategoryTabProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        pressed && { opacity: 0.8 },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={active ? "#0A1628" : "rgba(255,255,255,0.55)"}
          style={{ marginRight: 5 }}
        />
      )}
      <Text style={[styles.label, active && styles.labelActive]}>
        {label}
      </Text>
      {count !== undefined && (
        <View style={[styles.countBadge, active && styles.countBadgeActive]}>
          <Text style={[styles.countText, active && styles.countTextActive]}>
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  pillActive: {
    backgroundColor: "#FFB800",
    borderColor: "#FFB800",
  },
  label: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  labelActive: {
    color: "#0A1628",
    fontWeight: "700",
  },
  countBadge: {
    marginLeft: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  countBadgeActive: {
    backgroundColor: "rgba(0,0,0,0.20)",
  },
  countText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.80)",
    fontWeight: "600",
  },
  countTextActive: {
    color: "#0A1628",
  },
});
