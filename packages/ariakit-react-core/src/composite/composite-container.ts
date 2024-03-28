// TODO: Add data-attribute to indicate whether it's expanded?
import type { ElementType, FocusEvent, KeyboardEvent, MouseEvent } from "react";
import { useEffect, useRef } from "react";
import { isButton, isTextField } from "@ariakit/core/utils/dom";
import { isFocusEventOutside, isSelfTarget } from "@ariakit/core/utils/events";
import {
  disableFocusIn,
  getFirstTabbableIn,
  restoreFocusIn,
} from "@ariakit/core/utils/focus";
import { removeUndefinedValues } from "@ariakit/core/utils/misc";
import { useEvent, useMergeRefs } from "../utils/hooks.ts";
import { useStoreState } from "../utils/store.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { useCompositeContext } from "./composite-context.tsx";
import type { CompositeStore } from "./composite-store.ts";
import { selectTextField } from "./utils.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function getFirstTabbable(container: HTMLElement) {
  restoreFocusIn(container);
  const tabbable = getFirstTabbableIn(container);
  disableFocusIn(container);
  return tabbable;
}

/**
 * Returns props to create a `CompositeContainer` component. This component
 * renders interactive widgets inside composite items. This should be used in
 * conjunction with the `CompositeItem` component, the `useCompositeItem` hook,
 * or any other component/hook that uses `CompositeItem` underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useCompositeContainer({ store });
 * <Composite store={store}>
 *   <CompositeItem {...props}>
 *     <input type="text" />
 *   </CompositeItem>
 * </Composite>
 * ```
 */
export const useCompositeContainer = createHook<
  TagName,
  CompositeContainerOptions
