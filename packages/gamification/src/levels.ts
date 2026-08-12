/**
 * Level ladder — static app content (master spec §20), not a DB table (see
 * docs/DATABASE.md). `xpRequired` is the cumulative XP needed to REACH that
 * level (level 1 always starts at 0).
 */
export interface LevelDefinition {
  level: number;
  name: string;
  xpRequired: number;
}

export const LEVELS: LevelDefinition[] = [
  { level: 1, name: "Começando", xpRequired: 0 },
  { level: 2, name: "Consistente", xpRequired: 100 },
  { level: 3, name: "Disciplinado", xpRequired: 300 },
  { level: 4, name: "Dedicado", xpRequired: 600 },
  { level: 5, name: "Determinado", xpRequired: 1000 },
  { level: 6, name: "Forte", xpRequired: 1500 },
  { level: 7, name: "Imparável", xpRequired: 2200 },
  { level: 8, name: "Elite", xpRequired: 3000 },
  { level: 9, name: "Mestre", xpRequired: 4000 },
  { level: 10, name: "Lenda", xpRequired: 5500 },
];

export interface LevelProgress {
  level: number;
  name: string;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number | null;
  xpToNextLevel: number | null;
  isMaxLevel: boolean;
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const xp = Math.max(0, totalXp);
  let current = LEVELS[0]!;
  for (const def of LEVELS) {
    if (xp >= def.xpRequired) current = def;
    else break;
  }

  const next = LEVELS.find((def) => def.level === current.level + 1) ?? null;

  return {
    level: current.level,
    name: current.name,
    totalXp: xp,
    xpIntoLevel: xp - current.xpRequired,
    xpForNextLevel: next ? next.xpRequired - current.xpRequired : null,
    xpToNextLevel: next ? next.xpRequired - xp : null,
    isMaxLevel: next === null,
  };
}
