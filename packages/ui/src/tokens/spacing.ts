const BASE = 4;

export const space = {
  xxs: BASE * 1, // 4
  xs: BASE * 2, // 8
  sm: BASE * 3, // 12
  md: BASE * 4, // 16
  lg: BASE * 6, // 24
  xl: BASE * 8, // 32
  xxl: BASE * 12, // 48
} as const;

export type SpaceToken = keyof typeof space;

export const radius = {
  sharp: 4,
  soft: 12,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;
