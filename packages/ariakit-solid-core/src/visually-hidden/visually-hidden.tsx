import type { ValidComponent } from "solid-js";
import { mergeProps } from "../utils/reactivity.ts";
import { createHook, createInstance } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";

const TagName = "span" satisfies ValidComponent;
type TagName = typeof TagName;

/**
 * Returns props to create a `VisuallyHidden` component. When applying the props
 * returned by this hook to a component, the component will be visually hidden,
 * but still accessible to screen readers.
 * @see https://solid.ariakit.org/components/visually-hidden
 * @example
 * ```jsx
 * const props = useVisuallyHidden();
 * <a href="#">
 *   Learn more<Role {...props}> about the Solar System</Role>.
 * </a>
 * ```
 */
export const useVisuallyHidden = createHook<TagName, VisuallyHiddenOptions>(
  function useVisuallyHidden(props) {
    props = mergeProps(
      {
        style: {
          border: 0,
          clip: "rect(0 0 0 0)",
          height: "1px",
          margin: "-1px",
          overflow: "hidden",
          padding: 0,
          position: "absolute",
          "white-space": "nowrap",
          width: "1px",
        },
      },
      props,
    );
    return props;
  },
);

/**
 * Renders an element that's visually hidden, but still accessible to screen
 * readers.
 * @see https://solid.ariakit.org/components/visually-hidden
 * @example
 * ```jsx
 * <a href="#">
 *   Learn more<VisuallyHidden> about the Solar System</VisuallyHidden>.
 * </a>
 * ```
 */
export function VisuallyHidden(props: VisuallyHiddenProps) {
  const htmlProps = useVisuallyHidden(props);
  return createInstance(TagName, htmlProps);
}

export interface VisuallyHiddenOptions<_T extends ValidComponent = TagName>
  extends Options {}

export type VisuallyHiddenProps = Props<TagName, VisuallyHiddenOptions>;
