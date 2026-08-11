export interface TypeStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: "400" | "500" | "600" | "700";
  letterSpacing?: number;
}

export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: "700" } satisfies TypeStyle,
  title: { fontSize: 24, lineHeight: 30, fontWeight: "700" } satisfies TypeStyle,
  headline: { fontSize: 18, lineHeight: 24, fontWeight: "600" } satisfies TypeStyle,
  body: { fontSize: 16, lineHeight: 22, fontWeight: "400" } satisfies TypeStyle,
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: "600" } satisfies TypeStyle,
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" } satisfies TypeStyle,
  label: { fontSize: 12, lineHeight: 16, fontWeight: "600", letterSpacing: 0.4 } satisfies TypeStyle,
} as const;

export type TypographyToken = keyof typeof typography;
