/**
 * Neutral depth shadows — physical elevation hierarchy, distinct from the
 * accent-tinted `glow` a component can layer on top for a highlight moment
 * (see Surface's `glow` prop). Applied sparingly per docs/DESIGN_SYSTEM.md —
 * not every card gets a shadow, only the few places depth is meaningful.
 */
export interface ElevationStyle {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
}

export const elevation: Record<"sm" | "md" | "lg", ElevationStyle> = {
  sm: {
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  lg: {
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
};

export type ElevationToken = keyof typeof elevation;
