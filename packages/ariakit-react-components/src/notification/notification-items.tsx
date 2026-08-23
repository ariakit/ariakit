import type {
  NotificationStore,
  NotificationStoreItem,
} from "@ariakit/components/notification/notification-store";
import { useStoreState } from "@ariakit/react-store";
import { invariant } from "@ariakit/utils";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useNotificationContext } from "./notification-context.tsx";

type StoreData<S> = S extends NotificationStore<infer T> ? T : unknown;

/**
 * Renders selected items from a notification store without adding an element.
 */
export function NotificationItems<
  S extends NotificationStore<any> | undefined = undefined,
>({ store, filter, limit, children }: NotificationItemsProps<S>) {
  const context = useNotificationContext();
  // Context deliberately erases custom data. An explicit store restores it
  // through S, while the context-only path remains unknown.
  const resolvedStore = (store || context) as
    | NotificationStore<StoreData<S>>
    | undefined;

  invariant(
    resolvedStore,
    process.env.NODE_ENV !== "production" &&
      "NotificationItems must receive a `store` prop or be wrapped in a NotificationProvider component.",
  );

  const items = useStoreState(resolvedStore, "items");
  const selectedItems = useMemo(() => {
    const matchingItems = filter ? items.filter(filter) : items;
    if (limit === undefined) return matchingItems;
    if (limit <= 0) return [];
    return matchingItems.slice(-limit);
  }, [items, filter, limit]);

  return children(selectedItems);
}

export interface NotificationItemsProps<
  S extends NotificationStore<any> | undefined = undefined,
> {
  store?: S;
  filter?: (item: NotificationStoreItem<StoreData<S>>) => boolean;
  limit?: number;
  children: (items: NotificationStoreItem<StoreData<S>>[]) => ReactNode;
}
