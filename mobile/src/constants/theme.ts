export const Colors = {
  eu: {
    deep: "#003399",
    mid: "#1A4DB3",
    light: "#3366CC",
    star: "#FFCC00",
    orange: "#FF6B2B",
  },
  glass: {
    white: "rgba(255, 255, 255, 0.12)",
    border: "rgba(255, 255, 255, 0.15)",
    borderMid: "rgba(255, 255, 255, 0.25)",
    borderStrong: "rgba(255, 255, 255, 0.35)",
  },
  text: {
    primary: "rgba(255, 255, 255, 0.95)",
    secondary: "rgba(255, 255, 255, 0.65)",
    disabled: "rgba(255, 255, 255, 0.35)",
  },
  background: {
    start: "#003399",
    end: "#1A1A2E",
  },
  accent: {
    start: "#FFCC00",
    end: "#FF6B2B",
  },
  status: {
    success: "#4CAF50",
    error: "#F44336",
    warning: "#FF9800",
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const GlassConfig = {
  blur: 20,
  opacity: 0.12,
  borderOpacity: 0.15,
} as const;

export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
} as const;

export const Typography = {
  h1: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: "700" as const },
  h3: { fontSize: 20, lineHeight: 28, fontWeight: "600" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: "500" as const },
  bodyBold: { fontSize: 16, lineHeight: 24, fontWeight: "700" as const },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  small: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  button: { fontSize: 16, lineHeight: 24, fontWeight: "600" as const },
} as const;

export const HitSlop = { top: 10, bottom: 10, left: 10, right: 10 } as const;
export const MinTouchSize = 44;
