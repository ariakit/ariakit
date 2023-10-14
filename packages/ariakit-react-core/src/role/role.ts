import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Component, Options, Props } from "../utils/types.js";

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
  [K in (typeof elements)[number]]: Component<RoleOptions<K>>;
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
export const useRole = createHook<RoleOptions>((props) => {
  return props;
});

/**
 * Renders an abstract element that supports the `render` prop a `wrapElement`
 * prop that can be used to wrap the underlying element with React Portal,
 * Context or other component types.
 * @see https://ariakit.org/components/role
 * @example
 * ```jsx
 * <Role render={<div />} />
 * ```
 */
export const Role = createComponent<RoleOptions>((props) => {
  return createElement("div", props);
}) as Component<RoleOptions<"div">> & RoleElements;

if (process.env.NODE_ENV !== "production") {
  Role.displayName = "Role";
}

Object.assign(
  Role,
  elements.reduce((acc, element) => {
    acc[element] = createComponent<RoleOptions<typeof element>>((props) => {
      return createElement(element, props);
    });
    return acc;
  }, {} as RoleElements),
);

export type RoleOptions<T extends As = "div"> = Options<T>;

export type RoleProps<T extends As = "div"> = Props<RoleOptions<T>>;
