import type { Component, JSX, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
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
 * Renders an abstract element that supports the `render` prop.
 * @see https://solid.ariakit.org/components/role
 * @example
 * ```jsx
 * <Role render="button" renderProps={{ type: "button" }} />
 * ```
 */
export const Role = function Role(props: any): JSX.Element {
  return <Dynamic {...props} component={props.render ?? TagName} />;
} as Component<RoleProps<"div">> & RoleElements;

Object.assign(
  Role,
  elements.reduce((acc, element) => {
    acc[element] = function Role(
      props: RoleProps<typeof element>,
    ): JSX.Element {
      return (
        <Dynamic
          {...props}
          component={(props.render as ValidComponent) ?? element}
        />
      );
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
