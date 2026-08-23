import { createStore, setup, sync } from "@ariakit/store";
import type { Store, StoreOptions } from "@ariakit/store";
import {
  applyState,
  canUseDOM,
  defaultValue,
  getDocument,
  getWindow,
  hasOwnProperty,
  warnOnce,
} from "@ariakit/utils";
import type { BivariantCallback, SetState } from "@ariakit/utils";
import {
  announce as announceText,
  cancelAnnouncements,
  primeAnnouncer,
} from "../__announcer/announcer.ts";

let storeCount = 0;
type NotificationPriority = "polite" | "assertive";

interface NotificationStoreItemBase {
  id: string;
  message: string;
  heading?: string;
  announceMessage?: string;
  timeout?: number | null;
  priority?: NotificationPriority;
  createdAt: number;
}

type NotificationStoreItemData<T> = {} extends T ? { data?: T } : { data: T };

export type NotificationStoreItem<T = unknown> = NotificationStoreItemBase &
  NotificationStoreItemData<T>;

export type NotificationPushProps<T = unknown> = Omit<
  NotificationStoreItemBase,
  "id" | "createdAt"
> & { id?: string } & NotificationStoreItemData<T>;

type NotificationUpdateProps<T = unknown> = Partial<
  Omit<NotificationStoreItemBase, "id" | "createdAt">
> & { data?: T };

export interface NotificationAnnounceProps {
  message: string;
  priority?: NotificationPriority;
}

interface NotificationUpdateOptions {
  announce?: boolean;
}

function getAnnouncementMessages(item: NotificationStoreItem) {
  if (item.announceMessage !== undefined) {
    return [item.announceMessage];
  }
  return item.heading ? [item.heading, item.message] : [item.message];
}

function haveSameMessages(
  previousItem: NotificationStoreItem,
  item: NotificationStoreItem,
) {
  const previousMessages = getAnnouncementMessages(previousItem);
  const messages = getAnnouncementMessages(item);
  if (previousMessages.length !== messages.length) return false;
  return previousMessages.every(
    (message, index) => message === messages[index],
  );
}

function getItemTimeout<T>(
  item: NotificationStoreItem<T>,
  state: NotificationStoreState<T>,
) {
  if (hasOwnProperty(item, "timeout") && item.timeout !== undefined) {
    return item.timeout;
  }
  return state.timeout;
}

function getItemPriority<T>(
  item: NotificationStoreItem<T>,
  state: NotificationStoreState<T>,
) {
  return item.priority ?? state.priority;
}

interface Deadline {
  id: string;
  remaining: number;
  startedAt?: number;
  cancelTimer?: () => void;
}

interface DocumentBinding {
  document: Document;
  releaseAnnouncer?: () => void;
}

/**
 * Creates a notification store.
 */
