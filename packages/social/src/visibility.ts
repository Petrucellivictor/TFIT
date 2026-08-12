export type PostVisibility = "public" | "followers" | "friends" | "private";

export interface ViewerRelationship {
  isSelf: boolean;
  /** Viewer follows the author, and the author has accepted (irrelevant for public authors, who auto-accept). */
  isFollowingAccepted: boolean;
  /** Mutual accepted follow in both directions. */
  isFriend: boolean;
  /** True if either party has blocked the other. */
  isBlocked: boolean;
}

/**
 * The single decision point for "can this viewer see this post" — pure and
 * unit-tested so every read path (feed, profile, single-post fetch) uses
 * the exact same rule instead of re-deriving it. Blocking always wins,
 * even over ownership (docs/SECURITY.md).
 */
export function canViewPost(visibility: PostVisibility, relationship: ViewerRelationship): boolean {
  if (relationship.isBlocked) return false;
  if (relationship.isSelf) return true;

  switch (visibility) {
    case "public":
      return true;
    case "followers":
      return relationship.isFollowingAccepted;
    case "friends":
      return relationship.isFriend;
    case "private":
      return false;
  }
}

/** A private account requires approval before a follow is established; a public one auto-accepts. */
export function resolveFollowStatus(targetIsPrivate: boolean): "pending" | "accepted" {
  return targetIsPrivate ? "pending" : "accepted";
}
