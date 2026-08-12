import type { UUID, ISODateTime } from "./common";

export type PostType = "photo" | "workout" | "achievement" | "personal_record" | "streak" | "text";
export type PostVisibility = "public" | "followers" | "friends" | "private";
export type FollowStatus = "pending" | "accepted" | "none" | "self";

export interface PublicProfile {
  userId: UUID;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  isPrivate: boolean;
  followerCount: number;
  followingCount: number;
  followStatus: FollowStatus;
  /** Whether the viewer and this profile follow each other (accepted both ways). */
  isFriend: boolean;
}

export interface PostAuthor {
  userId: UUID;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface PostSummary {
  id: UUID;
  author: PostAuthor;
  type: PostType;
  caption: string | null;
  visibility: PostVisibility;
  metadata: Record<string, unknown> | null;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
  createdAt: ISODateTime;
}

export interface PostComment {
  id: UUID;
  author: PostAuthor;
  body: string;
  createdAt: ISODateTime;
}

export interface CreatePostInput {
  type: PostType;
  caption?: string;
  visibility: PostVisibility;
  mediaUrls?: string[];
  metadata?: Record<string, unknown>;
}

export type NotificationType = "new_follower" | "follow_request" | "comment" | "like" | "achievement_unlocked";

export interface NotificationView {
  id: UUID;
  type: NotificationType;
  actor: PostAuthor | null;
  referenceId: UUID | null;
  message: string | null;
  isRead: boolean;
  createdAt: ISODateTime;
}
