import { elements } from "@ariakit/components/role/role";
import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import type { ElementType, FC } from "react";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

type RoleElements = {
  [K in (typeof elements)[number]]: FC<RoleProps<K>>;
};

/**
 * Returns props to create a `Role` component.
 * @see https://ariakit.com/components/role
 * @example
 * ```jsx
 * const props = useRole();
 * <Role {...props} />
 * ```
 */
export const useRole = createHook<TagName, RoleOptions>(
  function useRole(props) {
    return props;
  },
);

/**
 * Renders an abstract element that supports the `render` prop and a
 * `wrapElement` prop that can be used to wrap the underlying element with React
 * Portal, Context or other component types.
 * @see https://ariakit.com/components/role
 * @example
 * ```jsx
 * <Role render={<div />} />
 * ```
 */
export const Role = forwardRef(function Role(props: RoleProps) {
  return createElement(TagName, props);
}) as FC<RoleProps> & RoleElements;

Object.assign(
  Role,
  elements.reduce((acc, element) => {
    acc[element] = forwardRef(function Role(props: RoleProps<typeof element>) {
      return createElement(element, props);
    });
    return acc;
  }, {} as RoleElements),
);

export interface RoleOptions<
  _T extends ElementType = TagName,
> extends Options {}

export type RoleProps<T extends ElementType = TagName> = Props<
  T,
  RoleOptions<T>
>;
