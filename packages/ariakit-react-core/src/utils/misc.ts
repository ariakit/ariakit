import type {
  HTMLAttributes,
  MutableRefObject,
  ReactElement,
  RefAttributes,
  RefCallback,
} from "react";
import { isValidElement } from "react";
import { hasOwnProperty } from "@ariakit/core/utils/misc";

/**
 * Sets both a function and object React ref.
 */
export function setRef<T>(
  ref: RefCallback<T> | MutableRefObject<T> | null | undefined,
  value: T,
) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

/**
 * Checks if an element is a valid React element with a ref.
 */
export function isValidElementWithRef<P>(
  element: unknown,
): element is ReactElement<P> & RefAttributes<any> {
  if (!element) return false;
  if (!isValidElement(element)) return false;
  if (!("ref" in element)) return false;
  return true;
}

/**
 * Gets the ref property from a React element.
 */
export function getRefProperty(element: unknown) {
  if (!isValidElementWithRef(element)) return null;
  return element.ref;
}

/**
 * Merges two sets of props.
 */
export function mergeProps<T extends HTMLAttributes<any>>(
  base: T,
  overrides: T,
) {
  const props = { ...base };

  for (const key in overrides) {
    if (!hasOwnProperty(overrides, key)) continue;

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
        type EventKey = Extract<keyof HTMLAttributes<any>, `on${string}`>;
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
