import type { ValidComponent } from "solid-js";
import { mergeProps } from "../utils/reactivity.ts";
import { createHook, createInstance } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import type { VisuallyHiddenOptions } from "../visually-hidden/visually-hidden.tsx";
import { useVisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

const TagName = "span" satisfies ValidComponent;
type TagName = typeof TagName;

/**
 * Returns props to create a `FocusTrap` component.
 * @see https://solid.ariakit.org/components/focus-trap
 * @example
 * ```jsx
 * const props = useFocusTrap();
 * <Role {...props} />
 * ```
 */
export const useFocusTrap = createHook<TagName, FocusTrapOptions>(
  function useFocusTrap(props) {
    props = mergeProps(
      {
        "data-focus-trap": "",
        tabIndex: 0,
        "aria-hidden": true,
        style: {
          // Prevents unintended scroll jumps.
          position: "fixed",
          top: 0,
          left: 0,
        },
      },
      props,
    );

    props = useVisuallyHidden(props);

    return props;
  },
);

/**
 * Renders a focus trap element.
 * @see https://solid.ariakit.org/components/focus-trap
 * @example
 * ```jsx
 * <FocusTrap onFocus={focusSomethingElse} />
 * ```
 */
export function FocusTrap(props: FocusTrapProps) {
  const htmlProps = useFocusTrap(props);
  return createInstance(TagName, htmlProps);
}

export type FocusTrapOptions<T extends ValidComponent = TagName> =
  VisuallyHiddenOptions<T>;

export type FocusTrapProps<T extends ValidComponent = TagName> = Props<
  T,
  FocusTrapOptions<T>
>;
