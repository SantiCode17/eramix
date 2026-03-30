export const colors = {
  eu: {
    deep: "#003399",
    mid: "#1A4DB3",
    light: "#3366CC",
    star: "#FFCC00",
    orange: "#FF6B2B",
  },
  glass: {
    white: "rgba(255, 255, 255, 0.12)",
    whiteMid: "rgba(255, 255, 255, 0.18)",
    border: "rgba(255, 255, 255, 0.15)",
    borderMid: "rgba(255, 255, 255, 0.25)",
    borderStrong: "rgba(255, 255, 255, 0.35)",
  },
  text: {
    primary: "rgba(255, 255, 255, 0.95)",
    secondary: "rgba(255, 255, 255, 0.65)",
    disabled: "rgba(255, 255, 255, 0.35)",
    inverse: "#1A1A2E",
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
    info: "#2196F3",
  },
  overlay: "rgba(0, 0, 0, 0.5)",
} as const;

export const typography = {
  families: {
    heading: "SpaceGrotesk_700Bold",
    subheading: "SpaceGrotesk_600SemiBold",
    body: "Inter_400Regular",
    bodyMedium: "Inter_500Medium",
    bodyBold: "Inter_700Bold",
  },
  sizes: {
    h1: { fontSize: 32, lineHeight: 40 },
    h2: { fontSize: 24, lineHeight: 32 },
    h3: { fontSize: 20, lineHeight: 28 },
    body: { fontSize: 16, lineHeight: 24 },
    caption: { fontSize: 14, lineHeight: 20 },
    small: { fontSize: 12, lineHeight: 16 },
    button: { fontSize: 16, lineHeight: 24 },
  },
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const opacity = {
  glass: {
    surface: 0.12,
    elevated: 0.18,
    prominent: 0.25,
  },
  text: {
    primary: 0.95,
    secondary: 0.65,
    disabled: 0.35,
  },
  border: {
    subtle: 0.15,
    mid: 0.25,
    strong: 0.35,
  },
} as const;

export const blur = {
  surface: 20,
  elevated: 30,
  prominent: 40,
  overlay: 50,
} as const;

export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    stagger: 50,
  },
  spring: {
    default: { damping: 15, stiffness: 150, mass: 1 },
    bouncy: { damping: 10, stiffness: 180, mass: 0.8 },
    gentle: { damping: 20, stiffness: 120, mass: 1.2 },
  },
  easing: {
    enter: [0.0, 0.0, 0.2, 1] as const,
    exit: [0.4, 0.0, 1, 1] as const,
    standard: [0.4, 0.0, 0.2, 1] as const,
  },
  scale: {
    press: 0.96,
    active: 1.05,
  },
} as const;

export const shadows = {
  glass: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glassSmall: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: {
    shadowColor: "#FFCC00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 } as const;
export const MIN_TOUCH_SIZE = 44;
