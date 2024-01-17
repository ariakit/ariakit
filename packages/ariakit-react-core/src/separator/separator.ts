import type { ElementType } from "react";
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { Options2, Props2 } from "../utils/types.js";

const TagName = "hr" satisfies ElementType;
type TagName = typeof TagName;

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
  function useSeparator({ orientation = "horizontal", ...props }) {
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

export interface SeparatorOptions<_T extends ElementType = TagName>
  extends Options2 {
  /**
   * The orientation of the separator.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
}

export type SeparatorProps<T extends ElementType = TagName> = Props2<
  T,
  SeparatorOptions<T>
>;
