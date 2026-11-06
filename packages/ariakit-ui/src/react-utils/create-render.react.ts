import { mergeProps } from "@ariakit/react-utils";
import * as React from "react";
import { isIterable } from "./is-iterable.ts";

/**
 * Whether an optional render shorthand requests an element. Nullish values and
 * `false` omit it; `0` and an explicit empty string remain content.
 */
export function isRenderable(value: unknown) {
  return value != null && value !== false;
}

/**
 * Whether children have content, such as text, a number, or an element. Unlike
 * `isRenderable`, a blank string and a list of only nullish values or booleans
 * have none. An element always counts, even one that renders nothing.
 */
export function hasContent(children: React.ReactNode) {
  return React.Children.toArray(children).some((child) =>
    typeof child === "string" ? child.trim() !== "" : true,
  );
}

/**
 * Returns the text of children that are only text and numbers, such as
 * `{count} files`. Numbers include bigints, which React 19 renders as text.
 * Returns `undefined` for other children, such as elements.
 */
export function getChildrenText(children: React.ReactNode) {
  const nodes = React.Children.toArray(children);
  if (!nodes.length) return;
  let text = "";
  for (const node of nodes) {
    if (!isTextNode(node)) return;
    text += node;
  }
  return text;
}

function isTextNode(node: unknown): node is string | number | bigint {
  if (typeof node === "string") return true;
  if (typeof node === "number") return true;
  return typeof node === "bigint";
}

/** Like `createRender`, but nullish values and `false` omit the element. */
export function createOptionalRender<P extends object>(
  Component: React.ElementType<P> | React.ExoticComponent<P>,
  props?: P | React.ReactNode,
  defaultProps?: P,
) {
  if (!isRenderable(props)) return null;
  return createRender(Component, props, defaultProps);
}

/**
 * Appends an optional element, such as a bar, after children. The children keep
 * their position when the element toggles, so they keep their state. Without
 * children, only the element is returned, so a void element such as an input
 * can render when the element is omitted.
 * @example
 * <a>{appendOptionalChild(props.children, barElement)}</a>
 */
export function appendOptionalChild(
  children: React.ReactNode,
  element: React.ReactNode,
) {
  if (children == null) return element;
  return React.createElement(React.Fragment, null, children, element);
}

interface SeparatorBaseProps {
  "aria-hidden"?: React.AriaAttributes["aria-hidden"];
}

/**
 * Places an optional separator before an element as its sibling, hidden from
 * assistive technologies. The separator takes the value of a `separator` prop:
 * `true`, an element, or separator props. Both keep their positions in one
 * fragment when the separator toggles, so the element keeps its state and
 * focus.
 * @example
 * return prependOptionalSeparator(TabSeparator, separator, <ak.Tab />);
 */
export function prependOptionalSeparator<P extends SeparatorBaseProps>(
  Separator: React.ComponentType<P>,
  separator: boolean | React.ReactElement | P | undefined,
  element: React.ReactNode,
) {
  const separatorElement: React.ReactElement<SeparatorBaseProps> | null =
    separator === true
      ? React.createElement(Separator)
      : createOptionalRender(Separator, separator);
  // A separator only draws a mark, so assistive technologies skip it, unless
  // the element sets aria-hidden itself. This also covers a plain element.
  const hiddenElement =
    separatorElement &&
    React.cloneElement(separatorElement, {
      "aria-hidden": separatorElement.props["aria-hidden"] ?? true,
    });
  return React.createElement(React.Fragment, null, hiddenElement, element);
}

/**
 * Creates a React element from a component and a flexible prop value, merging
 * default props and supporting an element, a props object, or plain children.
 * @example
 * const element = createRender(Component, { children: "Hi" });
 * const element = createRender(Component, <Component />);
 * const element = createRender(Component, <Component />, { children: "Hi" });
 */
export function createRender<P extends object>(
  Component: React.ElementType<P> | React.ExoticComponent<P>,
  props?: P | React.ReactNode,
  defaultProps?: P,
) {
  if (props == null || (typeof props === "object" && "then" in props)) {
    return React.createElement(Component, defaultProps);
  }
  // A fragment can't take props, so it becomes the component's children.
  if (React.isValidElement(props) && props.type === React.Fragment) {
    return React.createElement(Component, defaultProps, props);
  }
  if (React.isValidElement<any>(props)) {
    const element = props as React.ReactElement<P>;
    if (defaultProps) {
      const mergedProps = mergeProps(defaultProps, element.props);
      return React.cloneElement(element, mergedProps);
    }
    return element;
  }
  if (typeof props !== "object" || isIterable(props)) {
    return React.createElement(Component, defaultProps, props);
  }
  const mergedProps = defaultProps ? mergeProps(defaultProps, props) : props;
  return React.createElement(Component, mergedProps);
}
