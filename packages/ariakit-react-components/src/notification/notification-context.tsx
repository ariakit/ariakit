import type { NotificationStore } from "@ariakit/components/notification/notification-store";
import { createStoreContext } from "@ariakit/react-utils";

const context = createStoreContext<NotificationStore<any>>();

/** Returns the notification store from the nearest notification container. */
export const useNotificationContext = context.useContext as () =>
  | NotificationStore
  | undefined;

/** Returns the notification store from the nearest scoped container. */
export const useNotificationScopedContext = context.useScopedContext as () =>
  | NotificationStore
  | undefined;

/** Returns the notification store from the nearest provider. */
export const useNotificationProviderContext =
  context.useProviderContext as () => NotificationStore | undefined;

export const NotificationContextProvider = context.ContextProvider;

export const NotificationScopedContextProvider = context.ScopedContextProvider;
