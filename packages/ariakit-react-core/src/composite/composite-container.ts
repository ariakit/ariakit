// TODO: Add data-attribute to indicate whether it's expanded?
import type { FocusEvent, KeyboardEvent, MouseEvent } from "react";
import { useContext, useEffect, useRef } from "react";
import { isButton, isTextField } from "@ariakit/core/utils/dom";
import { isFocusEventOutside, isSelfTarget } from "@ariakit/core/utils/events";
import {
  disableFocusIn,
  getFirstTabbableIn,
  restoreFocusIn,
} from "@ariakit/core/utils/focus";
import { useEvent, useForkRef } from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";
import { CompositeContext } from "./composite-context.js";
import type { CompositeStore } from "./composite-store.js";
import { selectTextField } from "./utils.js";

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
export const useCompositeContainer = createHook<CompositeContainerOptions>(
  ({ store, ...props }) => {
    const context = useContext(CompositeContext);
    store = store || context;

    const ref = useRef<HTMLDivElement>(null);
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

    const onFocus = useEvent((event: FocusEvent<HTMLDivElement>) => {
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

    const onBlur = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      if (isFocusEventOutside(event)) {
        close();
      }
    });

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLDivElement>) => {
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

    const onClick = useEvent((event: MouseEvent<HTMLDivElement>) => {
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
      ref: useForkRef(ref, props.ref),
      onFocus,
      onBlur,
      onKeyDown,
      onClick,
    };

    return props;
  }
);

/**
 * Renders a container for interactive widgets inside composite items. This
 * should be used in conjunction with the `CompositeItem` component or a
 * component that uses `CompositeItem` underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeStore();
 * <Composite store={composite}>
 *   <CompositeItem as={CompositeContainer}>
 *     <input type="text" />
 *   </CompositeItem>
 * </Composite>
 * ```
 */
export const CompositeContainer =
  createMemoComponent<CompositeContainerOptions>((props) => {
    const htmlProps = useCompositeContainer(props);
    return createElement("div", htmlProps);
  });

if (process.env.NODE_ENV !== "production") {
  CompositeContainer.displayName = "CompositeContainer";
}

export interface CompositeContainerOptions<T extends As = "div">
  extends Options<T> {
  /**
   * Object returned by the `useCompositeStore` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  store?: CompositeStore;
}

export type CompositeContainerProps<T extends As = "div"> = Props<
  CompositeContainerOptions<T>
>;
