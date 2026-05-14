/**
 * ────────────────────────────────────────────────────────
 *  DonutChart.tsx — Gráfico donut mejorado para categorías de gasto
 * ────────────────────────────────────────────────────────
 */

import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle, Path, G, Text as SvgText } from "react-native-svg";
import { colors, spacing, typography } from "@/design-system/tokens";

interface DonutChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface DonutChartProps {
  data: DonutChartData[];
  total: number;
  innerRadius?: number;
  outerRadius?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function DonutChart({
  data,
  total,
  innerRadius = 60,
  outerRadius = 90,
}: DonutChartProps) {
  const chartSize = outerRadius * 2 + 40;
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;

  let currentAngle = -90; // Start from top
  const paths: Array<{
    d: string;
    color: string;
    name: string;
    percentage: number;
  }> = [];

  data.forEach((item) => {
    let sliceAngle = (item.percentage / 100) * 360;
    if (sliceAngle >= 360) {
      sliceAngle = 359.99; // SVG arc command fails when start and end points are identical
    }

    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate outer arc points
    const x1 = centerX + outerRadius * Math.cos(startRad);
    const y1 = centerY + outerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(endRad);
    const y2 = centerY + outerRadius * Math.sin(endRad);

    // Calculate inner arc points
    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    // Determine if arc is large (> 180 degrees)
    const largeArc = sliceAngle > 180 ? 1 : 0;

    // Create SVG path for the donut slice
    const pathD = `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    paths.push({
      d: pathD,
      color: item.color,
      name: item.name,
      percentage: item.percentage,
    });

    currentAngle = endAngle;
  });

  // Format currency for center text
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={st.container}>
      {/* SVG + center overlay positioned together */}
      <View style={{ width: chartSize, height: chartSize }}>
        <Svg
          width={chartSize}
          height={chartSize}
          viewBox={`0 0 ${chartSize} ${chartSize}`}
        >
          {/* Draw segments */}
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path.d}
              fill={path.color}
              opacity={0.9}
            />
          ))}

          {/* Center circle with total */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={innerRadius - 5}
            fill="rgba(15, 21, 53, 0.95)"
            opacity={0.95}
          />
        </Svg>

        {/* Center text overlay — positioned relative to this wrapper */}
        <View
          style={[
            st.centerContent,
            {
              width: innerRadius * 1.8,
              height: innerRadius * 1.8,
              top: centerY - innerRadius * 0.9,
              left: centerX - innerRadius * 0.9,
            },
          ]}
        >
          <Text style={st.centerLabel}>Total</Text>
          <Text style={st.centerValue}>{formatCurrency(total)}</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={st.legend}>
        {data.map((item, index) => (
          <View key={index} style={st.legendItem}>
            <View
              style={[
                st.legendColorDot,
                { backgroundColor: item.color },
              ]}
            />
            <View style={st.legendInfo}>
              <Text style={st.legendName}>{item.name}</Text>
              <Text style={st.legendValue}>
                {formatCurrency(item.value)} ({item.percentage.toFixed(1)}%)
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  centerValue: {
    fontFamily: typography.families.heading,
    fontSize: 24,
    color: colors.text.primary,
    marginTop: 4,
  },
  legend: {
    width: "100%",
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  legendColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendInfo: {
    flex: 1,
  },
  legendName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.primary,
  },
  legendValue: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});

// Export default values for radius
export const DEFAULT_INNER_RADIUS = 60;
export const DEFAULT_OUTER_RADIUS = 90;
