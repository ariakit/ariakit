import type {
  NotificationStore,
  NotificationStoreItem,
} from "@ariakit/components/notification/notification-store";
import {
  useEvent,
  useWrapElement,
  createElement,
  forwardRef,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import {
  contains,
  getActiveElement,
  invariant,
  sortBasedOnDOMPosition,
} from "@ariakit/utils";
import type { ElementType, ReactNode } from "react";
import { useContext, useMemo, useRef } from "react";
import {
  NotificationListContext,
  NotificationRegionContext,
} from "./__notification-context.tsx";
import {
  NotificationScopedContextProvider,
  useNotificationContext,
} from "./notification-context.tsx";
import { NotificationItems } from "./notification-items.tsx";

const TagName = "ol" satisfies ElementType;
type TagName = typeof TagName;

type StoreData<S> = S extends NotificationStore<infer T> ? T : unknown;

/** Returns props to create a NotificationList component. */
export function useNotificationList<
  S extends NotificationStore<any> | undefined = undefined,
  T extends ElementType = TagName,
>(
  {
    store: storeProp,
    filter,
    limit = 3,
    children: childrenProp,
    ...props
  }: NotificationListProps<S, T> = {} as NotificationListProps<S, T>,
) {
  const context = useNotificationContext();
  const store = (storeProp || context) as
    | NotificationStore<StoreData<S>>
    | undefined;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "NotificationList must receive a `store` prop or be wrapped in a NotificationProvider component.",
  );

  const region = useContext(NotificationRegionContext);
  const elementsRef = useRef(new Set<HTMLElement>());

  const register = useEvent((element: HTMLElement) => {
    elementsRef.current.add(element);
    return () => {
      const activeElement = getActiveElement(element);
      const hadFocus = !!activeElement && contains(element, activeElement);
      const previousOrder = sortBasedOnDOMPosition(
        Array.from(elementsRef.current),
        (currentElement) => currentElement,
      );
      const index = previousOrder.indexOf(element);
      elementsRef.current.delete(element);
      if (!hadFocus) return;

      queueMicrotask(() => {
        if (elementsRef.current.has(element) || element.isConnected) return;
        const isCurrentElement = (currentElement: HTMLElement) =>
          elementsRef.current.has(currentElement) && currentElement.isConnected;
        const nextElement = previousOrder
          .slice(index + 1)
          .find(isCurrentElement);
        const previousElement = previousOrder
          .slice(0, index)
          .reverse()
          .find(isCurrentElement);
        const newElement = sortBasedOnDOMPosition(
          Array.from(elementsRef.current),
          (currentElement) => currentElement,
        ).find((currentElement) => currentElement.isConnected);
        const focusElement = nextElement || previousElement || newElement;
        if (focusElement) {
          focusElement.focus();
        } else {
          region?.restoreFocus();
        }
      });
    };
  });

  const listContext = useMemo(() => ({ register }), [register]);
  props = useWrapElement(
    props,
    (element) => (
      <NotificationScopedContextProvider value={store}>
        <NotificationListContext.Provider value={listContext}>
          {element}
        </NotificationListContext.Provider>
      </NotificationScopedContextProvider>
    ),
    [store, listContext],
  );

  const children =
    typeof childrenProp === "function" ? (
      <NotificationItems<NotificationStore<StoreData<S>>>
        store={store}
        filter={filter}
        limit={limit}
      >
        {childrenProp}
      </NotificationItems>
    ) : (
      childrenProp
    );

  return { ...props, children };
}

/** Renders the ordered list that contains notifications. */
export const NotificationList = forwardRef(function NotificationList<
  S extends NotificationStore<any> | undefined = undefined,
  T extends ElementType = TagName,
>(props: NotificationListProps<S, T>) {
  const htmlProps = useNotificationList(props);
  return createElement(TagName, htmlProps);
});

export interface NotificationListOptions<
  S extends NotificationStore<any> | undefined = undefined,
  _T extends ElementType = TagName,
> extends Options {
  store?: S;
  filter?: (item: NotificationStoreItem<StoreData<S>>) => boolean;
  limit?: number;
  children?:
    | ReactNode
    | ((items: NotificationStoreItem<StoreData<S>>[]) => ReactNode);
}

export type NotificationListProps<
  S extends NotificationStore<any> | undefined = undefined,
  T extends ElementType = TagName,
> = Props<T, NotificationListOptions<S, T>>;
