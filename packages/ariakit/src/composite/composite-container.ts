// TODO: Add data-attribute to indicate whether it's expanded?
import {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
} from "react";
import { isButton, isTextField } from "ariakit-utils/dom";
import { isFocusEventOutside, isSelfTarget } from "ariakit-utils/events";
import {
  disableFocusIn,
  getFirstTabbableIn,
  restoreFocusIn,
} from "ariakit-utils/focus";
import { useEvent, useForkRef } from "ariakit-utils/hooks";
import { queueMicrotask } from "ariakit-utils/misc";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { CompositeContext, selectTextField } from "./__utils";
import { CompositeState } from "./composite-state";

function getFirstTabbable(container: HTMLElement) {
  restoreFocusIn(container);
  const tabbable = getFirstTabbableIn(container);
  disableFocusIn(container);
  return tabbable;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a container for interactive widgets inside
 * composite items. This should be used in conjunction with the `CompositeItem`
 * component, the `useCompositeItem` hook, or any other component/hook that uses
 * `CompositeItem` underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const state = useCompositeState();
 * const props = useCompositeContainer({ state });
 * <Composite state={state}>
 *   <CompositeItem {...props}>
 *     <input type="text" />
 *   </CompositeItem>
 * </Composite>
 * ```
 */
export const useCompositeContainer = createHook<CompositeContainerOptions>(
  ({ state, ...props }) => {
    state = useStore(state || CompositeContext, [
      "items",
      "baseRef",
      "setMoves",
    ]);
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
      if (!isOpen && state?.items.length) {
        disableFocusIn(container);
      }
    }, [state?.items]);

    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      const isOpen = isOpenRef.current;
      if (isSelfTarget(event)) {
        // The container element itself has received focus. Here we make an
        // additional step in case tabbable elements have been added lazily to
        // the DOM. We get all containers in the current composite element and
        // disable all tabbable elements inside them.
        isOpenRef.current = false;
        const composite = state?.baseRef.current;
        const selector = "[data-composite-container]";
        const containers = composite?.querySelectorAll<HTMLElement>(selector);
        containers?.forEach((container) => disableFocusIn(container));
      } else if (!isOpen) {
        // Otherwise, if any element inside the container has received focus,
        // for example, by a direct user click, we should act as the container
        // has been opened.
        isOpenRef.current = true;
        restoreFocusIn(event.currentTarget);
        // Resets the moves in the state so the composite item will not be
        // focused right after the focusable element inside the container gets
        // focus.
        state?.setMoves(0);
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
        // will automatically replace the text field value with the pressed
        // key.
        if (event.key.length === 1 && event.key !== " ") {
          const tabbable = getFirstTabbable(container);
          if (!tabbable) return;
          if (isTextField(tabbable) || tabbable.isContentEditable) {
            event.stopPropagation();
            open();
          }
        }
        // Delete/Backspace on container: focus on the first tabbable element
        // in the container if it's a text field or contenteditable element.
        // This will automatically clear the text field value.
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
 * A component that renders a container for interactive widgets inside composite
 * items. This should be used in conjunction with the `CompositeItem` component
 * or a component that uses `CompositeItem` underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeState();
 * <Composite state={composite}>
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

export type CompositeContainerOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useCompositeState` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  state?: CompositeState;
};

export type CompositeContainerProps<T extends As = "div"> = Props<
  CompositeContainerOptions<T>
>;
