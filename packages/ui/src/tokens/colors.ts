/**
 * Semantic color tokens. Components must reference these, never raw hex.
 * "Performance Tech" identity (revised for a more elaborate, health/gym-tech
 * feel — data-forward, wearable-inspired, not a generic pastel app):
 * deep, near-black surfaces with a vivid electric mint/blue accent pairing
 * used for gradients, glows, and data visualization (score rings, bars).
 * Dark mode is the flagship, not an inversion of light — see docs/DESIGN_SYSTEM.md.
 */
export interface ColorTokens {
  background: {
    base: string;
    raised: string;
    sunken: string;
  };
  text: {
    primary: string;
    secondary: string;
    inverse: string;
    disabled: string;
  };
  border: {
    subtle: string;
    strong: string;
  };
  accent: {
    primary: string;
    secondary: string;
    primaryMuted: string;
    onPrimary: string;
  };
  feedback: {
    success: string;
    warning: string;
    danger: string;
  };
  overlay: string;
  /** Gradient stop pairs for CTAs, hero surfaces, and data-viz fills (LinearGradient / SVG). */
  gradient: {
    primary: readonly [string, string];
    hero: readonly [string, string];
  };
}

export const lightColors: ColorTokens = {
  background: {
    base: "#F2F5F8",
    raised: "#FFFFFF",
    sunken: "#E6ECF1",
  },
  text: {
    primary: "#0B1420",
    secondary: "#57626F",
    inverse: "#FFFFFF",
    disabled: "#9AA5B1",
  },
  border: {
    subtle: "#DDE4EA",
    strong: "#C3CDD6",
  },
  accent: {
    primary: "#00B884",
    secondary: "#0091FF",
    primaryMuted: "#D9F5EC",
    onPrimary: "#FFFFFF",
  },
  feedback: {
    success: "#1FAE6E",
    warning: "#B7791F",
    danger: "#E0303F",
  },
  overlay: "rgba(6, 12, 18, 0.5)",
  gradient: {
    primary: ["#00B884", "#0091FF"],
    hero: ["#0B1420", "#173049"],
  },
};

export const darkColors: ColorTokens = {
  background: {
    base: "#060A10",
    raised: "#101823",
    sunken: "#03060A",
  },
  text: {
    primary: "#F3F7FA",
    secondary: "#8A97A8",
    inverse: "#04140F",
    disabled: "#4C5866",
  },
  border: {
    subtle: "#1C2733",
    strong: "#2E3B49",
  },
  accent: {
    primary: "#1EF2A6",
    secondary: "#3DB2FF",
    primaryMuted: "#0C3327",
    onPrimary: "#04140F",
  },
  feedback: {
    success: "#2FE38A",
    warning: "#FFC24B",
    danger: "#FF5C72",
  },
  overlay: "rgba(2, 5, 9, 0.78)",
  gradient: {
    primary: ["#1EF2A6", "#3DB2FF"],
    hero: ["#0B1420", "#0E2A3E"],
  },
};
