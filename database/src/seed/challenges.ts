import type { NewChallenge } from "../schema/challenges";

type SeedChallenge = Omit<NewChallenge, "id" | "createdAt" | "createdBy">;

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfIsoWeek(now: Date): Date {
  const d = new Date(now);
  const day = d.getUTCDay() || 7; // Sunday (0) -> 7
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return d;
}

function startOfMonth(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function endOfMonth(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/**
 * System-created public challenges anyone can join solo (Phase 4 — friend
 * challenges need the Phase 5 social graph, see docs/DATABASE.md). Dates
 * are computed relative to `now` rather than hardcoded so re-seeding stays
 * meaningful whenever it's run.
 */
export function buildChallengeSeed(now: Date): SeedChallenge[] {
  const weekStart = startOfIsoWeek(now);
  const weekEnd = addDays(weekStart, 6);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  return [
    {
      title: "Consistência da semana",
      description: "Complete 4 treinos esta semana.",
      type: "workouts_count",
      targetValue: 4,
      period: "weekly",
      startDate: toDateStr(weekStart),
      endDate: toDateStr(weekEnd),
      isPublic: true,
    },
    {
      title: "Sequência de 7 dias",
      description: "Mantenha uma sequência de check-ins por 7 dias seguidos.",
      type: "streak_days",
      targetValue: 7,
      period: "fixed",
      startDate: toDateStr(weekStart),
      endDate: toDateStr(addDays(weekStart, 13)),
      isPublic: true,
    },
    {
      title: "Treino do mês",
      description: "Complete 12 treinos este mês.",
      type: "workouts_count",
      targetValue: 12,
      period: "monthly",
      startDate: toDateStr(monthStart),
      endDate: toDateStr(monthEnd),
      isPublic: true,
    },
  ];
}
