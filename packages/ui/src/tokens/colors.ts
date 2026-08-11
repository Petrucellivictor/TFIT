/**
 * Semantic color tokens. Components must reference these, never raw hex.
 * Dark mode is a deliberate palette, not an inversion — see docs/DESIGN_SYSTEM.md.
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
    primaryMuted: string;
    onPrimary: string;
  };
  feedback: {
    success: string;
    warning: string;
    danger: string;
  };
  overlay: string;
}

export const lightColors: ColorTokens = {
  background: {
    base: "#F7F7F5",
    raised: "#FFFFFF",
    sunken: "#EEEEEB",
  },
  text: {
    primary: "#14151A",
    secondary: "#5B5E68",
    inverse: "#FFFFFF",
    disabled: "#A6A8B0",
  },
  border: {
    subtle: "#E4E4E0",
    strong: "#CFCFC9",
  },
  accent: {
    primary: "#0E7C61",
    primaryMuted: "#DCEFE9",
    onPrimary: "#FFFFFF",
  },
  feedback: {
    success: "#1E8E5A",
    warning: "#B7791F",
    danger: "#C0362C",
  },
  overlay: "rgba(20, 21, 26, 0.5)",
};

export const darkColors: ColorTokens = {
  background: {
    base: "#0E0F12",
    raised: "#17181C",
    sunken: "#0A0B0D",
  },
  text: {
    primary: "#F3F3F1",
    secondary: "#A6A8B0",
    inverse: "#14151A",
    disabled: "#54565E",
  },
  border: {
    subtle: "#232428",
    strong: "#34363B",
  },
  accent: {
    primary: "#2FD9A6",
    primaryMuted: "#173029",
    onPrimary: "#04140F",
  },
  feedback: {
    success: "#3ECB8B",
    warning: "#E0A93F",
    danger: "#E5695F",
  },
  overlay: "rgba(0, 0, 0, 0.6)",
};
