import type { ElementType } from "react";
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { Options2, Props2 } from "../utils/types.js";

const TagName = "span" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `VisuallyHidden` component. When applying the props
 * returned by this hook to a component, the component will be visually hidden,
 * but still accessible to screen readers.
 * @see https://ariakit.org/components/visually-hidden
 * @example
 * ```jsx
 * const props = useVisuallyHidden();
 * <a href="#">
 *   Learn more<Role {...props}> about the Solar System</Role>.
 * </a>
 * ```
 */
export const useVisuallyHidden = createHook2<TagName, VisuallyHiddenOptions>(
  function useVisuallyHidden(props) {
    props = {
      ...props,
      style: {
        border: 0,
        clip: "rect(0 0 0 0)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        whiteSpace: "nowrap",
        width: "1px",
        ...props.style,
      },
    };
    return props;
  },
);

/**
 * Renders an element that's visually hidden, but still accessible to screen
 * readers.
 * @see https://ariakit.org/components/visually-hidden
 * @example
 * ```jsx
 * <a href="#">
 *   Learn more<VisuallyHidden> about the Solar System</VisuallyHidden>.
 * </a>
 * ```
 */
export const VisuallyHidden = forwardRef(function VisuallyHidden(
  props: VisuallyHiddenProps,
) {
  const htmlProps = useVisuallyHidden(props);
  return createElement(TagName, htmlProps);
});

export interface VisuallyHiddenOptions<_T extends ElementType = TagName>
  extends Options2 {}

export type VisuallyHiddenProps<T extends ElementType = TagName> = Props2<
  T,
  VisuallyHiddenOptions<T>
>;
