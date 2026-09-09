import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import type { ElementType, FC } from "react";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

// Standard, non-obsolete HTML tags shared by React and Solid, plus svg. Keep
// both frameworks in sync; exclude platform-specific intrinsic tags.
const elements = [
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
