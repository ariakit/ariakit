import * as React from "react";
import { isIterable } from "./is-iterable.ts";
import { mergeProps } from "./merge-props.ts";

/**
 * Creates a React element from a component and a flexible prop value, merging
 * default props and supporting an element, a props object, or plain children.
 * @example
 * const element = createRender(Component, { children: "Hi" });
 * const element = createRender(Component, <Component />);
 * const element = createRender(Component, <Component />, { children: "Hi" });
 */
export function createRender<
  T extends React.ElementType<P> | React.ExoticComponent<P>,
  P extends object,
>(Component: T, props?: P | React.ReactNode, defaultProps?: P) {
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
