import { Platform } from "react-native";
import {
  EramixColors as EC,
  EramixSpacing as ES,
  EramixRadius as ER,
  EramixSizes as ESz,
  EramixAnimation as EA,
  EramixShadows as ESh,
  EramixGradients as EG,
} from "@/constants/theme";

export { EramixColors, EramixTypography, EramixSpacing, EramixRadius, EramixShadows, EramixGradients, EramixSizes, EramixAnimation, EramixZIndex, EramixErrorMessages, C, T, S, R, Sh, G, Sz } from "@/constants/theme";

/**
 * ─── Design System Colors (Single Source of Truth) ───
 * All colors now come from EramixColors in theme.ts.
 * COLOR_PRIMARY:       #FFD700
 * COLOR_SECONDARY:     #132240
 * COLOR_BACKGROUND:    #0A1628
 * COLOR_SURFACE:       #132240
 * COLOR_TEXT_PRIMARY:   #FFFFFF
 * COLOR_TEXT_SECONDARY: #8FA3BC
 * COLOR_ERROR:         #E53E3E
 * COLOR_SUCCESS:       #38A169
 */
export const DS = {
  primary: EC.PRIMARY_GOLD,
  secondary: EC.NAVY_CARD,
  background: EC.NAVY_DEEP,
  surface: EC.NAVY_CARD,
  surfaceLight: EC.NAVY_SURFACE,
  border: EC.NAVY_BORDER,
  textPrimary: EC.TEXT_PRIMARY,
  textSecondary: EC.TEXT_SECONDARY,
  textMuted: EC.TEXT_MUTED,
  error: EC.ERROR_RED,
  success: EC.SUCCESS_GREEN,
  orange: EC.PRIMARY_ORANGE,
  info: EC.INFO_BLUE,
} as const;

export const colors = {
  eu: {
    deep: EC.NAVY_DEEP,
    mid: EC.NAVY_CARD,
    light: EC.NAVY_SURFACE,
    star: EC.PRIMARY_GOLD,
    starLight: EC.GOLD_ALPHA_25,
    orange: EC.PRIMARY_ORANGE,
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
    primary: EC.TEXT_PRIMARY,
    secondary: EC.TEXT_SECONDARY,
    tertiary: EC.TEXT_MUTED,
    disabled: EC.TEXT_MUTED,
    inverse: EC.NAVY_DEEP,
    accent: EC.PRIMARY_GOLD,
    link: EC.INFO_BLUE,
  },
  background: {
    start: EC.NAVY_DEEP,
    mid: "#0E1A35",
    end: "#0E1A35",
    card: EC.NAVY_CARD,
    elevated: EC.NAVY_CARD,
    input: EC.NAVY_SURFACE,
    overlay: EC.OVERLAY_HEAVY,
  },
  gradient: {
    primary: EG.PRIMARY,
    accent: EG.PRIMARY,
    warm: [EC.PRIMARY_ORANGE, EC.PRIMARY_GOLD] as const,
    cool: [EC.NAVY_CARD, EC.NAVY_SURFACE] as const,
    dark: EG.DARK,
    surface: [EC.NAVY_CARD, EC.NAVY_SURFACE] as const,
    hero: EG.HERO,
    emerald: [EC.SUCCESS_GREEN, EC.SUCCESS_GREEN] as const,
    sunset: [EC.PRIMARY_ORANGE, EC.PRIMARY_GOLD] as const,
    night: EG.DARK,
  },
  status: {
    online: EC.SUCCESS_GREEN,
    offline: EC.TEXT_MUTED,
    away: EC.PRIMARY_GOLD,
    busy: EC.ERROR_RED,
    error: EC.ERROR_RED,
    errorBg: EC.ERROR_ALPHA_10,
    success: EC.SUCCESS_GREEN,
    successBg: EC.SUCCESS_ALPHA_10,
    warning: EC.PRIMARY_GOLD,
    warningBg: EC.GOLD_ALPHA_10,
    info: EC.INFO_BLUE,
    infoBg: EC.INFO_ALPHA_20,
  },
  overlay: {
    light: EC.OVERLAY_LIGHT,
    medium: EC.OVERLAY_MEDIUM,
    heavy: EC.OVERLAY_HEAVY,
    black: EC.OVERLAY_BLACK,
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
  sm: ER.RADIUS_SM,
  md: ER.RADIUS_MD,
  lg: ER.RADIUS_LG,
  xl: ER.RADIUS_XL,
  xxl: 28,
  full: ER.RADIUS_FULL,
};

export const opacity = {
  glass: { surface: 0.08, elevated: 0.14, prominent: 0.22, intense: 0.35 },
  border: { subtle: 0.10, mid: 0.18, strong: 0.30 },
};

export const blur = { surface: 20, elevated: 40, prominent: 60, overlay: 80 };

export const sizes = {
  avatarSm: ESz.AVATAR_SM, avatarMd: ESz.AVATAR_MD, avatarLg: ESz.AVATAR_LG, avatarXl: ESz.AVATAR_XL,
  buttonSm: 38, buttonMd: 48, buttonLg: ESz.BUTTON_HEIGHT,
  inputHeight: ESz.INPUT_HEIGHT, headerHeight: ESz.HEADER_HEIGHT, tabBarHeight: ESz.TAB_BAR_HEIGHT,
  iconSm: ESz.ICON_SM, iconMd: ESz.ICON_MD, iconLg: ESz.ICON_LG,
};

const shadowBase = Platform.OS === "ios" ? {} : { elevation: 0 };

export const shadows = {
  none: { ...shadowBase },
  sm: ESh.SHADOW_SM,
  md: ESh.SHADOW_MD,
  lg: ESh.SHADOW_LG,
  xl: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.30, shadowRadius: 24, elevation: 12 },
  glass: ESh.SHADOW_MD,
  glassSmall: ESh.SHADOW_SM,
  glow: ESh.SHADOW_GOLD,
  glowBlue: ESh.SHADOW_MD,
  glowCoral: ESh.SHADOW_MD,
  glowEmerald: ESh.SHADOW_MD,
  elevated: ESh.SHADOW_LG,
  card: ESh.SHADOW_MD,
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
  duration: { instant: 100, fast: 200, normal: 300, slow: 500, xslow: 800, stagger: 80 },
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

/** @deprecated — Use EramixColors directly. Compat shim for legacy screens. */
export const palette = {
  electricBlue: EC.INFO_BLUE,
  emerald: EC.SUCCESS_GREEN,
  coral: EC.PRIMARY_ORANGE,
  gold: EC.PRIMARY_GOLD,
  deepNavy: EC.NAVY_DEEP,
  midnight: EC.NAVY_CARD,
} as const;

/** Height of the bottom tab bar (before safe-area inset). Use this to add
 *  paddingBottom to scrollable content inside tab screens so nothing is
 *  hidden behind the absolute-positioned tab bar. */
export const TAB_BAR_HEIGHT = 62;
