import { Platform } from "react-native";

export const palette = {
  midnight: "#06081A",
  deepNavy: "#0B0E2A",
  royalBlue: "#1A3DE8",
  electricBlue: "#3B6BFF",
  skyBlue: "#6B9CFF",
  cyan: "#00D4FF",
  gold: "#FFD700",
  amber: "#FFAB00",
  tangerine: "#FF6D3F",
  coral: "#FF4F6F",
  rose: "#FF2D87",
  emerald: "#00D68F",
  teal: "#00BFA6",
  lavender: "#B47AFF",
  violet: "#8B5CF6",
  white: "#FFFFFF",
  offWhite: "#F0F2FF",
  pureBlack: "#000000",
};

export const colors = {
  eu: {
    deep: "#003399",
    mid: "#1A4DB3",
    light: "#3366CC",
    star: "#FFD700",
    starLight: "#FFECB3",
    orange: "#FF6B2B",
  },
  glass: {
    white: "rgba(255, 255, 255, 0.08)",
    whiteMid: "rgba(255, 255, 255, 0.14)",
    whiteStrong: "rgba(255, 255, 255, 0.22)",
    border: "rgba(255, 255, 255, 0.10)",
    borderMid: "rgba(255, 255, 255, 0.18)",
    borderStrong: "rgba(255, 255, 255, 0.30)",
  },
  text: {
    primary: "rgba(255, 255, 255, 0.95)",
    secondary: "rgba(255, 255, 255, 0.60)",
    tertiary: "rgba(255, 255, 255, 0.40)",
    disabled: "rgba(255, 255, 255, 0.25)",
    inverse: "#06081A",
    accent: "#FFD700",
    link: "#6B9CFF",
  },
  background: {
    start: "#06081A",
    mid: "#0B0E2A",
    end: "#0F1535",
    card: "rgba(15, 21, 53, 0.60)",
    elevated: "rgba(20, 28, 68, 0.65)",
    input: "rgba(11, 14, 42, 0.55)",
    overlay: "rgba(6, 8, 26, 0.85)",
  },
  gradient: {
    primary: ["#1A3DE8", "#3B6BFF"] as const,
    accent: ["#FFD700", "#FF6D3F"] as const,
    warm: ["#FF6D3F", "#FF4F6F"] as const,
    cool: ["#3B6BFF", "#00D4FF"] as const,
    dark: ["#06081A", "#0F1535"] as const,
    surface: ["rgba(15, 21, 53, 0.55)", "rgba(11, 14, 42, 0.70)"] as const,
    hero: ["#1A3DE8", "#8B5CF6", "#FF6D3F"] as const,
    emerald: ["#00D68F", "#00BFA6"] as const,
    sunset: ["#FF6D3F", "#FFD700"] as const,
    night: ["#0B0E2A", "#06081A"] as const,
  },
  status: {
    online: "#00D68F",
    offline: "#6B7280",
    away: "#FFAB00",
    busy: "#FF4F6F",
    error: "#FF4F6F",
    errorBg: "rgba(255, 79, 111, 0.10)",
    success: "#00D68F",
    successBg: "rgba(0, 214, 143, 0.10)",
    warning: "#FFAB00",
    warningBg: "rgba(255, 171, 0, 0.10)",
    info: "#3B6BFF",
    infoBg: "rgba(59, 107, 255, 0.10)",
  },
  overlay: {
    light: "rgba(6, 8, 26, 0.40)",
    medium: "rgba(6, 8, 26, 0.60)",
    heavy: "rgba(6, 8, 26, 0.80)",
    black: "rgba(0, 0, 0, 0.90)",
  },
};

export const typography = {
  families: {
    heading: "SpaceGrotesk_700Bold",
    subheading: "SpaceGrotesk_600SemiBold",
    body: "Inter_400Regular",
    bodyMedium: "Inter_500Medium",
    bodyBold: "Inter_700Bold",
  },
  sizes: {
    hero: { fontSize: 36, lineHeight: 42 },
    h1: { fontSize: 28, lineHeight: 34 },
    h2: { fontSize: 22, lineHeight: 28 },
    h3: { fontSize: 18, lineHeight: 24 },
    h4: { fontSize: 16, lineHeight: 22 },
    body: { fontSize: 15, lineHeight: 22 },
    bodySmall: { fontSize: 13, lineHeight: 18 },
    caption: { fontSize: 12, lineHeight: 16 },
    tiny: { fontSize: 10, lineHeight: 14 },
    button: { fontSize: 15, lineHeight: 20 },
    buttonLarge: { fontSize: 17, lineHeight: 22 },
    tab: { fontSize: 11, lineHeight: 14 },
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const opacity = {
  glass: { surface: 0.08, elevated: 0.14, prominent: 0.22, intense: 0.35 },
  border: { subtle: 0.10, mid: 0.18, strong: 0.30 },
};

export const blur = { surface: 20, elevated: 40, prominent: 60, overlay: 80 };

export const sizes = {
  avatarSm: 36, avatarMd: 48, avatarLg: 72, avatarXl: 96,
  buttonSm: 38, buttonMd: 48, buttonLg: 56,
  inputHeight: 58, headerHeight: 56, tabBarHeight: 72,
  iconSm: 18, iconMd: 24, iconLg: 32,
};

const shadowBase = Platform.OS === "ios" ? {} : { elevation: 0 };

export const shadows = {
  none: { ...shadowBase },
  sm: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
  md: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.20, shadowRadius: 8, elevation: 4 },
  lg: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  xl: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.30, shadowRadius: 24, elevation: 12 },
  glass: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 6 },
  glassSmall: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4 },
  glow: { shadowColor: "#FFD700", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 6 },
  glowBlue: { shadowColor: "#3B6BFF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 6 },
  glowCoral: { shadowColor: "#FF4F6F", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 6 },
  glowEmerald: { shadowColor: "#00D68F", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 6 },
  elevated: { shadowColor: "#1A3DE8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.20, shadowRadius: 20, elevation: 8 },
  card: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 6 },
  floating: { shadowColor: "#000", shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.40, shadowRadius: 32, elevation: 16 },
};

export const layout = {
  screenPadding: spacing.lg,
  cardGap: spacing.md,
  sectionGap: spacing.xl,
  maxContentWidth: 480,
};

export const zIndex = { base: 0, card: 1, header: 10, modal: 100, toast: 200, overlay: 300 };

export const borders = { hairline: 0.5, thin: 1, medium: 1.5, thick: 2 };

export const animation = {
  duration: { instant: 100, fast: 200, normal: 300, slow: 500, xslow: 800 },
  spring: {
    default: { damping: 20, stiffness: 300, mass: 1 },
    bouncy: { damping: 12, stiffness: 200, mass: 0.8 },
    snappy: { damping: 28, stiffness: 400, mass: 0.8 },
    gentle: { damping: 22, stiffness: 150, mass: 1 },
    rubber: { damping: 8, stiffness: 250, mass: 0.6 },
    heavy: { damping: 30, stiffness: 500, mass: 1.2 },
  },
  scale: { press: 0.965, active: 1.02 },
};

export const MIN_TOUCH_SIZE = 44;
