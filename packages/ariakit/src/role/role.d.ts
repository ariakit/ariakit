import { As, Options, Props } from "ariakit-react-utils/types";
/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an abstract element that supports the `as` prop,
 * `children` as a function and a `wrapElement` prop that can be used to wrap
 * the underlying element with React Portal, Context or other component types.
 * @see https://ariakit.org/components/role
 * @example
 * ```jsx
 * const props = useRole();
 * <Role {...props} />
 * ```
 */
export declare const useRole: import("ariakit-react-utils/types").Hook<RoleOptions<"div">>;
/**
 * A component that renders an abstract element that supports the `as` prop,
 * `children` as a function and a `wrapElement` prop that can be used to wrap
 * the underlying element with React Portal, Context or other component types.
 * @see https://ariakit.org/components/role
 * @example
 * ```jsx
 * <Role as="div" />
 * ```
 */
export declare const Role: import("ariakit-react-utils/types").Component<RoleOptions<"div">>;
export declare type RoleOptions<T extends As = "div"> = Options<T>;
export declare type RoleProps<T extends As = "div"> = Props<RoleOptions<T>>;
