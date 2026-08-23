import { createNotificationStore } from "@ariakit/components/notification/notification-store";

export type InboxNotificationTone = "info" | "success" | "warning" | "danger";

export interface InboxNotificationData {
  tone?: InboxNotificationTone;
  actionLabel?: string;
  onAction?: () => void;
}

export const inboxNotifications =
  createNotificationStore<InboxNotificationData>({ timeout: 8000 });
