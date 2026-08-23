import * as Core from "@ariakit/components/notification/notification-store";
import { useStore, useStoreProps } from "@ariakit/react-store";
import type { Store } from "@ariakit/react-store";

function createCoreNotificationStore<T>(props: NotificationStoreProps<T>) {
  return Core.createNotificationStore<T>({ ...props, setItems: undefined });
}

export function useNotificationStoreProps<
  T,
  S extends Core.NotificationStore<T>,
>(store: S, props: NotificationStoreProps<T>) {
  useStoreProps(store, props, "items", "setItems");
  useStoreProps(store, props, "timeout");
  useStoreProps(store, props, "priority");
  return store;
}

/**
 * Creates a notification store for Notification components.
 */
export function useNotificationStore<T = unknown>(
  props: NotificationStoreProps<T> = {},
): NotificationStore<T> {
  const [store] = useStore(createCoreNotificationStore<T>, props);
  return useNotificationStoreProps(store, props);
}

export type NotificationStoreItem<T = unknown> = Core.NotificationStoreItem<T>;

export type NotificationPushProps<T = unknown> = Core.NotificationPushProps<T>;

export interface NotificationAnnounceProps
  extends Core.NotificationAnnounceProps {}

export interface NotificationStoreState<
  T = unknown,
> extends Core.NotificationStoreState<T> {}

export interface NotificationStoreFunctions<
  T = unknown,
> extends Core.NotificationStoreFunctions<T> {}

export interface NotificationStoreOptions<
  T = unknown,
> extends Core.NotificationStoreOptions<T> {}

export interface NotificationStoreProps<
  T = unknown,
> extends Core.NotificationStoreProps<T> {}

export type NotificationStore<T = unknown> = Store<Core.NotificationStore<T>>;
