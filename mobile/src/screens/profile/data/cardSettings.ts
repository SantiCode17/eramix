import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Card Themes ──────────────────────────────────────
export interface CardTheme {
  id: string;
  label: string;
  gradient: [string, string, string];
  icon: string;
}

export const CARD_THEMES: CardTheme[] = [
  { id: "obsidian",  label: "Obsidian",  gradient: ["#0F1923", "#1A2A3C", "#0F1923"], icon: "moon-outline" },
  { id: "aurora",    label: "Aurora",     gradient: ["#0A2342", "#134E5E", "#0A2342"], icon: "planet-outline" },
  { id: "sunset",    label: "Sunset",     gradient: ["#2D1B42", "#4A1942", "#2D1B42"], icon: "sunny-outline" },
  { id: "deep-sea",  label: "Deep Sea",   gradient: ["#0B1120", "#142850", "#0B1120"], icon: "water-outline" },
  { id: "gold-rush", label: "Gold Rush",  gradient: ["#1A1400", "#3D3000", "#1A1400"], icon: "diamond-outline" },
  { id: "midnight",  label: "Midnight",   gradient: ["#0D0D1A", "#1A1A3E", "#0D0D1A"], icon: "star-outline" },
  { id: "forest",    label: "Forest",     gradient: ["#0A1A0A", "#1B3A1B", "#0A1A0A"], icon: "leaf-outline" },
  { id: "coral",     label: "Coral",      gradient: ["#1A0F14", "#3D1F2E", "#1A0F14"], icon: "rose-outline" },
];

// ── Accent Colors ────────────────────────────────────
export interface AccentOption {
  name: string;
  color: string;
}

export const ACCENT_COLORS: AccentOption[] = [
  { name: "Oro",     color: "#FFD700" },
  { name: "Naranja", color: "#FF8C35" },
  { name: "Rosa",    color: "#FF4F6F" },
  { name: "Menta",   color: "#00D4AA" },
  { name: "Violeta", color: "#6C5CE7" },
  { name: "Azul",    color: "#00B4D8" },
  { name: "Crema",   color: "#F2C464" },
  { name: "Blanco",  color: "#FFFFFF" },
  { name: "Coral",   color: "#FF6B6B" },
  { name: "Lima",    color: "#A8E6CF" },
];

// ── Frame Styles ─────────────────────────────────────
export interface FrameOption {
  id: string;
  label: string;
  border: string;
  glow: string;
}

export const FRAME_OPTIONS: FrameOption[] = [
  { id: "gold",    label: "EU Gold",  border: "rgba(255,215,0,0.5)",   glow: "rgba(255,215,0,0.22)" },
  { id: "teal",    label: "Aurora",   border: "rgba(79,209,197,0.52)", glow: "rgba(79,209,197,0.22)" },
  { id: "orange",  label: "Sunset",   border: "rgba(255,140,53,0.52)", glow: "rgba(255,140,53,0.22)" },
  { id: "ice",     label: "Ice",      border: "rgba(145,179,255,0.55)",glow: "rgba(145,179,255,0.2)" },
  { id: "neon",    label: "Neon",     border: "rgba(108,92,231,0.6)",  glow: "rgba(108,92,231,0.25)" },
  { id: "none",    label: "Sin marco",border: "rgba(255,255,255,0.12)",glow: "transparent" },
];

// ── Badges ───────────────────────────────────────────
export const BADGE_OPTIONS = [
  "Global Buddy",
  "Campus Insider",
  "Food Explorer",
  "Weekend Wanderer",
  "Language Mixer",
  "Night Owl",
  "Cultural Geek",
  "Solo Traveler",
] as const;

// ── Font Styles ──────────────────────────────────────
export const FONT_STYLES = ["default", "elegant", "bold", "mono"] as const;

// ── Full Card Settings ───────────────────────────────
export interface ProfileCardSettings {
  themeId: string;
  accentColor: string;
  frameId: string;
  headline: string;
  badge: string;
  showStats: boolean;
  showDestination: boolean;
  backgroundImageUri?: string;
  fontStyle: "default" | "elegant" | "bold" | "mono";
}

const STORAGE_KEY = "profile_card_settings_v2";

export const DEFAULT_CARD_SETTINGS: ProfileCardSettings = {
  themeId: "obsidian",
  accentColor: "#FFD700",
  frameId: "gold",
  headline: "",
  badge: "Global Buddy",
  showStats: true,
  showDestination: true,
  fontStyle: "default",
};

export async function getProfileCardSettings(): Promise<ProfileCardSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_CARD_SETTINGS;
  try {
    return { ...DEFAULT_CARD_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CARD_SETTINGS;
  }
}

export async function saveProfileCardSettings(settings: ProfileCardSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
