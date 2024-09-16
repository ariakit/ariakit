import { combineProps } from "@solid-primitives/props";
import type { ValidComponent } from "solid-js";
import { extractPropsWithDefaults } from "../utils/misc.ts";
import { createHook, createInstance } from "../utils/system.tsx";
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
  function useSeparator(props) {
    const p = extractPropsWithDefaults(props, (p) => (props = p), {
      orientation: "horizontal",
    });

    props = combineProps(
      {
        role: "separator" as const,
        get "aria-orientation"() {
          return p.orientation ?? "horizontal";
        },
      },
      props,
    );
    return props;
  },
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
