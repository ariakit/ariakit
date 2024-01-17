import type { ElementType, FC } from "react";
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { Options2, Props2 } from "../utils/types.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

const elements = [
  "a",
  "button",
  "details",
  "dialog",
  "div",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "section",
  "select",
  "span",
  "textarea",
  "ul",
  "svg",
] as const;

type RoleElements = {
  [K in (typeof elements)[number]]: FC<RoleProps<K>>;
};

/**
 * Returns props to create a `Role` component.
 * @see https://ariakit.org/components/role
 * @example
 * ```jsx
 * const props = useRole();
 * <Role {...props} />
 * ```
 */
export const useRole = createHook2<TagName, RoleOptions>(
  function useRole(props) {
    return props;
  },
);

/**
 * Renders an abstract element that supports the `render` prop and a
 * `wrapElement` prop that can be used to wrap the underlying element with React
 * Portal, Context or other component types.
 * @see https://ariakit.org/components/role
 * @example
 * ```jsx
 * <Role render={<div />} />
 * ```
 */
export const Role = forwardRef(
  // @ts-expect-error
  function Role(props: RoleProps) {
    return createElement(TagName, props);
  },
) as FC<RoleProps<"div">> & RoleElements;

Object.assign(
  Role,
  elements.reduce((acc, element) => {
    acc[element] = forwardRef(function Role(props: RoleProps<typeof element>) {
      return createElement(element, props);
    });
    return acc;
  }, {} as RoleElements),
);

export interface RoleOptions<_T extends ElementType = TagName>
  extends Options2 {}

export type RoleProps<T extends ElementType = TagName> = Props2<
  T,
  RoleOptions<T>
>;
