export const XP_AWARDS = {
  workout_completed: 50,
  checkin: 10,
  personal_record: 30,
  goal_achieved: 40,
  challenge_completed: 60,
} as const;

export type XpReason = keyof typeof XP_AWARDS;

/**
 * Backstop against any unforeseen exploit, on top of the structural
 * per-event dedupe (docs/DATABASE.md's xp_transactions unique constraint).
 * Generous enough that no legitimate day of usage hits it — the busiest
 * realistic day (workout + checkin + a PR) is 90 XP.
 */
export const MAX_XP_PER_DAY = 400;