export function createNotificationStore<T = unknown>(
  props: NotificationStoreProps<T> = {},
): NotificationStore<T> {
  const initialState: NotificationStoreState<T> = {
    items: defaultValue(props.items, props.defaultItems, []),
    unstable_renderedIds: [],
    paused: false,
    timeout: defaultValue(props.timeout, 5000),
    priority: props.priority ?? "polite",
  };
  const notification = createStore(initialState);
  const storeToken = `s${++storeCount}`;
  const announcementScope = {};
  const renderedCounts = new Map<string, number>();
  const deadlines = new Map<string, Deadline>();
  const resetDeadlineIds = new Set<string>();
  const documentBindings: DocumentBinding[] = [];
  let reconnectDocumentListeners: (() => void) | undefined;
  let pauseHolds = 0;
  let idCount = 0;

  const getNotificationDocument = () => {
    if (!canUseDOM) return null;
    const binding = documentBindings[documentBindings.length - 1];
    return binding?.document ?? getDocument();
  };

  const clearDeadline = (id: string) => {
    const deadline = deadlines.get(id);
    if (!deadline) return;
    deadline.cancelTimer?.();
    deadlines.delete(id);
  };

  const removeItem = (id: string, warn: boolean) => {
    const item = store.item(id);
    if (!item) {
      if (warn && process.env.NODE_ENV !== "production") {
        warnOnce(`Notification item "${id}" does not exist.`, notification);
      }
      return;
    }
    clearDeadline(id);
    setItems((items) => items.filter((currentItem) => currentItem.id !== id));
  };

  const stopDeadline = (deadline: Deadline) => {
    if (!deadline.cancelTimer) return;
    deadline.cancelTimer();
    deadline.cancelTimer = undefined;
    const elapsed = Date.now() - (deadline.startedAt ?? Date.now());
    deadline.remaining = Math.max(0, deadline.remaining - elapsed);
    deadline.startedAt = undefined;
  };

  const startDeadline = (deadline: Deadline) => {
    if (notification.getState().paused) return;
    if (deadline.cancelTimer) return;
    const ownerDocument = getNotificationDocument();
    if (!ownerDocument) return;
    const ownerWindow = getWindow(ownerDocument);
    deadline.startedAt = Date.now();
    const timer = ownerWindow.setTimeout(() => {
      deadline.cancelTimer = undefined;
      deadlines.delete(deadline.id);
      removeItem(deadline.id, false);
    }, deadline.remaining);
    deadline.cancelTimer = () => ownerWindow.clearTimeout(timer);
  };

  const moveToDocument = (
    previousDocument: Document | null,
    nextDocument: Document | null,
  ) => {
    if (previousDocument === nextDocument) return;
    if (previousDocument) {
      cancelAnnouncements(previousDocument, announcementScope);
    }
    for (const deadline of deadlines.values()) {
      stopDeadline(deadline);
    }
    reconnectDocumentListeners?.();
    for (const deadline of deadlines.values()) {
      startDeadline(deadline);
    }
  };

  const resetDeadline = (
    id: string,
    item: NotificationStoreItem<T>,
    state: NotificationStoreState<T>,
  ) => {
    clearDeadline(id);
    const timeout = getItemTimeout(item, state);
    if (timeout === null) return;
    const deadline: Deadline = { id, remaining: timeout };
    deadlines.set(id, deadline);
    startDeadline(deadline);
  };

  const reconcileDeadlines = (
    state: NotificationStoreState<T>,
    previousState: NotificationStoreState<T>,
  ) => {
    const items = new Map(state.items.map((item) => [item.id, item]));
    const previousItems = new Map(
      previousState.items.map((item) => [item.id, item]),
    );

    for (const id of deadlines.keys()) {
      if (items.has(id)) continue;
      clearDeadline(id);
    }

    if (state.paused !== previousState.paused) {
      for (const deadline of deadlines.values()) {
        if (state.paused) {
          stopDeadline(deadline);
        } else {
          startDeadline(deadline);
        }
      }
    }

    const candidateIds = new Set([
      ...deadlines.keys(),
      ...state.unstable_renderedIds,
    ]);
    for (const id of candidateIds) {
      const item = items.get(id);
      if (!item) continue;
      const previousItem = previousItems.get(id);
      const entered = !previousState.unstable_renderedIds.includes(id);
      const timeoutChanged =
        !!previousItem &&
        getItemTimeout(item, state) !==
          getItemTimeout(previousItem, previousState);
      const shouldReset =
        (entered && !deadlines.has(id)) ||
        timeoutChanged ||
        resetDeadlineIds.has(id);
      if (shouldReset) {
        resetDeadline(id, item, state);
      }
    }
    resetDeadlineIds.clear();
  };

  const setItems: NotificationStore<T>["setItems"] = (value) => {
    notification.setState("items", (items) => {
      const nextItems = applyState(value, items);
      if (nextItems !== items) {
        props.setItems?.(nextItems);
      }
      return nextItems;
    });
  };

  const createId = () => {
    let id = "";
    do {
      id = `n${++idCount}`;
    } while (store.item(id));
    return id;
  };

  const announceItem = (item: NotificationStoreItem<T>) => {
    const ownerDocument = getNotificationDocument();
    if (!ownerDocument) return;
    const state = notification.getState();
    announceText(ownerDocument, getAnnouncementMessages(item), {
      key: `${storeToken}:r:${item.id}`,
      priority: getItemPriority(item, state),
      scope: announcementScope,
    });
  };

  const store: NotificationStore<T> = {
    ...notification,
    setItems,
    item: (id) => {
      if (id == null) return null;
      return (
        notification.getState().items.find((item) => item.id === id) || null
      );
    },
    push: (value) => {
      const pushProps = (
        typeof value === "string" ? { message: value } : value
      ) as NotificationPushProps<T>;
      const id = pushProps.id ?? createId();
      if (!getNotificationDocument()) {
        if (process.env.NODE_ENV !== "production") {
          warnOnce(
            "Notifications cannot be pushed during server rendering.",
            notification,
          );
        }
        return id;
      }
      const item = {
        ...pushProps,
        id,
        createdAt: Date.now(),
      } as NotificationStoreItem<T>;
      const index = notification
        .getState()
        .items.findIndex((currentItem) => currentItem.id === id);
      if (index >= 0) {
        resetDeadlineIds.add(id);
      }
      setItems((items) => {
        if (index < 0) return [...items, item];
        const nextItems = items.slice();
        nextItems[index] = item;
        return nextItems;
      });
      announceItem(item);
      return id;
    },
    update: (id, partial, options = {}) => {
      const item = store.item(id);
      if (!item) {
        if (process.env.NODE_ENV !== "production") {
          warnOnce(`Notification item "${id}" does not exist.`, notification);
        }
        return;
      }
      const nextItem = { ...item, ...partial };
      setItems((items) =>
        items.map((currentItem) =>
          currentItem.id === id ? nextItem : currentItem,
        ),
      );
      const shouldAnnounce =
        options.announce ?? !haveSameMessages(item, nextItem);
      if (shouldAnnounce) {
        announceItem(nextItem);
      }
    },
    remove: (id) => removeItem(id, true),
    clear: () => {
      for (const id of deadlines.keys()) {
        clearDeadline(id);
      }
      setItems([]);
    },
    announce: (value) => {
      const ownerDocument = getNotificationDocument();
      if (!ownerDocument) return;
      const announceProps =
        typeof value === "string" ? { message: value } : value;
      announceText(ownerDocument, announceProps.message, {
        priority: announceProps.priority ?? notification.getState().priority,
        scope: announcementScope,
      });
    },
    pause: () => {
      pauseHolds += 1;
      notification.setState("paused", true);
      let released = false;
      return () => {
        if (released) return;
        released = true;
        pauseHolds -= 1;
        if (pauseHolds === 0) {
          notification.setState("paused", false);
        }
      };
    },
    unstable_renderItem: (id) => {
      const count = renderedCounts.get(id) ?? 0;
      renderedCounts.set(id, count + 1);
      if (count === 0) {
        notification.setState("unstable_renderedIds", (ids) => [...ids, id]);
      }
      let rendered = true;
      return () => {
        if (!rendered) return;
        rendered = false;
        const nextCount = (renderedCounts.get(id) ?? 1) - 1;
        if (nextCount > 0) {
          renderedCounts.set(id, nextCount);
          return;
        }
        renderedCounts.delete(id);
        notification.setState("unstable_renderedIds", (ids) =>
          ids.filter((renderedId) => renderedId !== id),
        );
      };
    },
    unstable_bindDocument: (document) => {
      const previousDocument = getNotificationDocument();
      const binding: DocumentBinding = { document };
      if (canUseDOM) {
        binding.releaseAnnouncer = primeAnnouncer(document);
      }
      documentBindings.push(binding);
      moveToDocument(previousDocument, getNotificationDocument());

      let released = false;
      return () => {
        if (released) return;
        released = true;
        const index = documentBindings.indexOf(binding);
        if (index < 0) return;
        const currentDocument = getNotificationDocument();
        documentBindings.splice(index, 1);
        binding.releaseAnnouncer?.();
        moveToDocument(currentDocument, getNotificationDocument());
      };
    },
  };

  sync(
    notification,
    ["items", "unstable_renderedIds", "paused", "timeout", "priority"],
    reconcileDeadlines,
  );

  setup(notification, () => {
    let disconnectDocument: (() => void) | undefined;
    const connectDocument = () => {
      const ownerDocument = getNotificationDocument();
      if (!ownerDocument) return;
      const ownerWindow = getWindow(ownerDocument);
      let releaseVisibility: (() => void) | undefined;
      let releaseBlur: (() => void) | undefined;
      const onVisibilityChange = () => {
        if (ownerDocument.hidden) {
          releaseVisibility ??= store.pause();
        } else {
          releaseVisibility?.();
          releaseVisibility = undefined;
        }
      };
      const onBlur = () => {
        releaseBlur ??= store.pause();
      };
      const onFocus = () => {
        releaseBlur?.();
        releaseBlur = undefined;
      };
      onVisibilityChange();
      if (!ownerDocument.hasFocus()) {
        onBlur();
      }
      ownerDocument.addEventListener("visibilitychange", onVisibilityChange);
      ownerWindow.addEventListener("blur", onBlur);
      ownerWindow.addEventListener("focus", onFocus);
      return () => {
        releaseVisibility?.();
        releaseBlur?.();
        ownerDocument.removeEventListener(
          "visibilitychange",
          onVisibilityChange,
        );
        ownerWindow.removeEventListener("blur", onBlur);
        ownerWindow.removeEventListener("focus", onFocus);
      };
    };

    reconnectDocumentListeners = () => {
      const previousDisconnect = disconnectDocument;
      disconnectDocument = connectDocument();
      previousDisconnect?.();
    };
    reconnectDocumentListeners();
    return () => {
      reconnectDocumentListeners = undefined;
      disconnectDocument?.();
    };
  });

  return store;
}

