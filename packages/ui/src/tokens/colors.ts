/**
 * Semantic color tokens. Components must reference these, never raw hex.
 * "TFIT Gold" identity, matching the official logo: black surfaces with a
 * rich gold/white accent pairing (replaces the earlier electric mint/blue
 * "Performance Tech" palette) — used for gradients, glows, and data
 * visualization (score rings, bars). Dark mode is the flagship, not an
 * inversion of light — see docs/DESIGN_SYSTEM.md.
 */
export interface ColorTokens {
  background: {
    base: string;
    raised: string;
    sunken: string;
    /** Momentary tone for a pressed surface (a row, a card) — distinct from `sunken`'s permanent recessed look. */
    pressed: string;
  };
  text: {
    primary: string;
    secondary: string;
    /** Deemphasized but still legible — between `secondary` and `disabled` (timestamps, helper captions). */
    muted: string;
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
    /** Always dark navy tones in BOTH themes (a deliberate fixed-dark hero panel, not theme-relative) — pair with `heroText`/`heroTextMuted`, never `text.inverse`, which flips meaning per theme and would go near-invisible in dark mode. */
    hero: readonly [string, string];
    heroText: string;
    heroTextMuted: string;
  };
}

export const lightColors: ColorTokens = {
  background: {
    base: "#F2F5F8",
    raised: "#FFFFFF",
    sunken: "#E6ECF1",
    pressed: "#DCE4EA",
  },
  text: {
    primary: "#0B1420",
    secondary: "#57626F",
    muted: "#7C8894",
    inverse: "#FFFFFF",
    disabled: "#9AA5B1",
  },
  border: {
    subtle: "#DDE4EA",
    strong: "#C3CDD6",
  },
  accent: {
    primary: "#A67C00",
    secondary: "#2B2B2B",
    primaryMuted: "#F5E9C6",
    onPrimary: "#FFFFFF",
  },
  feedback: {
    success: "#1FAE6E",
    warning: "#C2540E",
    danger: "#E0303F",
  },
  overlay: "rgba(6, 12, 18, 0.5)",
  gradient: {
    primary: ["#D4AF37", "#8B6914"],
    hero: ["#000000", "#1A1509"],
    heroText: "#FFFFFF",
    heroTextMuted: "#C4C4C4",
  },
};

export const darkColors: ColorTokens = {
  background: {
    base: "#0A0A0A",
    raised: "#161616",
    sunken: "#000000",
    pressed: "#1F1F1F",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#B3B3B3",
    muted: "#8C8C8C",
    inverse: "#0A0A0A",
    disabled: "#595959",
  },
  border: {
    subtle: "#2B2B2B",
    strong: "#404040",
  },
  accent: {
    primary: "#D4AF37",
    secondary: "#FFFFFF",
    primaryMuted: "#2E2712",
    onPrimary: "#0A0A0A",
  },
  feedback: {
    success: "#2FE38A",
    warning: "#FF8A3D",
    danger: "#FF5C72",
  },
  overlay: "rgba(0, 0, 0, 0.8)",
  gradient: {
    primary: ["#F2D272", "#B8860B"],
    hero: ["#000000", "#1A1509"],
    heroText: "#FFFFFF",
    heroTextMuted: "#C4C4C4",
  },
};
