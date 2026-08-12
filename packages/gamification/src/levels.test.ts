import { describe, expect, it } from "vitest";
import { getLevelProgress } from "./levels";

describe("getLevelProgress", () => {
  it("starts everyone at level 1 with 0 XP", () => {
    const progress = getLevelProgress(0);
    expect(progress.level).toBe(1);
    expect(progress.name).toBe("Começando");
    expect(progress.xpToNextLevel).toBe(100);
  });

  it("advances to the next level exactly at its threshold", () => {
    expect(getLevelProgress(99).level).toBe(1);
    expect(getLevelProgress(100).level).toBe(2);
  });

  it("reports max level with no next-level target", () => {
    const progress = getLevelProgress(999999);
    expect(progress.isMaxLevel).toBe(true);
    expect(progress.xpToNextLevel).toBeNull();
    expect(progress.name).toBe("Lenda");
  });

  it("never goes below level 1 for negative XP", () => {
    expect(getLevelProgress(-50).level).toBe(1);
  });
});
