import * as React from "react";

export function isIterable(obj: any): obj is Iterable<any> {
  if (obj == null) return false;
  return typeof obj[Symbol.iterator] === "function";
}

export function createRenderElement<
  T extends React.ComponentType<P>,
  P extends { children?: React.ReactNode },
>(Component: T, prop?: P | React.ReactNode, defaultProps?: P) {
  if (prop == null) {
    return React.createElement(Component, defaultProps);
  }
  if (React.isValidElement(prop)) return prop;
  if (typeof prop !== "object" || isIterable(prop)) {
    return React.createElement(Component, defaultProps, prop);
  }
  return React.createElement(Component, { ...defaultProps, ...(prop as P) });
}
