import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import {
  VisuallyHiddenOptions,
  useVisuallyHidden,
} from "../visually-hidden/visually-hidden";

/**
 * Returns props to create a `FocusTrap` component.
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
 * Renders a focus trap element.
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

if (process.env.NODE_ENV !== "production") {
  FocusTrap.displayName = "FocusTrap";
}

export type FocusTrapOptions<T extends As = "span"> = VisuallyHiddenOptions<T>;

export type FocusTrapProps<T extends As = "span"> = Props<FocusTrapOptions<T>>;
