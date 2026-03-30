import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography } from "@/constants";

export default function HomeScreen(): React.JSX.Element {
  return (
    <LinearGradient
      colors={[Colors.background.start, Colors.background.end]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={styles.title}>EraMix</Text>
        <Text style={styles.subtitle}>Connect. Explore. Belong.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    fontSize: 48,
    lineHeight: 56,
    textAlign: "center",
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: 8,
    textAlign: "center",
  },
});
