export const motion = {
  duration: {
    /** Microinteractions — tap, toggle, chip select, like (50-150ms). */
    fast: 120,
    /** Navigation, modal open, state change (200-400ms). */
    standard: 220,
    /** Emphasized transitions — larger layout shifts (200-400ms range, upper end). */
    emphasis: 360,
    /** Celebrations — achievement, PR, level up, workout complete (500-1200ms). */
    celebration: 800,
  },
  easing: {
    standard: [0.2, 0, 0, 1] as const,
    decelerate: [0, 0, 0, 1] as const,
    accelerate: [0.3, 0, 1, 1] as const,
  },
} as const;
