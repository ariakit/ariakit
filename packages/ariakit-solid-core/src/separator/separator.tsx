import type { ValidComponent } from "solid-js";
import { mergeProps } from "../utils/reactivity.ts";
import { createHook, createInstance, withOptions } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";

const TagName = "hr" satisfies ValidComponent;
type TagName = typeof TagName;

/**
 * Returns props to create a `Separator` component.
 * @see https://solid.ariakit.org/components/separator
 * @example
 * ```jsx
 * const props = useSeparator({ orientation: "horizontal" });
 * <Role {...props} />
 * ```
 */
export const useSeparator = createHook<TagName, SeparatorOptions>(
  withOptions(
    { orientation: "horizontal" },
    function useSeparator(props, options) {
      props = mergeProps(
        {
          role: "separator" as const,
          get "aria-orientation"() {
            return options.orientation;
          },
        },
        props,
      );
      return props;
    },
  ),
);

/**
 * Renders a separator element.
 * @see https://solid.ariakit.org/components/separator
 * @example
 * ```jsx
 * <Separator orientation="horizontal" />
 * ```
 */
export const Separator = function Separator(props: SeparatorProps) {
  const htmlProps = useSeparator(props);
  return createInstance(TagName, htmlProps);
};

export interface SeparatorOptions<_T extends ValidComponent = TagName>
  extends Options {
  /**
   * The orientation of the separator.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
}

export type SeparatorProps<T extends ValidComponent = TagName> = Props<
  T,
  SeparatorOptions<T>
>;
