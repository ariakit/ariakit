import { As, Options, Props } from "ariakit-react-utils/types";
/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component. When applying the props returned by this hook to a
 * component, the component will be visually hidden, but still accessible to
 * screen readers.
 * @see https://ariakit.org/components/visually-hidden
 * @example
 * ```jsx
 * const props = useVisuallyHidden();
 * <a href="#">
 *   Learn more<Role {...props}> about the Solar System</Role>.
 * </a>
 * ```
 */
export declare const useVisuallyHidden: import("ariakit-react-utils/types").Hook<VisuallyHiddenOptions<"span">>;
/**
 * A component that renders an element that's visually hidden, but still
 * accessible to screen readers.
 * @see https://ariakit.org/components/visually-hidden
 * @example
 * ```jsx
 * <a href="#">
 *   Learn more<VisuallyHidden> about the Solar System</VisuallyHidden>.
 * </a>
 * ```
 */
export declare const VisuallyHidden: import("ariakit-react-utils/types").Component<VisuallyHiddenOptions<"span">>;
export declare type VisuallyHiddenOptions<T extends As = "span"> = Options<T>;
export declare type VisuallyHiddenProps<T extends As = "span"> = Props<VisuallyHiddenOptions<T>>;
