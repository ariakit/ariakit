import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import { getVisuallyHiddenStyle as getCoreVisuallyHiddenStyle } from "@ariakit/utils";
import type { CSSProperties, ElementType } from "react";

/**
 * Returns styles to visually hide an element while keeping it accessible to
 * screen readers.
 */
export function getVisuallyHiddenStyle(style?: CSSProperties): CSSProperties {
  return style
    ? getCoreVisuallyHiddenStyle(style)
    : getCoreVisuallyHiddenStyle();
}

const TagName = "span" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `VisuallyHidden` component. When applying the props
 * returned by this hook to a component, the component will be visually hidden,
 * but still accessible to screen readers.
 * @see https://ariakit.com/components/visually-hidden
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
    props = {
      ...props,
      style: getVisuallyHiddenStyle(props.style),
    };
    return props;
  },
);

/**
 * Renders an element that's visually hidden, but still accessible to screen
 * readers.
 * @see https://ariakit.com/components/visually-hidden
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

export interface VisuallyHiddenOptions<
  _T extends ElementType = TagName,
> extends Options {}

export type VisuallyHiddenProps<T extends ElementType = TagName> = Props<
  T,
  VisuallyHiddenOptions<T>
>;
