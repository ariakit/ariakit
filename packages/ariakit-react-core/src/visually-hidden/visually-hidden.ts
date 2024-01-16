import { createElement, createHook2 } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";

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
  (props) => {
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

export type VisuallyHiddenOptions<T extends ElementType = TagName> = Options<T>;

export type VisuallyHiddenProps<T extends ElementType = TagName> = Props2<
  T,
  VisuallyHiddenOptions<T>
>;
