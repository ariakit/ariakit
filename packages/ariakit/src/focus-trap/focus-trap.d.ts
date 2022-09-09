import { As, Props } from "ariakit-react-utils/types";
import { VisuallyHiddenOptions } from "../visually-hidden";
/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a focus trap element.
 * @see https://ariakit.org/components/focus-trap
 * @example
 * ```jsx
 * const props = useFocusTrap();
 * <Role {...props} />
 * ```
 */
export declare const useFocusTrap: import("ariakit-react-utils/types").Hook<FocusTrapOptions<"span">>;
/**
 * A component that renders a focus trap element.
 * @see https://ariakit.org/components/focus-trap
 * @example
 * ```jsx
 * <FocusTrap onFocus={focusSomethingElse} />
 * ```
 */
export declare const FocusTrap: import("ariakit-react-utils/types").Component<FocusTrapOptions<"span">>;
export declare type FocusTrapOptions<T extends As = "span"> = VisuallyHiddenOptions<T>;
export declare type FocusTrapProps<T extends As = "span"> = Props<FocusTrapOptions<T>>;
