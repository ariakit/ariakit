import { As, Props } from "ariakit-react-utils/types";
import { CommandOptions } from "../command";
/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component. If the element is not a native button, the hook will
 * return additional props to make sure it's accessible.
 * @see https://ariakit.org/components/button
 * @example
 * ```jsx
 * const props = useButton({ as: "div" });
 * <Role {...props}>Accessible button</Role>
 * ```
 */
export declare const useButton: import("ariakit-react-utils/types").Hook<ButtonOptions<"button">>;
/**
 * A component that renders a native accessible button. If another element is
 * passed to the `as` prop, this component will make sure the rendered element
 * is accessible.
 * @see https://ariakit.org/components/button
 * @example
 * ```jsx
 * <Button as="div">Accessible button</Button>
 * ```
 */
export declare const Button: import("ariakit-react-utils/types").Component<ButtonOptions<"button">>;
export declare type ButtonOptions<T extends As = "button"> = CommandOptions<T>;
export declare type ButtonProps<T extends As = "button"> = Props<ButtonOptions<T>>;
