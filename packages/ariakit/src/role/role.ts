import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";

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
export const useRole = createHook<RoleOptions>((props) => {
  return props;
});

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
export const Role = createComponent<RoleOptions>((props) => {
  return createElement("div", props);
});

if (process.env.NODE_ENV !== "production") {
  Role.displayName = "Role";
}

export type RoleOptions<T extends As = "div"> = Options<T>;

export type RoleProps<T extends As = "div"> = Props<RoleOptions<T>>;
