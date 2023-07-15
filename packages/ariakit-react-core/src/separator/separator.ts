import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";

/**
 * Returns props to create a `Separator` component.
 * @see https://ariakit.org/components/separator
 * @example
 * ```jsx
 * const props = useSeparator({ orientation: "horizontal" });
 * <Role {...props} />
 * ```
 */
export const useSeparator = createHook<SeparatorOptions>(
  ({ orientation = "horizontal", ...props }) => {
    props = {
      role: "separator",
      "aria-orientation": orientation,
      ...props,
    };
    return props;
  },
);

/**
 * Renders a separator element.
 * @see https://ariakit.org/components/separator
 * @example
 * ```jsx
 * <Separator orientation="horizontal" />
 * ```
 */
export const Separator = createComponent<SeparatorOptions>((props) => {
  const htmlProps = useSeparator(props);
  return createElement("hr", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Separator.displayName = "Separator";
}

export interface SeparatorOptions<T extends As = "hr"> extends Options<T> {
  /**
   * The orientation of the separator.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
}

export type SeparatorProps<T extends As = "hr"> = Props<SeparatorOptions<T>>;
