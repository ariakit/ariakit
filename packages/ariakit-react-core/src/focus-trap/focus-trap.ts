import { createElement, createHook2 } from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
import type { VisuallyHiddenOptions } from "../visually-hidden/visually-hidden.js";
import { useVisuallyHidden } from "../visually-hidden/visually-hidden.js";

/**
 * Returns props to create a `FocusTrap` component.
 * @see https://ariakit.org/components/focus-trap
 * @example
 * ```jsx
 * const props = useFocusTrap();
 * <Role {...props} />
 * ```
 */
export const useFocusTrap = createHook2<TagName, FocusTrapOptions>((props) => {
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
export const FocusTrap = forwardRef(function FocusTrap(props: FocusTrapProps) {
  const htmlProps = useFocusTrap(props);
  return createElement(TagName, htmlProps);
});

export type FocusTrapOptions<T extends ElementType = TagName> =
  VisuallyHiddenOptions<T>;

export type FocusTrapProps<T extends ElementType = TagName> = Props2<
  T,
  FocusTrapOptions<T>
>;
