// ── Notification Types ───────────────────────────────

export type NotificationType =
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPTED"
  | "NEW_MESSAGE"
  | "EVENT_INVITE"
  | "EVENT_REMINDER"
  | "SYSTEM";

export interface NotificationData {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  data: string | null; // JSON stringified reference id
  isRead: boolean;
  createdAt: string;
}
