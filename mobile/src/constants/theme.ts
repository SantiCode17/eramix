/**
 * ════════════════════════════════════════════════════════════════
 *  ERAMIX — Design System Theme (Single Source of Truth)
 *  Inspirado en la bandera europea y la identidad Erasmus+
 *
 *  NINGÚN color, spacing o tipografía puede definirse inline.
 *  Todo debe venir de este archivo.
 * ════════════════════════════════════════════════════════════════
 */

// ═══ PALETA DE COLORES ═══════════════════════════════════════

export const EramixColors = {
  // ── Primarios ──
  PRIMARY_GOLD: "#FFD700",
  PRIMARY_ORANGE: "#FF6B2B",

  // ── Fondos navy ──
  NAVY_DEEP: "#0A1628",
  NAVY_CARD: "#132240",
  NAVY_SURFACE: "#1A2D4A",
  NAVY_BORDER: "#243858",

  // ── Texto ──
  TEXT_PRIMARY: "#FFFFFF",
  TEXT_SECONDARY: "#8FA3BC",
  TEXT_MUTED: "#4A6580",

  // ── Estado ──
  ERROR_RED: "#E53E3E",
  SUCCESS_GREEN: "#38A169",

  // ── Info (uso limitado a toasts info) ──
  INFO_BLUE: "#5B9BD5",

  // ── Transparencias útiles ──
  GOLD_ALPHA_05: "rgba(255,215,0,0.05)",
  GOLD_ALPHA_10: "rgba(255,215,0,0.10)",
  GOLD_ALPHA_15: "rgba(255,215,0,0.15)",
  GOLD_ALPHA_20: "rgba(255,215,0,0.20)",
  GOLD_ALPHA_25: "rgba(255,215,0,0.25)",
  GOLD_ALPHA_30: "rgba(255,215,0,0.30)",

  ERROR_ALPHA_10: "rgba(229,62,62,0.10)",
  ERROR_ALPHA_30: "rgba(229,62,62,0.30)",

  SUCCESS_ALPHA_10: "rgba(56,161,105,0.10)",
  SUCCESS_ALPHA_20: "rgba(56,161,105,0.20)",

  INFO_ALPHA_20: "rgba(91,155,213,0.20)",

  OVERLAY_LIGHT: "rgba(10,22,40,0.40)",
  OVERLAY_MEDIUM: "rgba(10,22,40,0.60)",
  OVERLAY_HEAVY: "rgba(10,22,40,0.80)",
  OVERLAY_BLACK: "rgba(0,0,0,0.90)",
} as const;

// ═══ TIPOGRAFÍA ═════════════════════════════════════════════

export const EramixTypography = {
  FONT_TITLE_XL: { fontSize: 32, fontWeight: "700" as const, lineHeight: 40 },
  FONT_TITLE_LG: { fontSize: 24, fontWeight: "700" as const, lineHeight: 32 },
  FONT_TITLE_MD: { fontSize: 20, fontWeight: "600" as const, lineHeight: 28 },
  FONT_BODY_LG: { fontSize: 16, fontWeight: "500" as const, lineHeight: 24 },
  FONT_BODY_MD: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  FONT_BODY_SM: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },
  FONT_CAPTION: { fontSize: 11, fontWeight: "400" as const, lineHeight: 14 },
} as const;

// ═══ ESPACIADO (sistema de 8pt) ═════════════════════════════

export const EramixSpacing = {
  SPACE_XS: 4,
  SPACE_SM: 8,
  SPACE_MD: 16,
  SPACE_LG: 24,
  SPACE_XL: 32,
  SPACE_XXL: 48,
} as const;

// ═══ BORDER RADIUS ══════════════════════════════════════════

export const EramixRadius = {
  RADIUS_SM: 8,
  RADIUS_MD: 12,
  RADIUS_LG: 16,
  RADIUS_XL: 24,
  RADIUS_FULL: 9999,
} as const;

// ═══ SOMBRAS ════════════════════════════════════════════════

export const EramixShadows = {
  SHADOW_SM: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  SHADOW_MD: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 4,
  },
  SHADOW_LG: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 8,
  },
  SHADOW_GOLD: {
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

// ═══ GRADIENTES ═════════════════════════════════════════════

export const EramixGradients = {
  PRIMARY: ["#FFD700", "#FF6B2B"] as const,
  DARK: ["#0A1628", "#0E1A35"] as const,
  CARD: ["#1A2D4A", "#243858"] as const,
  HERO: ["#132240", "#0F1E36"] as const,
} as const;

// ═══ TAMAÑOS COMUNES ════════════════════════════════════════

export const EramixSizes = {
  INPUT_HEIGHT: 56,
  BUTTON_HEIGHT: 56,
  CHIP_HEIGHT: 36,
  HEADER_HEIGHT: 56,
  TAB_BAR_HEIGHT: 62,
  AVATAR_SM: 36,
  AVATAR_MD: 48,
  AVATAR_LG: 72,
  AVATAR_XL: 96,
  ICON_SM: 18,
  ICON_MD: 24,
  ICON_LG: 32,
  DRAWER_BUTTON: 40,
} as const;

// ═══ ANIMACIÓN ══════════════════════════════════════════════

export const EramixAnimation = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  SPRING_DEFAULT: { damping: 20, stiffness: 300, mass: 1 },
  SPRING_BOUNCY: { damping: 12, stiffness: 200, mass: 0.8 },
  SPRING_SNAPPY: { damping: 28, stiffness: 400, mass: 0.8 },
} as const;

