import { createElement, createHook2 } from "../utils/system.js";
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
export const useSeparator = createHook2<TagName, SeparatorOptions>(
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
export const Separator = forwardRef(function Separator(props: SeparatorProps) {
  const htmlProps = useSeparator(props);
  return createElement(TagName, htmlProps);
});

export interface SeparatorOptions<T extends ElementType = TagName>
  extends Options<T> {
  /**
   * The orientation of the separator.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
}

export type SeparatorProps<T extends ElementType = TagName> = Props<
  SeparatorOptions<T>
>;
