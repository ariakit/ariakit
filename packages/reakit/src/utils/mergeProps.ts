import * as React from "react";
import { PickByValue } from "../_utils/types";
import extractPropFromObjects from "../_utils/extractPropFromObjects";

function mergeRefs<T>(...propsObjects: Array<{ ref?: React.Ref<T> }>) {
  const refs = extractPropFromObjects(propsObjects, "ref");
  const { length } = refs;

  if (length === 0) return {};
  if (length === 1) return { ref: refs[0] };

  // TODO: refactor
  return {
    ref: (instance: T) => {
      for (let i = 0; i < length; i += 1) {
        const ref = refs[i];
        if (typeof ref === "function") {
          ref(instance);
        } else if (ref) {
          (ref as React.MutableRefObject<T>).current = instance;
        }
      }
    }
  };
}

function mergeClassNames(...propsObjects: Array<{ className?: string }>) {
  const classNames = extractPropFromObjects(propsObjects, "className");
  if (classNames.length === 0) return {};
  return {
    className: classNames.join(" ")
  };
}

function mergeFunctions<T extends Record<string, any>>(...propsObjects: T[]) {
  const fns: Record<string, Array<(...args: any[]) => any>> = {};
  const { length } = propsObjects;

  // TODO: refactor
  for (let i = 0; i < length; i += 1) {
    const props = propsObjects[i];
    for (const key in props) {
      if (key !== "ref" && {}.hasOwnProperty.call(props, key)) {
        const value = props[key];
        if (typeof value === "function") {
          fns[key] = [...(fns[key] || []), value];
        }
      }
    }
  }

  // TODO: refactor
  return Object.keys(fns).reduce(
    (acc, key) => ({
      ...acc,
      [key]:
        fns[key].length > 1
          ? (...args: any[]) => {
              fns[key].forEach(fn => fn(...args));
            }
          : fns[key][0]
    }),
    {}
  ) as PickByValue<Required<T>, (...args: any[]) => any>;
}

function mergeStyles<T>(...propsObjects: Array<{ style?: T }>): { style?: T } {
  const styles = extractPropFromObjects(propsObjects, "style");
  if (styles.length === 0) return {};
  if (styles.length === 1) return { style: styles[0] };
  return {
    style: Object.assign({}, ...styles)
  };
}

export function mergeProps<T>(...propsObjects: T[]) {
  const allProps = Object.assign({}, ...propsObjects);
  const refProps = mergeRefs(...propsObjects);
  const classNameProps = mergeClassNames(...propsObjects);
  const functionProps = mergeFunctions(...propsObjects);
  const styleProps = mergeStyles(...propsObjects);
  return {
    ...allProps,
    ...refProps,
    ...classNameProps,
    ...functionProps,
    ...styleProps
  } as T;
}

export default mergeProps;
