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
