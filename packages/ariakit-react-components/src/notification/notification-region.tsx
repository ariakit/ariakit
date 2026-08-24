import type { NotificationStore } from "@ariakit/components/notification/notification-store";
import { useStoreState } from "@ariakit/react-store";
import {
  useEvent,
  useMergeRefs,
  useSafeLayoutEffect,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import { init } from "@ariakit/store";
import {
  contains,
  invariant,
  isElement,
  isNode,
  warnOnce,
} from "@ariakit/utils";
import type { ElementType, FocusEvent, PointerEvent, RefObject } from "react";
import { useMemo, useRef } from "react";
import { NotificationRegionContext } from "./__notification-context.tsx";
import {
  NotificationContextProvider,
  useNotificationContext,
} from "./notification-context.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function getElementFromProp(
  prop?: HTMLElement | RefObject<HTMLElement | null> | null,
) {
  if (!prop) return null;
  return "current" in prop ? prop.current : prop;
}

/** Returns props to create a NotificationRegion component. */
export const useNotificationRegion = createHook<
  TagName,
  NotificationRegionOptions
>(function useNotificationRegion({ store: storeProp, finalFocus, ...props }) {
  const context = useNotificationContext();
  const store = storeProp || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "NotificationRegion must receive a `store` prop or be wrapped in a NotificationProvider component.",
  );

  const items = useStoreState(store, "items");
  const paused = useStoreState(store, "paused");
  const ref = useRef<HTMLType>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const pointerReleaseRef = useRef<(() => void) | null>(null);
  const focusReleaseRef = useRef<(() => void) | null>(null);

  useSafeLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const unbindDocument = store.unstable_bindDocument(element.ownerDocument);
    const destroyStore = init(store);
    return () => {
      destroyStore();
      unbindDocument();
    };
  }, [store]);

  useSafeLayoutEffect(() => {
    if (!items.length) return;
    const element = ref.current;
    if (!element) return;
    if (element.getAttribute("aria-label")) return;
    if (element.getAttribute("aria-labelledby")) return;
    warnOnce(
      "NotificationRegion must have an accessible name. Pass an `aria-label` or `aria-labelledby` prop.",
      element,
    );
  }, [items.length]);

  useSafeLayoutEffect(() => {
    if (items.length && !props.hidden) return;
    pointerReleaseRef.current?.();
    pointerReleaseRef.current = null;
    focusReleaseRef.current?.();
    focusReleaseRef.current = null;
  }, [items.length, props.hidden]);

  useSafeLayoutEffect(
    () => () => {
      pointerReleaseRef.current?.();
      focusReleaseRef.current?.();
    },
    [],
  );

  const restoreFocus = useEvent(() => {
    focusReleaseRef.current?.();
    focusReleaseRef.current = null;
    const finalFocusElement = getElementFromProp(finalFocus);
    if (finalFocusElement?.isConnected) {
      finalFocusElement.focus();
      return;
    }
    if (previousFocusRef.current?.isConnected) {
      previousFocusRef.current.focus();
    }
  });

  const onPointerEnterProp = props.onPointerEnter;
  const onPointerEnter = useEvent((event: PointerEvent<HTMLType>) => {
    onPointerEnterProp?.(event);
    if (event.defaultPrevented) return;
    pointerReleaseRef.current ??= store.pause();
  });

  const onPointerLeaveProp = props.onPointerLeave;
  const onPointerLeave = useEvent((event: PointerEvent<HTMLType>) => {
    onPointerLeaveProp?.(event);
    if (event.defaultPrevented) return;
    pointerReleaseRef.current?.();
    pointerReleaseRef.current = null;
  });

  const onFocusProp = props.onFocus;
  const onFocus = useEvent((event: FocusEvent<HTMLType>) => {
    onFocusProp?.(event);
    if (event.defaultPrevented) return;
    const relatedTarget = event.relatedTarget;
    if (
      !isNode(relatedTarget) ||
      !contains(event.currentTarget, relatedTarget)
    ) {
      previousFocusRef.current = isElement(relatedTarget)
        ? (relatedTarget as HTMLElement)
        : null;
      focusReleaseRef.current ??= store.pause();
    }
  });

  const onBlurProp = props.onBlur;
  const onBlur = useEvent((event: FocusEvent<HTMLType>) => {
    onBlurProp?.(event);
    if (event.defaultPrevented) return;
    const relatedTarget = event.relatedTarget;
    if (isNode(relatedTarget) && contains(event.currentTarget, relatedTarget)) {
      return;
    }
    focusReleaseRef.current?.();
    focusReleaseRef.current = null;
  });

  const regionContext = useMemo(
    () => ({ elementRef: ref, restoreFocus }),
    [restoreFocus],
  );
  props = useWrapElement(
    props,
    (element) => (
      <NotificationContextProvider value={store}>
        <NotificationRegionContext.Provider value={regionContext}>
          {element}
        </NotificationRegionContext.Provider>
      </NotificationContextProvider>
    ),
    [store, regionContext],
  );

  const empty = items.length === 0;
  return {
    "data-notifications": "",
    "data-paused": paused ? "" : undefined,
    role: empty ? undefined : "region",
    tabIndex: empty ? undefined : -1,
    ...props,
    hidden: empty || props.hidden,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    ref: useMergeRefs(ref, props.ref),
  };
});

/** Renders the region that contains notifications. */
export const NotificationRegion = forwardRef(function NotificationRegion(
  props: NotificationRegionProps,
) {
  const htmlProps = useNotificationRegion(props);
  return createElement(TagName, htmlProps);
});

export interface NotificationRegionOptions<
  _T extends ElementType = TagName,
> extends Options {
  store?: NotificationStore<any>;
  finalFocus?: HTMLElement | RefObject<HTMLElement | null> | null;
}

export type NotificationRegionProps<T extends ElementType = TagName> = Props<
  T,
  NotificationRegionOptions<T>
>;
