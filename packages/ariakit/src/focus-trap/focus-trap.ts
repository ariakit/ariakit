import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { VisuallyHiddenOptions, useVisuallyHidden } from "../visually-hidden";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a focus trap element.
 * @see https://ariakit.org/components/focus-trap
 * @example
 * ```jsx
 * const props = useFocusTrap();
 * <Role {...props} />
 * ```
 */
export const useFocusTrap = createHook<FocusTrapOptions>((props) => {
  props = {
    "data-focus-trap": "",
    tabIndex: 0,
    "aria-hidden": true,
    ...props,
    style: {
      // Prevents unintended scroll jumps.
      position: "fixed",
      top: 0,
      left: 0,
      ...props.style,
    },
  };

  props = useVisuallyHidden(props);

  return props;
});

/**
 * A component that renders a focus trap element.
 * @see https://ariakit.org/components/focus-trap
 * @example
 * ```jsx
 * <FocusTrap onFocus={focusSomethingElse} />
 * ```
 */
export const FocusTrap = createComponent<FocusTrapOptions>((props) => {
  const htmlProps = useFocusTrap(props);
  return createElement("span", htmlProps);
});

export type FocusTrapOptions<T extends As = "span"> = VisuallyHiddenOptions<T>;

export type FocusTrapProps<T extends As = "span"> = Props<FocusTrapOptions<T>>;