export interface NotificationStoreState<T = unknown> {
  items: NotificationStoreItem<T>[];
  /**
   * The IDs of notification items committed by the framework adapter.
   * @default []
   * @private
   */
  unstable_renderedIds: string[];
  paused: boolean;
  timeout: number | null;
  priority: NotificationPriority;
}

export interface NotificationStoreFunctions<T = unknown> {
  push: BivariantCallback<
    (
      props: NotificationPushProps<T> | ({} extends T ? string : never),
    ) => string
  >;
  update: BivariantCallback<
    (
      id: string,
      partial: NotificationUpdateProps<T>,
      options?: NotificationUpdateOptions,
    ) => void
  >;
  remove: (id: string) => void;
  clear: () => void;
  announce: (props: string | NotificationAnnounceProps) => void;
  setItems: SetState<NotificationStoreState<T>["items"]>;
  item: (id: string | null | undefined) => NotificationStoreItem<T> | null;
  pause: () => () => void;
  /**
   * Registers a notification item committed by the framework adapter.
   * @private
   */
  unstable_renderItem: (id: string) => () => void;
  /**
   * Binds framework lifecycle effects to an owner document.
   * @private
   */
  unstable_bindDocument: (document: Document) => () => void;
}

export interface NotificationStoreOptions<T = unknown> extends StoreOptions<
  NotificationStoreState<T>,
  "timeout" | "priority"
> {
  defaultItems?: NoInfer<NotificationStoreItem<T>>[];
  items?: NoInfer<NotificationStoreItem<T>>[];
  setItems?: (items: NoInfer<NotificationStoreItem<T>>[]) => void;
}

export interface NotificationStoreProps<
  T = unknown,
> extends NotificationStoreOptions<T> {}

export interface NotificationStore<T = unknown>
  extends NotificationStoreFunctions<T>, Store<NotificationStoreState<T>> {}
