import * as React from "react";

/**
 * Returns whether a value safely implements the iterable protocol.
 */
export function isIterable(obj: any): obj is Iterable<any> {
  if (obj == null) return false;
  return typeof obj[Symbol.iterator] === "function";
}

/**
 * Creates a React element from a component and a flexible prop value, merging
 * default props and supporting an element, a props object, or plain children.
 * @example
 * const element = createRender(Component, { children: "Hi" });
 * const element = createRender(Component, <Component />);
 * const element = createRender(Component, <Component />, { children: "Hi" });
 */
export function createRender<
  T extends React.ComponentType<P>,
  P extends object,
>(Component: T, props?: P | React.ReactNode, defaultProps?: P) {
  if (props == null) {
    return React.createElement(Component, defaultProps);
  }
  if (React.isValidElement<any>(props)) {
    const element = props;
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

/**
 * Merges two React props objects with special handling for className, style,
 * and event handlers (override runs before base).
 */
export function mergeProps<T extends React.HTMLAttributes<any>>(
  base: T,
  overrides: T,
) {
  const props = { ...base };

  for (const key in overrides) {
    if (!Object.hasOwn(overrides, key)) continue;

    if (key === "className") {
      const prop = "className";
      props[prop] = base[prop]
        ? `${base[prop]} ${overrides[prop]}`
        : overrides[prop];
      continue;
    }

    if (key === "style") {
      const prop = "style";
      props[prop] = base[prop]
        ? { ...base[prop], ...overrides[prop] }
        : overrides[prop];
      continue;
    }

    const overrideValue = overrides[key];

    if (typeof overrideValue === "function" && key.startsWith("on")) {
      const baseValue = base[key];
      if (typeof baseValue === "function") {
        type EventKey = Extract<keyof React.HTMLAttributes<any>, `on${string}`>;
        props[key as EventKey] = (...args) => {
          overrideValue(...args);
          baseValue(...args);
        };
        continue;
      }
    }

    props[key] = overrideValue;
  }

  return props;
}
