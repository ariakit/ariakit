import { createHook, createInstance } from "@ariakit/solid-utils";
import type { Options, Props } from "@ariakit/solid-utils";
import type { Component, JSX, ValidComponent } from "solid-js";

const TagName = "div" satisfies ValidComponent;
type TagName = typeof TagName;

// Standard, non-obsolete HTML tags shared by React and Solid, plus svg. Keep
// both frameworks in sync; exclude platform-specific intrinsic tags.
export const elements = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "search",
  "section",
  "select",
  "slot",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
  "svg",
] as const;

type RoleElements = {
  [K in (typeof elements)[number]]: Component<RoleProps<K>>;
};

/**
 * Returns props to create a `Role` component.
 * @see https://solid.ariakit.com/components/role
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

// TODO: Adapt the public docs wording for Solid.
// https://github.com/ariakit/ariakit/issues/4117
/**
 * Renders an abstract element that supports the `render` prop and a
 * `wrapInstance` prop that can be used to wrap the underlying component
 * instance with Solid Portal, Context or other component types.
 * @see https://solid.ariakit.com/components/role
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

export interface RoleOptions<
  _T extends ValidComponent = TagName,
> extends Options {}

export type RoleProps<T extends ValidComponent = TagName> = Props<
  T,
  RoleOptions
>;
