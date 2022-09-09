import { SyntheticEvent } from "react";
import { As, Options, Props } from "ariakit-react-utils/types";
import { BivariantCallback } from "ariakit-utils/types";
/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an element that can be focused.
 * @see https://ariakit.org/components/focusable
 * @example
 * ```jsx
 * const props = useFocusable();
 * <Role {...props}>Focusable</Role>
 * ```
 */
export declare const useFocusable: import("ariakit-react-utils/types").Hook<FocusableOptions<"div">>;
/**
 * A component that renders an element that can be focused.
 * @see https://ariakit.org/components/focusable
 * @example
 * ```jsx
 * <Focusable>Focusable</Focusable>
 * ```
 */
export declare const Focusable: import("ariakit-react-utils/types").Component<FocusableOptions<"div">>;
export declare type FocusableOptions<T extends As = "div"> = Options<T> & {
    /**
     * Determines whether the focusable element is disabled. If the focusable
     * element doesn't support the native `disabled` attribute, the
     * `aria-disabled` attribute will be used instead.
     * @default false
     */
    disabled?: boolean;
    /**
     * Automatically focus the element when it is mounted. It works similarly to
     * the native `autoFocus` prop, but solves an issue where the element is
     * given focus before React effects can run.
     * @default false
     */
    autoFocus?: boolean;
    /**
     * Whether the element should be focusable.
     * @default true
     */
    focusable?: boolean;
    /**
     * Determines whether the element should be focusable even when it is
     * disabled.
     *
     * This is important when discoverability is a concern. For example:
     *
     * > A toolbar in an editor contains a set of special smart paste functions
     * that are disabled when the clipboard is empty or when the function is not
     * applicable to the current content of the clipboard. It could be helpful to
     * keep the disabled buttons focusable if the ability to discover their
     * functionality is primarily via their presence on the toolbar.
     *
     * Learn more on [Focusability of disabled
     * controls](https://www.w3.org/TR/wai-aria-practices-1.2/#kbd_disabled_controls).
     */
    accessibleWhenDisabled?: boolean;
    /**
     * Custom event handler that is called when the element is focused via the
     * keyboard or when a key is pressed while the element is focused.
     */
    onFocusVisible?: BivariantCallback<(event: SyntheticEvent) => void>;
};
export declare type FocusableProps<T extends As = "div"> = Props<FocusableOptions<T>>;
