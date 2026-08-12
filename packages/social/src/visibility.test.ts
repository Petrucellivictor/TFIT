import { describe, expect, it } from "vitest";
import { canViewPost, resolveFollowStatus, type ViewerRelationship } from "./visibility";

const NONE: ViewerRelationship = { isSelf: false, isFollowingAccepted: false, isFriend: false, isBlocked: false };

describe("canViewPost", () => {
  it("always lets the author see their own post, regardless of visibility", () => {
    expect(canViewPost("private", { ...NONE, isSelf: true })).toBe(true);
    expect(canViewPost("public", { ...NONE, isSelf: true })).toBe(true);
  });

  it("blocking wins over everything, even self", () => {
    expect(canViewPost("public", { ...NONE, isSelf: true, isBlocked: true })).toBe(false);
  });

  it("public posts are visible to anyone not blocked", () => {
    expect(canViewPost("public", NONE)).toBe(true);
  });

  it("followers-only posts require an accepted follow", () => {
    expect(canViewPost("followers", NONE)).toBe(false);
    expect(canViewPost("followers", { ...NONE, isFollowingAccepted: true })).toBe(true);
  });

  it("friends-only posts require mutual follow, not just one-way", () => {
    expect(canViewPost("friends", { ...NONE, isFollowingAccepted: true })).toBe(false);
    expect(canViewPost("friends", { ...NONE, isFriend: true })).toBe(true);
  });

  it("private posts are never visible to anyone but the author", () => {
    expect(canViewPost("private", { ...NONE, isFriend: true })).toBe(false);
    expect(canViewPost("private", { ...NONE, isFollowingAccepted: true })).toBe(false);
  });
});

describe("resolveFollowStatus", () => {
  it("auto-accepts for public accounts", () => {
    expect(resolveFollowStatus(false)).toBe("accepted");
  });

  it("requires approval for private accounts", () => {
    expect(resolveFollowStatus(true)).toBe("pending");
  });
});
