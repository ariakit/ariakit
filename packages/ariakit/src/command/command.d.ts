import { As, Props } from "ariakit-react-utils/types";
import { FocusableOptions } from "../focusable";
/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component. If the element is not a native clickable element (like a
 * button), the hook will return additional props to make sure it's accessible.
 * @see https://ariakit.org/components/command
 * @example
 * ```jsx
 * const props = useCommand({ as: "div" });
 * <Role {...props}>Accessible button</Role>
 * ```
 */
export declare const useCommand: import("ariakit-react-utils/types").Hook<CommandOptions<"button">>;
/**
 * A component that renders a native clickable element (a button). If another
 * element is passed to the `as` prop, this component will make sure the
 * rendered element is accessible.
 * @see https://ariakit.org/components/command
 * @example
 * ```jsx
 * <Command as="div">Accessible button</Command>
 * ```
 */
export declare const Command: import("ariakit-react-utils/types").Component<CommandOptions<"button">>;
export declare type CommandOptions<T extends As = "button"> = FocusableOptions<T> & {
    /**
     * If true, pressing the enter key will trigger a click on the button.
     * @default true
     */
    clickOnEnter?: boolean;
    /**
     * If true, pressing the space key will trigger a click on the button.
     * @default true
     */
    clickOnSpace?: boolean;
};
export declare type CommandProps<T extends As = "button"> = Props<CommandOptions<T>>;