>(function useCompositeContainer({ store, ...props }) {
  const context = useCompositeContext();
  store = store || context;

  const ref = useRef<HTMLType>(null);
  const isOpenRef = useRef(false);

  const open = (collapseToEnd = false) => {
    const container = ref.current;
    if (!container) return;
    restoreFocusIn(container);
    const tabbable = getFirstTabbableIn(container);
    if (!tabbable) {
      disableFocusIn(container);
      return;
    }
    isOpenRef.current = true;
    queueMicrotask(() => {
      tabbable.focus();
      if (isTextField(tabbable) || tabbable.isContentEditable) {
        selectTextField(tabbable, collapseToEnd);
      }
    });
  };

  const close = () => {
    const container = ref.current;
    if (!container) return;
    isOpenRef.current = false;
    disableFocusIn(container);
  };

  const renderedItems = useStoreState(store, "renderedItems");

  // Disable focus on the tabbable elements inside the container when the
  // container is mounted.
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const isOpen = isOpenRef.current;
    // We need to wait for the items to be populated before we can disable
    // focus, so we consider edge cases where some tabbable elements become
    // disabled after the first render (for example, when rendering nested
    // composite elements).
    if (!isOpen && renderedItems?.length) {
      disableFocusIn(container);
    }
  }, [renderedItems]);

  const onFocusProp = props.onFocus;

  const onFocus = useEvent((event: FocusEvent<HTMLType>) => {
    onFocusProp?.(event);
    if (event.defaultPrevented) return;
    if (!store) return;
    const isOpen = isOpenRef.current;
    if (isSelfTarget(event)) {
      // The container element itself has received focus. Here we make an
      // additional step in case tabbable elements have been added lazily to
      // the DOM. We get all containers in the current composite element and
      // disable all tabbable elements inside them.
      isOpenRef.current = false;
      const { baseElement } = store.getState();
      const composite = baseElement;
      const selector = "[data-composite-container]";
      const containers = composite?.querySelectorAll<HTMLElement>(selector);
      containers?.forEach((container) => disableFocusIn(container));
    } else if (!isOpen) {
      // Otherwise, if any element inside the container has received focus,
      // for example, by a direct user click, we should act as the container
      // has been opened.
      isOpenRef.current = true;
      restoreFocusIn(event.currentTarget);
      // Resets the moves in the store so the composite item will not be
      // focused right after the focusable element inside the container gets
      // focus.
      store?.setState("moves", 0);
    }
  });

  const onBlurProp = props.onBlur;

  const onBlur = useEvent((event: FocusEvent<HTMLType>) => {
    onBlurProp?.(event);
    if (event.defaultPrevented) return;
    if (isFocusEventOutside(event)) {
      close();
    }
  });

  const onKeyDownProp = props.onKeyDown;

  const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
    onKeyDownProp?.(event);
    if (event.defaultPrevented) return;
    if (event.altKey) return;
    if (event.ctrlKey) return;
    if (event.metaKey) return;
    if (event.shiftKey) return;
    const container = event.currentTarget;
    if (isSelfTarget(event)) {
      // Alphanumeric key on container: focus the first tabbable element in
      // the container if it's a text field or contenteditable element. This
      // will automatically replace the text field value with the pressed key.
      if (event.key.length === 1 && event.key !== " ") {
        const tabbable = getFirstTabbable(container);
        if (!tabbable) return;
        if (isTextField(tabbable) || tabbable.isContentEditable) {
          event.stopPropagation();
          open();
        }
      }

      // Delete/Backspace on container: focus on the first tabbable element in
      // the container if it's a text field or contenteditable element. This
      // will automatically clear the text field value.
      else if (event.key === "Delete" || event.key === "Backspace") {
        const tabbable = getFirstTabbable(container);
        if (!tabbable) return;
        if (isTextField(tabbable) || tabbable.isContentEditable) {
          open();
          // We need to move focus back to the container as soon as the
          // delete/backspace key is captured by the text field.
          const onInput = () => queueMicrotask(() => container.focus());
          container.addEventListener("input", onInput, { once: true });
        }
      }
    }

    // Escape on tabbable element inside container: move focus back to the
    // container.
    else if (event.key === "Escape") {
      queueMicrotask(() => container.focus());
    }

    // Enter on tabbable element inside container: move focus back to the
    // container only if it's an input or contenteditable element.
    else if (event.key === "Enter") {
      const target = event.target as HTMLElement;
      const isInput =
        (target.tagName === "INPUT" && !isButton(target)) ||
        target.tagName === "TEXTAREA";
      if (isInput || target.isContentEditable) {
        event.preventDefault();
        queueMicrotask(() => container.focus());
      }
    }
  });

  const onClickProp = props.onClick;

  const onClick = useEvent((event: MouseEvent<HTMLType>) => {
    onClickProp?.(event);
    if (event.defaultPrevented) return;
    if (isSelfTarget(event) && !event.detail) {
      // Move focus to the first tabbable element in the container and place
      // at the end.
      open(true);
    }
  });

  props = {
    "data-composite-container": "",
    ...props,
    ref: useMergeRefs(ref, props.ref),
    onFocus,
    onBlur,
    onKeyDown,
    onClick,
  };

  return removeUndefinedValues(props);
});

/**
 * Renders a container for interactive widgets inside composite items. This
 * should be used in conjunction with the
 * [`CompositeItem`](https://ariakit.org/reference/composite-item) component or
 * a component that uses
 * [`CompositeItem`](https://ariakit.org/reference/composite-item) underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx {3-5}
 * <CompositeProvider>
 *   <Composite>
 *     <CompositeItem render={<CompositeContainer />}>
 *       <input type="text" />
 *     </CompositeItem>
 *   </Composite>
 * </CompositeProvider>
 * ```
 */
export const CompositeContainer = forwardRef(function CompositeContainer(
  props: CompositeContainerProps,
) {
  const htmlProps = useCompositeContainer(props);
  return createElement(TagName, htmlProps);
});

export interface CompositeContainerOptions<_T extends ElementType = TagName>
  extends Options {
  /**
   * Object returned by the
   * [`useCompositeStore`](https://ariakit.org/reference/use-composite-store)
   * hook. If not provided, the closest
   * [`Composite`](https://ariakit.org/reference/composite) or
   * [`CompositeProvider`](https://ariakit.org/reference/composite-provider)
   * components' context will be used.
   */
  store?: CompositeStore;
}

export type CompositeContainerProps<T extends ElementType = TagName> = Props<
  T,
  CompositeContainerOptions<T>
>;
