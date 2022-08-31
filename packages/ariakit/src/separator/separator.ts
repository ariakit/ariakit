import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a separator element.
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
  }
);

/**
 * A component that renders a separator element.
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

export type SeparatorOptions<T extends As = "hr"> = Options<T> & {
  /**
   * The orientation of the separator.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
};

export type SeparatorProps<T extends As = "hr"> = Props<SeparatorOptions<T>>;