// ═══ Z-INDEX ════════════════════════════════════════════════

export const EramixZIndex = {
  BASE: 0,
  CARD: 1,
  HEADER: 10,
  MODAL: 100,
  TOAST: 200,
  OVERLAY: 300,
} as const;

// ═══ MENSAJES DE ERROR (human-friendly) ═════════════════════

export const EramixErrorMessages = {
  UNAUTHORIZED: {
    title: "Acceso denegado",
    subtitle: "El email o la contraseña no son correctos",
  },
  EMAIL_IN_USE: {
    title: "Email en uso",
    subtitle: "Ya existe una cuenta con ese email. ¿Quieres iniciar sesión?",
  },
  NETWORK_ERROR: {
    title: "Sin conexión",
    subtitle: "Comprueba tu conexión a Internet e inténtalo de nuevo",
  },
  SERVER_UNAVAILABLE: {
    title: "Servicio no disponible",
    subtitle: "Estamos teniendo problemas técnicos. Inténtalo en unos minutos",
  },
  TIMEOUT: {
    title: "Respuesta lenta",
    subtitle: "El servidor tardó demasiado. Inténtalo de nuevo",
  },
  SERVER_ERROR: {
    title: "Error del servidor",
    subtitle: "Algo salió mal en nuestro lado. Ya estamos trabajando en ello",
  },
  NOT_FOUND: {
    title: "Función no disponible",
    subtitle: "Esta funcionalidad está siendo preparada. Pronto estará lista",
  },
  FIELDS_INCOMPLETE: {
    title: "Campos incompletos",
    subtitle: "Por favor rellena todos los campos obligatorios",
  },
  PASSWORDS_MISMATCH: {
    title: "Las contraseñas no coinciden",
    subtitle: "Asegúrate de escribir la misma contraseña en ambos campos",
  },
  TRANSACTION_FAILED: {
    title: "No se pudo guardar",
    subtitle: "La transacción no pudo guardarse. Inténtalo de nuevo",
  },
  IMAGE_UPLOAD_FAILED: {
    title: "Error al subir imagen",
    subtitle: "La imagen no pudo enviarse. Comprueba que no supera 10MB",
  },
} as const;

// ═══ EXPORT ALIAS CORTOS ════════════════════════════════════

export const C = EramixColors;
export const T = EramixTypography;
export const S = EramixSpacing;
export const R = EramixRadius;
export const Sh = EramixShadows;
export const G = EramixGradients;
export const Sz = EramixSizes;

// ═══ COMPAT — Legacy exports para migración progresiva ═══

export const Colors = {
  eu: {
    deep: EramixColors.NAVY_DEEP,
    mid: EramixColors.NAVY_CARD,
    light: EramixColors.NAVY_SURFACE,
    star: EramixColors.PRIMARY_GOLD,
    starLight: EramixColors.GOLD_ALPHA_25,
    orange: EramixColors.PRIMARY_ORANGE,
  },
  glass: {
    white: "rgba(255, 255, 255, 0.08)",
    border: "rgba(255, 255, 255, 0.10)",
    borderMid: "rgba(255, 255, 255, 0.18)",
    borderStrong: "rgba(255, 255, 255, 0.30)",
  },
  text: {
    primary: EramixColors.TEXT_PRIMARY,
    secondary: EramixColors.TEXT_SECONDARY,
    disabled: EramixColors.TEXT_MUTED,
  },
  background: {
    start: EramixColors.NAVY_DEEP,
    end: "#0E1A35",
  },
  accent: {
    start: EramixColors.PRIMARY_GOLD,
    end: EramixColors.PRIMARY_ORANGE,
  },
  status: {
    success: EramixColors.SUCCESS_GREEN,
    error: EramixColors.ERROR_RED,
    warning: EramixColors.PRIMARY_GOLD,
  },
} as const;

export const Spacing = EramixSpacing;
export const BorderRadius = EramixRadius;

export const GlassConfig = {
  blur: 20,
  opacity: 0.12,
  borderOpacity: 0.15,
} as const;

export const Animation = {
  fast: EramixAnimation.FAST,
  normal: EramixAnimation.NORMAL,
  slow: EramixAnimation.SLOW,
  spring: EramixAnimation.SPRING_DEFAULT,
} as const;

export const Typography = {
  h1: EramixTypography.FONT_TITLE_XL,
  h2: EramixTypography.FONT_TITLE_LG,
  h3: EramixTypography.FONT_TITLE_MD,
  body: EramixTypography.FONT_BODY_LG,
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: "500" as const },
  bodyBold: { fontSize: 16, lineHeight: 24, fontWeight: "700" as const },
  caption: EramixTypography.FONT_BODY_MD,
  small: EramixTypography.FONT_BODY_SM,
  button: { fontSize: 16, lineHeight: 24, fontWeight: "600" as const },
} as const;

export const HitSlop = { top: 10, bottom: 10, left: 10, right: 10 } as const;
export const MinTouchSize = 44;
