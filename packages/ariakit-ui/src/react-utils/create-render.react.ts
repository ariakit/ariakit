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
