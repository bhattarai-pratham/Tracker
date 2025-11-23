export const COLORS = {
  // Base brand colors
  primary: "#0ea5a4", // teal
  primaryDark: "#0b8c88",

  background: "#ffffff",
  card: "#f8fafc",

  text: "#0f172a",
  muted: "#64748b",

  accent: "#f97316",
  success: "#16a34a",
  danger: "#ef4444",
  warning: "#f59e0b",

  // ---------------------------------------------------------------------------
  // ⭐ NEW: Solid light variants (replace primary + "05", "10", "20", etc.)
  // These avoid the Android halo and blend smoothly behind shadows.
  // ---------------------------------------------------------------------------

  // Teal / Primary tints
  primaryLight: "#e6f7f7", // ~primary +10
  primaryLighter: "#f2fbfa", // ~primary +05
  primaryLightStrong: "#d9f2f2", // ~primary +20

  // Accent (Orange) tints
  accentLight: "#fde9d7",
  accentLighter: "#fef4eb",
  accentLightStrong: "#fcdcc3",

  // Success (Green) tints
  successLight: "#e6f5eb",
  successLighter: "#f2faf5",
  successLightStrong: "#d9f0e1",

  // Danger (Red) tints
  dangerLight: "#fde8e8",
  dangerLighter: "#fef4f4",
  dangerLightStrong: "#fbdada",

  // Warning (Amber) tints
  warningLight: "#fff3e0",
  warningLighter: "#fff8ed",
  warningLightStrong: "#ffe9c7",

  // For selected cards, highlights, subtle emphasis
  cardSelected: "#f0fcfc", // very soft teal wash
  cardSelectedStrong: "#e3f7f7", // slightly more contrast
};

export type Colors = typeof COLORS;
export default COLORS;
