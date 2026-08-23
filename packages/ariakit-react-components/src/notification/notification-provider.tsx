import type { NotificationStore as CoreNotificationStore } from "@ariakit/components/notification/notification-store";
import { useSafeLayoutEffect } from "@ariakit/react-utils";
import { init } from "@ariakit/store";
import type { ReactNode } from "react";
import { NotificationContextProvider } from "./notification-context.tsx";
import type { NotificationStoreProps } from "./notification-store.ts";
import {
  useNotificationStore,
  useNotificationStoreProps,
} from "./notification-store.ts";

function ExternalNotificationProvider<T>({
  store,
  children,
  ...props
}: ExternalNotificationProviderProps<T>) {
  useNotificationStoreProps<T, CoreNotificationStore<T>>(store, props);
  useSafeLayoutEffect(() => init(store), [store]);
  return (
    <NotificationContextProvider value={store}>
      {children}
    </NotificationContextProvider>
  );
}

interface ExternalNotificationProviderProps<
  T,
> extends NotificationStoreProps<T> {
  store: CoreNotificationStore<T>;
  children?: ReactNode;
}

function InternalNotificationProvider<T>(
  props: Omit<NotificationProviderProps<T>, "store">,
) {
  const store = useNotificationStore<T>(props);
  return (
    <NotificationContextProvider value={store}>
      {props.children}
    </NotificationContextProvider>
  );
}

/** Provides a notification store to Notification components. */
export function NotificationProvider<T = unknown>(
  props: NotificationProviderProps<T> = {},
) {
  if (props.store) {
    return <ExternalNotificationProvider<T> {...props} store={props.store} />;
  }
  return <InternalNotificationProvider<T> {...props} />;
}

export interface NotificationProviderProps<
  T = unknown,
> extends NotificationStoreProps<T> {
  store?: CoreNotificationStore<T>;
  children?: ReactNode;
}
