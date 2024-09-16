import type { Component, JSX, ValidComponent } from "solid-js";
import { createHook, createInstance } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";

const TagName = "div" satisfies ValidComponent;
type TagName = typeof TagName;

export const elements = [
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
  "summary",
  "textarea",
  "ul",
  "svg",
] as const;

type RoleElements = {
  [K in (typeof elements)[number]]: Component<RoleProps<K>>;
};

/**
 * Returns props to create a `Role` component.
 * @see https://solid.ariakit.org/components/role
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

// TODO: adapt docs wording to be more accurate for Solid
/**
 * Renders an abstract element that supports the `render` prop and a
 * `wrapInstance` prop that can be used to wrap the underlying component
 * instance with Solid Portal, Context or other component types.
 * @see https://solid.ariakit.org/components/role
 * @example
 * ```jsx
 * <Role render={<As.div />} />
 * ```
 */
export const Role = function Role(props: RoleProps): JSX.Element {
  return createInstance(TagName, props);
} as Component<RoleProps> & RoleElements;

Object.assign(
  Role,
  elements.reduce((acc, element) => {
    acc[element] = function Role(
      props: RoleProps<typeof element>,
    ): JSX.Element {
      return createInstance(element, props);
    };
    return acc;
  }, {} as RoleElements),
);

export interface RoleOptions<_T extends ValidComponent = TagName>
  extends Options {}

export type RoleProps<T extends ValidComponent = TagName> = Props<
  T,
  RoleOptions
>;
