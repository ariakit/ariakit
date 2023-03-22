import { createComponent, createElement, createHook } from "../utils/system.js";
import { As, Options, Props } from "../utils/types.js";

/**
 * Returns props to create a `Role` component.
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
 * Renders an abstract element that supports the `as` prop, `children` as a
 * function and a `wrapElement` prop that can be used to wrap the underlying
 * element with React Portal, Context or other component types.
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
