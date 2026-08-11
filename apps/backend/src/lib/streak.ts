/**
 * Consecutive-day check-in streak, counting back from today (a missed
 * yesterday-but-not-today still counts as broken). This is a preview of the
 * concept for the Phase 3 evolution dashboard — full streak mechanics
 * (freezes, recovery rules, badges) land in Phase 4 gamification.
 */
export function computeCheckinStreak(checkinDates: string[]): number {
  const dates = new Set(checkinDates);
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!dates.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
