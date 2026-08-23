import type { NotificationStoreItem } from "@ariakit/components/notification/notification-store";
import type { RefObject } from "react";
import { createContext } from "react";

export const NotificationItemContext =
  createContext<NotificationStoreItem | null>(null);

export const NotificationHeadingContext = createContext<
  ((id?: string) => void) | null
>(null);

export const NotificationMessageContext = createContext<
  ((id?: string) => void) | null
>(null);

export interface NotificationRegionContextValue {
  elementRef: RefObject<HTMLElement | null>;
  restoreFocus: () => void;
}

export const NotificationRegionContext =
  createContext<NotificationRegionContextValue | null>(null);

export interface NotificationListContextValue {
  register: (element: HTMLElement) => () => void;
}

export const NotificationListContext =
  createContext<NotificationListContextValue | null>(null);
